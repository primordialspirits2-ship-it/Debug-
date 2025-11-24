import { Injectable, inject } from '@angular/core';
import { Character, GameState, ActionOutcome, TimeOfDay, ActionName, StorylineChange, Location, HavenUpgradeName } from '../models/character.model';
import { TIME_CYCLE, getActionsForLocation } from '../models/game-data';
import { LOCATIONS, HAVEN_UPGRADES } from '../models/character-data';
import { GameMasterAiService } from './game-master-ai.service';

@Injectable({
  providedIn: 'root'
})
export class GameLogicService {
  private gameMasterAiService = inject(GameMasterAiService);

  initializeGameState(character: Character): GameState {
    const startingLocation = LOCATIONS[0]; // Start at Haven
    const initialState: GameState = {
      character: character,
      blood: 5,
      humanity: 7,
      hunger: 1,
      feeds: 0,
      hungerTolerance: 0,
      location: startingLocation as Location,
      time: 'Dusk' as TimeOfDay,
      day: 1,
      eventLog: [`Night falls on Day 1. The city awakens, and so do you.`],
      currentEvent: `You are in ${startingLocation.name}. ${startingLocation.description}`,
      availableActions: [],
      isGameOver: false,
      gameOverMessage: '',
      hasEnthralledMortal: false,
      hasRivalIntrigue: false,
      disciplineUsed: false,
      generation: character.generation,
      influence: 5,
      herdSize: 0,
      havenUpgrades: [],
      hasRivalConfrontation: false,
      hasDiablerieOpportunity: false,
      // NEW: Initialize chronicle state
      memory: [],
      chronicle: [],
    };
    initialState.availableActions = getActionsForLocation(startingLocation.name, initialState, 'Dusk');
    return initialState;
  }

  async processAction(currentState: GameState, action: ActionName): Promise<GameState> {
    if (action === 'Travel...') {
      return {
        ...currentState,
        currentEvent: 'The city stretches before you. Where will you go?',
        availableActions: LOCATIONS.map(l => l.name).filter(n => n !== currentState.location.name)
      };
    }

    if (action === 'Develop your Haven') {
        const availableUpgrades = HAVEN_UPGRADES.filter(u => !currentState.havenUpgrades.includes(u.name));
        if (availableUpgrades.length === 0) {
            return {
                ...currentState,
                currentEvent: 'Your Haven is fully developed for now.',
                availableActions: getActionsForLocation(currentState.location.name, currentState, currentState.time)
            };
        }
        return {
            ...currentState,
            currentEvent: `You contemplate improvements for your Haven. You have ${currentState.influence} Influence to spend.`,
            availableActions: [...availableUpgrades.map(u => `Build ${u.name}` as ActionName), 'Travel...']
        };
    }

    const buildActionMatch = action.match(/^Build (.*)$/);
    if (buildActionMatch) {
        const upgradeName = buildActionMatch[1] as HavenUpgradeName;
        const upgradeData = HAVEN_UPGRADES.find(u => u.name === upgradeName);
        if (!upgradeData || currentState.influence < upgradeData.influenceCost) {
            return {
                ...currentState,
                eventLog: [...currentState.eventLog, `> You attempt to build the ${upgradeName}, but lack the means.`],
                currentEvent: `You lack the ${upgradeData?.influenceCost} Influence required. You must accumulate more power and connections in the city.`
            };
        }
    }
    
    const newLocation = LOCATIONS.find(l => l.name === action);
    if (newLocation) {
        const tempState = { ...currentState, location: newLocation as Location };
        return {
            ...tempState,
            currentEvent: `You arrive at ${newLocation.name}. ${newLocation.description}`,
            availableActions: getActionsForLocation(newLocation.name, tempState, currentState.time)
        };
    }

    try {
      const outcome = await this.gameMasterAiService.generateActionOutcome(currentState, action);
      let newState = this.processActionOutcome(currentState, action, outcome);
      
      const memorySummary = await this.gameMasterAiService.generateMemorySummary(action, outcome.outcomeDescription);
      newState.memory = [...newState.memory, memorySummary];

      // Keep memory log from getting too large for the context window
      if (newState.memory.length > 30) {
        newState.memory = newState.memory.slice(newState.memory.length - 30);
      }
      
      return newState;

    } catch (error) {
      console.error('Error resolving player action in GameLogicService:', error);
      return {
        ...currentState,
        currentEvent: `A strange power interferes, and the outcome of your action is lost to the mists. The moment passes, unresolved.`,
      };
    }
  }

