import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { GameState, ActionOutcome, ActionName, StorylineChange, HavenUpgradeName } from '../models/character.model';

function isStorylineChange(value: any): value is StorylineChange {
  return Object.values(StorylineChange).includes(value);
}

function isHavenUpgradeName(value: any): value is HavenUpgradeName {
    return ['Library', 'Secure Crypt', 'Blood Cellar'].includes(value);
}

@Injectable({
  providedIn: 'root',
})
export class GameMasterAiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
  }

  async generateActionOutcome(gameState: GameState, action: ActionName): Promise<ActionOutcome> {
      const { character, location } = gameState;
      const { attributes } = character;
      const recentMemories = gameState.memory.length > 0
        ? `\nLong-term Memory (Significant Past Events):\n- ${gameState.memory.slice(-15).join('\n- ')}`
        : '';
      
      let prompt = `You are a dark fantasy RPG game master. The player character is ${character.name}, a ${character.gender} ${character.race.name} ${character.vClass.name} of the ${gameState.generation}th Generation.
Their mortal background was "${character.background.name}", which is described as: "${character.background.description}". This background provides them with a narrative bonus: "${character.background.bonus}". You should factor this background and bonus into your descriptions of their actions and the world's reactions to them.
Their current stats are: Strength ${attributes.strength}, Dexterity ${attributes.dexterity}, Charisma ${attributes.charisma}, Fortitude ${attributes.fortitude}, Celerity ${attributes.celerity}, Dominate ${attributes.dominate}.
They have ${gameState.blood}/10 Blood, ${gameState.humanity}/7 Humanity, and ${gameState.hunger}/5 Hunger.
Their hunger tolerance is ${gameState.hungerTolerance.toFixed(1)}.
Current game state: Influence: ${gameState.influence}, Herd Size: ${gameState.herdSize}, Haven Upgrades: ${gameState.havenUpgrades.join(', ') || 'None'}.
The current time is ${gameState.time} and they are at ${location.name}.
${recentMemories}
The player chooses to: "${action}".

Describe the outcome of this action in a single, dramatic paragraph.
Based on the character's attributes, memories, and the chosen action, determine the result. A high attribute relevant to the action should lead to a better outcome.
Then, provide the numerical changes. Hunger is a scale from 0 (sated) to 5 (ravenous). 
When time passes and the action did not involve feeding (a positive bloodChange), hunger should normally increase by 1. However, account for their hunger tolerance. With a tolerance of 0.2, there's a chance hunger doesn't increase. With a tolerance of 1.0 or higher, it should only increase on a strenuous action. Use your discretion.
Feeding should reduce hunger. High hunger should make the outcome more desperate and potentially riskier.`;
      
      if (action.startsWith('Unleash ')) {
          prompt += `\n\nSPECIAL INSTRUCTION: This is the character's unique, once-per-night Discipline. The outcome must be significant and successful, reflecting a display of supernatural power. It should not pass time unless the description makes that necessary. Ensure timePassed is false for instantaneous effects.`;
      }

      const buildActionMatch = action.match(/^Build (.*)$/);
      if (buildActionMatch) {
          const upgradeName = buildActionMatch[1] as HavenUpgradeName;
          prompt += `\n\nSPECIAL INSTRUCTION: The user is building the "${upgradeName}" for their Haven. Describe the process and the final result of this new addition. You MUST include '"newHavenUpgrade": "${upgradeName}"' in the JSON response. This action should not pass time.`;
      }
      
      if (location.name === 'The Neon Strip' && action === 'Charm a Mortal') {
          prompt += `\n\nSPECIAL INSTRUCTION: For "Charm a Mortal", if Charisma/Dominate is high (4+), there's a chance the mortal becomes a permanent part of the character's Herd. Describe this unique outcome. If this happens, include "herdSizeChange": 1 in the JSON. Also consider a "storylineChange" to "${StorylineChange.AddInfatuatedMortal}" if they become a particularly special thrall.`;
      }

      if (location.name === 'Your Haven' && action === 'Feed from your Thrall') {
          prompt += `\n\nSPECIAL INSTRUCTION: The player is summoning their special enthralled mortal. Describe a safe, controlled feeding. The mortal is subservient and unharmed, merely weakened. This provides a significant blood gain (+4), fully sates hunger (-3 or more), and has NO humanity cost. Time should NOT pass. This action concludes this specific thrall's arc, so you MUST include "storylineChange": "${StorylineChange.RemoveInfatuatedMortal}".`;
      }
       if (location.name === 'Your Haven' && action === 'Cultivate Herd') {
          prompt += `\n\nSPECIAL INSTRUCTION: The player is tending to their herd. Describe a careful, sustainable feeding that doesn't raise alarm. This is a safe way to gain blood but less efficient than hunting. It should provide a moderate blood gain (+2) and hunger reduction (-2), cost no humanity, and have a small chance to increase the herd size or grant influence. Time must pass.`;
      }

      if (location.name === 'Your Haven' && action === 'Rest and Meditate') {
        prompt += `\n\nSPECIAL INSTRUCTION: "Rest and Meditate" is a safe action at the Haven. It should NEVER pass time. It should restore 1 Blood (if not max) and increase Hunger by 1. It must not have a negative outcome. A Library upgrade should provide a better description and a small chance of gaining 1 Influence. Ensure "timePassed" is explicitly false.`;
    }

      if (location.name === 'The Elysian Fields' && action === 'Scheme with a Primogen') {
          prompt += `\n\nSPECIAL INSTRUCTION: For "Scheme with a Primogen", if Charisma/Dominate is high (4+), there is a chance they uncover a rival's plot. If this happens, describe this unique outcome narratively and add a new storyline. To represent this, you MUST include "storylineChange": "${StorylineChange.AddRivalIntrigue}". This is a non-combat, purely social/political victory.`;
      }

      if (location.name === 'The Docks' && action === 'Investigate your Rival\'s Assets') {
          prompt += `\n\nSPECIAL INSTRUCTION: The player is investigating their rival. Describe them finding something significant. This action MUST set "storylineChange": "${StorylineChange.TriggerRivalConfrontation}" to escalate the plot.`;
      }
      if (action === 'Confront Rival') {
          prompt += `\n\nSPECIAL INSTRUCTION: This is the final confrontation. Describe a dramatic battle. The player MUST be victorious, but it should be costly (e.g., blood loss). The outcome MUST set "storylineChange": "${StorylineChange.TriggerDiablerieOpportunity}".`;
      }
       if (action === 'Commit Diablerie') {
          prompt += `\n\nSPECIAL INSTRUCTION: This is the ultimate taboo. Describe the horrific, exhilarating act of consuming another vampire's soul. The outcome MUST be transformative. You MUST include "generationChange": -1, and a massive "humanityChange": -3. Also provide a significant "influenceChange": 10, as they've claimed their rival's power. This concludes the arc, so also set "storylineChange": "${StorylineChange.ConcludeRivalArc}".`;
      }
      if (action === 'Walk Away') {
          prompt += `\n\nSPECIAL INSTRUCTION: The player chooses mercy, or perhaps pragmatism. Describe them turning their back on their helpless rival. This is a moment of restraint. It should provide a large "humanityChange": 2. This concludes the arc, so also set "storylineChange": "${StorylineChange.ConcludeRivalArc}".`;
      }

      prompt += `\n\nReturn ONLY a valid JSON object.`;

      try {
          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                temperature: 0.85,
                topK: 40,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        outcomeDescription: { type: Type.STRING },
                        bloodChange: { type: Type.INTEGER },
                        humanityChange: { type: Type.INTEGER },
                        hungerChange: { type: Type.INTEGER },
                        timePassed: { type: Type.BOOLEAN },
                        hungerToleranceChange: { type: Type.NUMBER },
                        storylineChange: { type: Type.STRING },
                        influenceChange: { type: Type.INTEGER },
                        generationChange: { type: Type.INTEGER },
                        herdSizeChange: { type: Type.INTEGER },
                        newHavenUpgrade: { type: Type.STRING }
                    },
                    required: ['outcomeDescription', 'bloodChange', 'humanityChange', 'hungerChange', 'timePassed']
                }
              }
          });
          const jsonText = response.text.trim();
          const result = JSON.parse(jsonText);
          
          if (!result || typeof result.outcomeDescription !== 'string' || typeof result.bloodChange !== 'number' || typeof result.humanityChange !== 'number' || typeof result.hungerChange !== 'number' || typeof result.timePassed !== 'boolean') {
            throw new Error('Invalid outcome structure received');
          }

          if (result.storylineChange && !isStorylineChange(result.storylineChange)) {
            console.warn(`Invalid storylineChange value from AI: "${result.storylineChange}". Ignoring.`);
            result.storylineChange = undefined;
          }

          if (result.newHavenUpgrade && !isHavenUpgradeName(result.newHavenUpgrade)) {
            console.warn(`Invalid newHavenUpgrade value from AI: "${result.newHavenUpgrade}". Ignoring.`);
            result.newHavenUpgrade = undefined;
          }

          return result as ActionOutcome;
      } catch (error) {
          console.error('Error resolving player action:', error);
          throw new Error('Failed to resolve player action.');
      }
  }

  async generateMemorySummary(action: ActionName, outcomeDescription: string): Promise<string> {
      const prompt = `Based on the action "${action}" and the outcome "${outcomeDescription}", create a very concise, one-sentence memory summary in the third person for a game log. Example: "Convinced a smuggler to reveal a secret." or "Failed to intimidate a street gang." The summary should be a factual statement of what occurred. Return only the single sentence string.`;
      try {
          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { temperature: 0.2 }
          });
          return response.text.trim().replace(/"/g, ''); // Clean up quotes
      } catch (error) {
          console.error("Error generating memory summary:", error);
          return `Remembered the act of ${action}.`; // Fallback
      }
  }

  async generateChronicleEntry(gameState: GameState): Promise<string> {
      const memories = gameState.memory.slice(-15); // Use the last 15 memories for context
      if (memories.length === 0) {
          return "The night was quiet, a blur of shadows and silence. I rested, and now the hunger returns.";
      }

      const prompt = `You are the vampire ${gameState.character.name}. Write a first-person journal entry for your chronicle reflecting on the events of the past night. Use a gothic, introspective, and world-weary tone. Synthesize the following memories into a cohesive narrative paragraph.
      Memories:
      - ${memories.join('\n- ')}
      
      Reflect on your successes, failures, your struggle with the Hunger (currently ${gameState.hunger}/5), and your slipping Humanity (currently ${gameState.humanity}/7). The entry should be a single, well-written paragraph. Do not write a date or salutation like "Dear Diary". Return only the journal entry text.`;
      
      try {
          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { temperature: 0.75 }
          });
          return response.text.trim();
      } catch (error) {
          console.error("Error generating chronicle entry:", error);
          throw new Error("Failed to generate chronicle entry.");
      }
  }
}
