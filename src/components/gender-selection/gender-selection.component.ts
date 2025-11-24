import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Gender } from '../../models/character.model';
import { CharacterCreationService } from '../../services/character-creation.service';

@Component({
  selector: 'app-gender-selection',
  standalone: true,
  templateUrl: './gender-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenderSelectionComponent {
  private router = inject(Router);
  private creationService = inject(CharacterCreationService);

  selectGender(gender: Gender): void {
    this.creationService.selectedGender.set(gender);
    this.router.navigate(['/creation/race']);
  }
}