  processActionOutcome(currentState: GameState, action: ActionName, outcome: ActionOutcome): GameState {
    let newState = { ...currentState };
    newState.eventLog = [...currentState.eventLog, `> You chose to ${action}.`, outcome.outcomeDescription];
    newState.currentEvent = outcome.outcomeDescription;

    if (action.startsWith('Unleash ')) {
        newState.disciplineUsed = true;
        newState.eventLog.push(`Your powerful discipline is spent for the night.`);
    }

    switch (outcome.storylineChange) {
        case StorylineChange.AddInfatuatedMortal:
            newState.hasEnthralledMortal = true;
            newState.eventLog.push(`You feel a new, powerful connection to this mortal. They are now your thrall. This may unlock new opportunities.`);
            break;
        case StorylineChange.RemoveInfatuatedMortal:
            newState.hasEnthralledMortal = false;
            newState.eventLog.push(`Your thrall departs, the connection severed for now, leaving you sated and in control.`);
            break;
        case StorylineChange.AddRivalIntrigue:
            newState.hasRivalIntrigue = true;
            newState.eventLog.push(`You've uncovered the whispers of a plot against you. A new front has opened in the eternal Jyhad.`);
            break;
        case StorylineChange.TriggerRivalConfrontation:
            newState.hasRivalIntrigue = false;
            newState.hasRivalConfrontation = true;
            newState.eventLog.push(`The shadow war with your rival is over. Now, it is time for blood. Your rival will be at the Docks.`);
            break;
        case StorylineChange.TriggerDiablerieOpportunity:
            newState.hasRivalConfrontation = false;
            newState.hasDiablerieOpportunity = true;
            newState.eventLog.push(`You have utterly defeated your rival. Their vitae lies helpless before you, a feast for the taking. This is the ultimate taboo, but the power...`);
            break;
        case StorylineChange.ConcludeRivalArc:
            newState.hasRivalIntrigue = false;
            newState.hasRivalConfrontation = false;
            newState.hasDiablerieOpportunity = false;
            newState.eventLog.push(`You've struck a decisive blow against your rival, closing this chapter of the shadow war. But the night is long, and enemies are everywhere.`);
            break;
    }
    
    const buildActionMatch = action.match(/^Build (.*)$/);
    if (buildActionMatch && outcome.newHavenUpgrade) {
        const upgradeName = outcome.newHavenUpgrade;
        const upgradeData = HAVEN_UPGRADES.find(u => u.name === upgradeName);
        if (upgradeData) {
            newState.havenUpgrades = [...newState.havenUpgrades, upgradeName];
            newState.influence = (newState.influence || 0) - upgradeData.influenceCost;
            newState.eventLog.push(`Construction is complete. The ${upgradeName} is now a permanent part of your Haven.`);
        }
    }

    let newBlood = currentState.blood + outcome.bloodChange;
    let newHumanity = currentState.humanity + outcome.humanityChange;
    let newHunger = currentState.hunger + outcome.hungerChange;
    newState.influence = (currentState.influence || 0) + (outcome.influenceChange || 0);
    newState.generation = currentState.generation + (outcome.generationChange || 0);
    newState.herdSize = (currentState.herdSize || 0) + (outcome.herdSizeChange || 0);

    if (outcome.bloodChange > 0) {
      newState.feeds = currentState.feeds + 1;
      if (newState.feeds > 0 && newState.feeds % 10 === 0) {
        newState.hungerTolerance = Math.min(5, newState.hungerTolerance + 0.2);
        newState.eventLog.push(`Your body adapts to the eternal thirst. Your hunger tolerance has increased.`);
      }
    }

    if (outcome.hungerToleranceChange && outcome.hungerToleranceChange > 0) {
      newState.hungerTolerance = Math.min(5, newState.hungerTolerance + outcome.hungerToleranceChange);
      newState.eventLog.push(`This encounter has deeply affected you, hardening your resolve against the Beast. Your hunger tolerance has increased significantly.`);
    }

    if (newHunger >= 5 && currentState.hunger < 5) {
        newHumanity -= 1;
        newState.eventLog.push(`A wave of insatiable hunger washes over you, momentarily eclipsing your reason. Your grip on humanity slips.`);
    }
    
    newState.blood = Math.max(0, Math.min(10, newBlood));
    newState.humanity = Math.max(0, Math.min(7, newHumanity));
    newState.hunger = Math.max(0, Math.min(5, newHunger));
    newState.influence = Math.max(0, newState.influence);
    newState.herdSize = Math.max(0, newState.herdSize);

    if (outcome.timePassed) {
        const currentTimeIndex = TIME_CYCLE.indexOf(currentState.time);
        if (currentTimeIndex < TIME_CYCLE.length - 2) {
            newState.time = TIME_CYCLE[currentTimeIndex + 1];
            newState.eventLog.push(`The night deepens. It is now ${newState.time}.`);
        } else {
            newState.time = 'Day';
            newState.eventLog.push(`The sun begins to rise, its harsh light banishing the shadows. The day is for mortals.`);
            
            if (newState.location.name !== 'Your Haven') {
                newState.eventLog.push(`Caught outside your sanctum, the sun's touch sears your ancient flesh. You flee in pain and desperation back to your Haven.`);
                newState.blood = Math.max(0, newState.blood - 1);
                newState.humanity = Math.max(0, newState.humanity - 1);
                newState.location = LOCATIONS.find(l => l.name === 'Your Haven')! as Location;
                newState.currentEvent = `You barely make it back to your Haven, the sun's unforgiving rays a painful memory. You must rest and wait for night to fall again.`;
            } else {
                newState.currentEvent = `The sun rises, bathing the city in light. You are safe within your Haven, shielded from its deadly embrace.`;
            }
        }
    }

    newState.availableActions = getActionsForLocation(newState.location.name, newState, newState.time);
    
    if (newState.eventLog.length > 20) {
      newState.eventLog = newState.eventLog.slice(newState.eventLog.length - 20);
    }

    if (newState.blood <= 0) {
      return this.setGameOver(newState, 'Your blood runs dry. The Beast within awakens, a feral, mindless thing. You are lost to the Hunger.', 'You have entered a state of frenzy!');
    }
    if (newState.humanity <= 0) {
      return this.setGameOver(newState, 'The last vestiges of your mortal self have withered away. You are no longer a person, merely a monster. Your story ends here.', 'You have lost your humanity.');
    }
     if (newState.generation <= 6) {
      return this.setGameOver(newState, `You have consumed the heartsblood of the ancients. Your power is terrifying, legendary... but the thirst is now endless. You have become a force of nature, a walking apocalypse. This is not a life. It is an eternal, ravenous end.`, 'You have achieved a dark apotheosis.');
    }

    return newState;
  }

