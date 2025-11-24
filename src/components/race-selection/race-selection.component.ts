import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Race } from '../../models/character.model';
import { RACES } from '../../models/character-data';
import { CharacterCreationService } from '../../services/character-creation.service';

@Component({
  selector: 'app-race-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './race-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RaceSelectionComponent {
  private router = inject(Router);
  private creationService = inject(CharacterCreationService);

  public readonly races = RACES;
  public selectedRace = this.creationService.selectedRace;

  public description = computed(() => {
    return this.selectedRace()?.description ?? 'Select a race to reveal its history.';
  });

  onSelectRace(race: Race): void {
    if (this.selectedRace()?.name === race.name) {
      return;
    }
    this.creationService.selectedRace.set(race);
  }

  navigateBack(): void {
    this.router.navigate(['/creation/gender']);
  }

  navigateNext(): void {
    this.router.navigate(['/creation/class']);
  }
}