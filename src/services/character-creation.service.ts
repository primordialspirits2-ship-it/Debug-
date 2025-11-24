import { Injectable, signal, computed, inject } from '@angular/core';
import { Gender, Race, VClass, Attributes, Character, Background } from '../models/character.model';
import { CharacterCreationAiService } from './character-creation-ai.service';

@Injectable({ providedIn: 'root' })
export class CharacterCreationService {
  private characterCreationAiService = inject(CharacterCreationAiService);

  // Character state signals
  selectedGender = signal<Gender | null>(null);
  selectedRace = signal<Race | null>(null);
  selectedClass = signal<VClass | null>(null);
  selectedBackground = signal<Background | null>(null);
  characterName = signal('');
  
  // BUG FIX: Separate AI-generated base attributes from player-modified final attributes
  baseAttributes = signal<Attributes | null>(null);
  finalAttributes = signal<Attributes | null>(null);

  // Async operation states
  isGeneratingAttributes = signal(false);
  generatedPortraitUrl = signal<string | null>(null);
  isGeneratingPortrait = signal(false);
  portraitGenerationError = signal<string | null>(null);

  character = computed<Character | null>(() => {
    const gender = this.selectedGender();
    const race = this.selectedRace();
    const vClass = this.selectedClass();
    const background = this.selectedBackground();
    const name = this.characterName();
    const attributes = this.finalAttributes(); // Use the final, modified attributes
    const portraitUrl = this.generatedPortraitUrl();
    if (gender && race && vClass && name && attributes && background) {
      return { gender, race, vClass, background, name, attributes, portraitUrl, generation: 13 }; // NEW: Set starting generation
    }
    return null;
  });

  async generateAttributes(): Promise<void> {
    const gender = this.selectedGender();
    const race = this.selectedRace();
    const vClass = this.selectedClass();
    const background = this.selectedBackground();
    if (!gender || !race || !vClass || !background) return;

    this.isGeneratingAttributes.set(true);
    try {
      const attributes = await this.characterCreationAiService.generateInitialAttributes(gender, race, vClass, background);
      
      // Perform robust type and value validation before any numeric operations.
      // This prevents runtime errors if the AI returns malformed data (e.g., strings instead of numbers).
      const values = Object.values(attributes);
      if (values.some(val => typeof val !== 'number')) {
         console.warn('AI returned non-numeric attributes. Using fallback.', attributes);
         throw new Error('Invalid attribute types returned from AI');
      }

      // FIX: Cast the array to number[] after validation to resolve type errors in reduce/every.
      const sum = (values as number[]).reduce((acc, val) => acc + val, 0);
      const isValid = (values as number[]).every(val => val >= 1 && val <= 5) && sum === 15;

      if (!isValid) {
        console.warn('AI returned invalid attributes. Using fallback.', attributes);
        throw new Error('Invalid attributes generated');
      }
      
      // BUG FIX: Set both base and final attributes on generation
      this.baseAttributes.set(attributes);
      this.finalAttributes.set(attributes);
    } catch (error) {
      console.error('Failed to generate attributes:', error);
      // Provide fallback attributes on failure
      const fallback = { strength: 2, dexterity: 3, charisma: 3, fortitude: 2, celerity: 3, dominate: 2 };
      this.baseAttributes.set(fallback);
      this.finalAttributes.set(fallback);
    } finally {
      this.isGeneratingAttributes.set(false);
    }
  }

  async generatePortrait(): Promise<void> {
    const gender = this.selectedGender();
    const race = this.selectedRace();
    const vClass = this.selectedClass();

    if (!gender || !race || !vClass) {
      console.error('Cannot generate portrait without complete character details.');
      return;
    }

    this.isGeneratingPortrait.set(true);
    this.portraitGenerationError.set(null);
    try {
      const imageUrl = await this.characterCreationAiService.generatePortrait(gender, race, vClass);
      this.generatedPortraitUrl.set(imageUrl);
    } catch (error) {
      console.error('Failed to generate portrait:', error);
      this.portraitGenerationError.set('A vision could not be summoned from the ether. The mists of creation are too thick.');
      this.generatedPortraitUrl.set(null);
    } finally {
      this.isGeneratingPortrait.set(false);
    }
  }
  
  reset(): void {
    this.selectedGender.set(null);
    this.selectedRace.set(null);
    this.selectedClass.set(null);
    this.selectedBackground.set(null);
    this.characterName.set('');
    this.baseAttributes.set(null);
    this.finalAttributes.set(null);
    this.generatedPortraitUrl.set(null);
    this.isGeneratingPortrait.set(false);
    this.portraitGenerationError.set(null);
    this.isGeneratingAttributes.set(false);
  }
}
