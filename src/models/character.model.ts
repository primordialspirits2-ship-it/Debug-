import { RACES, VCLASSES, BACKGROUNDS, LOCATIONS, HAVEN_UPGRADES } from './character-data';

export type Gender = 'Male' | 'Female';

// New type inferred from the RACES constant for maximum type safety
export type RaceName = typeof RACES[number]['name'];

// New type inferred from the VCLASSES constant
export type VClassName = typeof VCLASSES[number]['name'];

// New type inferred from the BACKGROUNDS constant
export type BackgroundName = typeof BACKGROUNDS[number]['name'];

// New type inferred from the LOCATIONS constant
export type LocationName = typeof LOCATIONS[number]['name'];

// New type derived from VCLASSES data for type-safe discipline actions
export type DisciplineActionName = `Unleash ${typeof VCLASSES[number]['discipline']['name']}`;

// NEW: Type for Haven upgrades, inferred from data
export type HavenUpgradeName = typeof HAVEN_UPGRADES[number]['name'];


export interface Race {
  name: RaceName;
  description: string;
}

export interface Discipline {
  name: string;
  description: string;
}

export interface VClass {
  name: VClassName;
  description: string;
  discipline: Discipline;
}

export interface Background {
  name: BackgroundName;
  description: string;
  bonus: string;
}

export interface Attributes {
  strength: number;
  dexterity: number;
  charisma: number;
  fortitude: number;
  celerity: number;
  dominate: number;
}

export interface Character {
  name: string;
  gender: Gender;
  race: Race;
  vClass: VClass;
  background: Background;
  attributes: Attributes;
  portraitUrl: string | null;
  generation: number; // NEW: Character's vampire generation
}

// New enum for type-safe storyline changes
export enum StorylineChange {
    AddInfatuatedMortal = 'ADD_INFATUATED_MORTAL',
    RemoveInfatuatedMortal = 'REMOVE_INFATUATED_MORTAL',
    AddRivalIntrigue = 'ADD_RIVAL_INTRIGUE',
    RemoveRivalIntrigue = 'REMOVE_RIVAL_INTRIGUE',
    TriggerRivalConfrontation = 'TRIGGER_RIVAL_CONFRONTATION',
    TriggerDiablerieOpportunity = 'TRIGGER_DIABLERIE_OPPORTUNITY',
    ConcludeRivalArc = 'CONCLUDE_RIVAL_ARC'
}

// New type for all possible game actions, enhancing type safety.
export type ActionName =
  // Haven
  | 'Rest and Meditate'
  | 'Study Ancient Texts'
  | 'Feed from your Thrall' // REVISED
  | 'Develop your Haven'
  | 'Cultivate Herd'
  | 'Build Library'
  | 'Build Secure Crypt'
  | 'Build Blood Cellar'
  | 'Confront Rival'
  | 'Commit Diablerie'
  | 'Walk Away'
  // Elysian Fields
  | 'Observe the Court'
  | 'Scheme with a Primogen'
  // Slums
  | 'Hunt for Blood'
  | 'Intimidate a Gang'
  | 'Establish a Hidden Lair'
  // Neon Strip
  | 'Hunt Amongst the Crowds'
  | 'Charm a Mortal'
  // Docks
  | 'Feed on a Dockworker'
  | 'Interrogate a Smuggler'
  | 'Sabotage a Rival\'s Shipment'
  | 'Investigate your Rival\'s Assets'
  // Disciplines
  | 'Unleash Aegis of Caine'
  | 'Unleash Obtenebration'
  | 'Unleash Presence'
  | 'Unleash Animalism'
  | 'Unleash Thaumaturgy'
  | 'Unleash Fortitude\'s Embrace'
  // Universal
  | 'Travel...'
  | 'Sleep until Dusk'
  // Travel actions (are also location names)
  | LocationName;


// New model for game state
export interface GameState {
    character: Character;
    blood: number; // out of 10
    humanity: number; // out of 7
    hunger: number; // out of 5
    feeds: number;
    hungerTolerance: number;
    location: Location;
    time: TimeOfDay;
    day: number;
    eventLog: string[];
    currentEvent: string;
    availableActions: ActionName[];
    isGameOver: boolean;
    gameOverMessage: string;
    hasEnthralledMortal: boolean;
    hasRivalIntrigue: boolean;
    disciplineUsed: boolean;
    // NEW state properties for new systems
    generation: number;
    influence: number;
    herdSize: number;
    havenUpgrades: HavenUpgradeName[];
    hasRivalConfrontation: boolean;
    hasDiablerieOpportunity: boolean;
    // NEW properties for Chronicle system
    memory: string[];
    chronicle: string[];
}

export interface Location {
    name: LocationName;
    description: string;
}

export type TimeOfDay = 'Dusk' | 'Midnight' | 'Pre-Dawn' | 'Day';

export interface ActionOutcome {
    outcomeDescription: string;
    bloodChange: number;
    humanityChange: number;
    hungerChange: number;
    timePassed: boolean;
    hungerToleranceChange?: number;
    storylineChange?: StorylineChange;
    // NEW outcome properties
    influenceChange?: number;
    generationChange?: number;
    herdSizeChange?: number;
    newHavenUpgrade?: HavenUpgradeName;
}
