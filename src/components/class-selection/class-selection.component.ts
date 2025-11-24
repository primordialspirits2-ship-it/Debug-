import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VClass } from '../../models/character.model';
import { VCLASSES } from '../../models/character-data';
import { CharacterCreationService } from '../../services/character-creation.service';

@Component({
  selector: 'app-class-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './class-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassSelectionComponent {
  private router = inject(Router);
  private creationService = inject(CharacterCreationService);

  public readonly classes = VCLASSES;
  public selectedClass = this.creationService.selectedClass;

  public description = computed(() => {
    return this.selectedClass()?.description ?? 'Select a class to learn its dark secrets.';
  });

  onSelectClass(vClass: VClass): void {
    if (this.selectedClass()?.name === vClass.name) {
      return;
    }
    this.creationService.selectedClass.set(vClass);
  }

  navigateBack(): void {
    this.router.navigate(['/creation/race']);
  }

  navigateNext(): void {
    this.router.navigate(['/creation/background']);
  }
}