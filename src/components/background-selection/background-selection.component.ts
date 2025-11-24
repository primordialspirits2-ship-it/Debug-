
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Background } from '../../models/character.model';
import { BACKGROUNDS } from '../../models/character-data';
import { CharacterCreationService } from '../../services/character-creation.service';

@Component({
  selector: 'app-background-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundSelectionComponent {
  private router = inject(Router);
  private creationService = inject(CharacterCreationService);

  public readonly backgrounds = BACKGROUNDS;
  public selectedBackground = this.creationService.selectedBackground;

  onSelectBackground(background: Background): void {
    if (this.selectedBackground()?.name === background.name) {
      return;
    }
    this.creationService.selectedBackground.set(background);
  }

  navigateBack(): void {
    this.router.navigate(['/creation/class']);
  }

  navigateNext(): void {
    // Trigger attribute generation for the next step.
    this.creationService.generateAttributes();
    this.router.navigate(['/creation/attributes']);
  }
}
