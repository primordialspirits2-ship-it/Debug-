import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CharacterCreationService } from '../../services/character-creation.service';

// Layout and Child Component Imports
import { MainLayoutComponent } from '../main-layout/main-layout.component';

@Component({
  selector: 'app-character-creator',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MainLayoutComponent,
  ],
  templateUrl: './character-creator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCreatorComponent {
  // Inject services and make them public for convenient template access
  public creationService = inject(CharacterCreationService);
  private sanitizer = inject(DomSanitizer);

  characterImage = computed<string | SafeUrl>(() => {
    const generated = this.creationService.generatedPortraitUrl();
    if (generated) {
      return this.sanitizer.bypassSecurityTrustUrl(generated);
    }
    // Always return the default placeholder until a portrait is explicitly generated.
    return 'https://images.unsplash.com/photo-1529598424164-b9a3cb24a67f?q=80&w=800&auto=format&fit=crop';
  });
}
