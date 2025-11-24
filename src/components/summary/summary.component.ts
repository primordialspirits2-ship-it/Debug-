import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterCreationService } from '../../services/character-creation.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryComponent {
  private router = inject(Router);
  private creationService = inject(CharacterCreationService);
  private gameStateService = inject(GameStateService);

  gender = this.creationService.selectedGender;
  race = this.creationService.selectedRace;
  vClass = this.creationService.selectedClass;
  characterName = this.creationService.characterName;
  attributes = this.creationService.finalAttributes;
  isGeneratingPortrait = this.creationService.isGeneratingPortrait;
  generatedPortraitUrl = this.creationService.generatedPortraitUrl;
  portraitError = this.creationService.portraitGenerationError;

  generatePortrait(): void {
    this.creationService.generatePortrait();
  }

  rebirth(): void {
    this.creationService.reset();
    this.router.navigate(['/creation/gender']);
  }

  beginJourney(): void {
    const character = this.creationService.character();
    if (character) {
      this.gameStateService.activeCharacter.set(character);
      this.router.navigate(['/game']);
    }
  }
}