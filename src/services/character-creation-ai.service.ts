import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Gender, Race, VClass, Attributes, Background } from '../models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharacterCreationAiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
  }

  private getContextualBackground(race: Race, vClass: VClass): string {
    // Race-based backgrounds take precedence for more distinct visuals
    if (race.name === 'Nosferatu') {
      return 'hunched in a rain-slicked, grimy back alley of a modern city at night, with neon signs reflecting in the puddles and steam rising from a manhole cover.';
    }
    if (race.name === 'Strigoi') {
      return 'perched atop a rusting fire escape in a derelict industrial district, silhouetted against a blood-red moon hanging over the city skyline.';
    }

    // Class-based backgrounds for the more typically aristocratic Sanguine
    if (vClass.name === 'Siren') {
      return 'in a lavish, decadent nightclub with deep red velvet and soft neon lights, holding a glass of what appears to be wine.';
    }
    if (vClass.name === 'Shadowmancer') {
      return 'on a skyscraper rooftop overlooking a sprawling metropolis at night, with ethereal shadows clinging to their form like a cloak.';
    }
    if (vClass.name === 'Blood Knight') {
      return 'standing in a modern gothic penthouse apartment, with floor-to-ceiling windows showing the city of lights below, their reflection faintly visible in the glass.';
    }
    if (vClass.name === 'Alchemist') {
        return 'in a dimly lit, high-tech laboratory where strange liquids glow in intricate glassware, with holographic displays flickering in the background.';
    }
    if (vClass.name === 'Beastmaster') {
      return 'in a forgotten, overgrown city park at night, with feral animals (rats, stray dogs) visible in the shadows, their eyes glowing.';
    }
    if (vClass.name === 'Revenant') {
      return 'in a forgotten part of the city\'s underbelly, like a crumbling crypt beneath a church or a derelict subway tunnel, exuding an aura of immense resilience.';
    }

    // A good default for Sanguine and other classes
    return 'in a luxurious, high-tech haven within a modern skyscraper, overlooking the neon-drenched city at night with an air of detached superiority.';
  }

  async generatePortrait(gender: Gender, race: Race, vClass: VClass): Promise<string> {
    const background = this.getContextualBackground(race, vClass);
    const prompt = `
      Cinematic digital painting portrait of a ${gender} ${race.name} ${vClass.name} vampire, exuding power and mystique.
      The character is ${background}.
      Style: Dark fantasy meets modern gothic, hyper-realistic, highly detailed, style of Artstation, WLOP, and Greg Rutkowski.
      Mood: Mysterious, powerful, dangerous, elegant.
      Lighting: Dramatic chiaroscuro lighting, with sharp highlights from city lights or neon signs casting long shadows.
      Details: Intricate details on modern, stylish clothing that reflects their class (e.g., tailored tactical gear for a Blood Knight, high fashion for a Siren, dark academic for an Alchemist). The character should have a confident, intense gaze.
    `;

    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '3:4',
        },
      });
      
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;

    } catch (error) {
      console.error('Error generating portrait:', error);
      throw new Error(`Failed to generate portrait. The mists of creation are too thick.`);
    }
  }

  async generateInitialAttributes(gender: Gender, race: Race, vClass: VClass, background: Background): Promise<Attributes> {
    const prompt = `Based on a ${gender} ${race.name} ${vClass.name} vampire with a mortal background as a "${background.name}" in a dark fantasy RPG, generate a balanced set of starting attributes: strength, dexterity, charisma, fortitude, celerity, and dominate. The attributes should reflect their background. The total points should sum to exactly 15, with no single attribute higher than 5 or lower than 1. Return ONLY the JSON object.`;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strength: { type: Type.INTEGER },
                        dexterity: { type: Type.INTEGER },
                        charisma: { type: Type.INTEGER },
                        fortitude: { type: Type.INTEGER },
                        celerity: { type: Type.INTEGER },
                        dominate: { type: Type.INTEGER },
                    },
                    required: ['strength', 'dexterity', 'charisma', 'fortitude', 'celerity', 'dominate']
                }
            }
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        // Basic validation
        if (Object.values(result).some(val => typeof val !== 'number')) {
            throw new Error('Invalid attribute types received');
        }
        return result;
    } catch (error) {
        console.error('Error generating attributes:', error);
        throw new Error('Failed to generate attributes.');
    }
  }
}