  async sleepThroughDay(currentState: GameState): Promise<GameState> {
    let newState = { ...currentState };
    
    // Generate chronicle entry for the night that just ended before advancing time
    if (newState.memory.length > 0) {
        try {
            const chronicleEntry = await this.gameMasterAiService.generateChronicleEntry(newState);
            newState.chronicle = [...newState.chronicle, `Night of Day ${currentState.day}:\n\n${chronicleEntry}`];
        } catch (error) {
            console.error("Failed to generate chronicle entry:", error);
            newState.chronicle = [...newState.chronicle, `Night of Day ${currentState.day}:\n\nThe events of this night are a blur, lost to the fog of ages.`];
        }
    }

    newState.day++;
    newState.time = 'Dusk';
    newState.disciplineUsed = false;

    let bloodGain = 1;
    if (currentState.havenUpgrades.includes('Secure Crypt')) {
        bloodGain = 2;
        newState.eventLog.push('Your Secure Crypt shields you from the sun, granting a deeper, more restorative slumber.');
    }
    
    let hungerGain = 1;
    if (currentState.havenUpgrades.includes('Blood Cellar')) {
        hungerGain = 0; // The cellar sustains you.
        newState.eventLog.push('Your Blood Cellar provides sustenance through your slumber, keeping the Beast at bay.');
    }

    newState.blood = Math.min(10, currentState.blood + bloodGain);
    newState.hunger = Math.min(5, currentState.hunger + hungerGain);
    
    if (newState.hunger >= 5 && currentState.hunger < 5) {
        newState.humanity = Math.max(0, currentState.humanity - 1);
        newState.eventLog.push(`You awaken from your day's slumber with a gnawing, desperate hunger that clouds your thoughts. Your grip on humanity weakens.`);
    }
    
    newState.eventLog.push(`You have slept through the day. Night falls on Day ${newState.day}. You feel restored.`, `Your inner power coalesces once more with the coming of the night.`);
    newState.currentEvent = `The sun has set. You are in Your Haven, ready for the new night.`;
    newState.availableActions = getActionsForLocation(newState.location.name, newState, newState.time);

    if (newState.eventLog.length > 20) {
      newState.eventLog = newState.eventLog.slice(newState.eventLog.length - 20);
    }

    return newState;
  }

  private setGameOver(state: GameState, message: string, event: string): GameState {
    return {
      ...state,
      isGameOver: true,
      gameOverMessage: message,
      currentEvent: event,
      availableActions: []
    };
  }
}
