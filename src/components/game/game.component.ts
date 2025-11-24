import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Character, GameState, ActionName } from '../../models/character.model';
import { GameLogicService } from '../../services/game-logic.service';
import { GameStateService } from '../../services/game-state.service';

// Layout and Child Component Imports
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { GameDashboardComponent } from '../game-dashboard/game-dashboard.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';
import { ChronicleModalComponent } from '../chronicle-modal/chronicle-modal.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    GameDashboardComponent,
    StatusBarComponent,
    ChronicleModalComponent,
  ],
  templateUrl: './game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  private gameLogicService = inject(GameLogicService);
  private gameStateService = inject(GameStateService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  
  character = this.gameStateService.activeCharacter;

  // Game state
  gameState = signal<GameState | null>(null);
  isProcessingAction = signal(false);
  showChronicle = signal(false);

  characterImage = computed<string | SafeUrl>(() => {
    const char = this.character();
    // Prioritize the generated portrait if it exists.
    if (char && char.portraitUrl) {
      return this.sanitizer.bypassSecurityTrustUrl(char.portraitUrl);
    }
    // Always return the default placeholder if no portrait was generated.
    return 'https://images.unsplash.com/photo-1529598424164-b9a3cb24a67f?q=80&w=800&auto.format&fit=crop';
  });

  constructor() {
    effect(() => {
      const char = this.character();
      if (char && !this.gameState()) {
        const initialState = this.gameLogicService.initializeGameState(char);
        this.gameState.set(initialState);
      } else if (!char) {
        this.router.navigate(['/creation/gender']);
      }
    });
  }

  startOver(): void {
    this.gameStateService.reset();
    this.router.navigate(['/creation/gender']);
  }
  
  toggleChronicle(show: boolean): void {
    this.showChronicle.set(show);
  }

  async handleAction(action: ActionName): Promise<void> {
    const currentGameState = this.gameState();
    if (!currentGameState || currentGameState.isGameOver || this.isProcessingAction()) {
      return;
    }

    this.isProcessingAction.set(true);
    try {
      let newState: GameState;
      if (action === 'Sleep until Dusk') {
          newState = await this.gameLogicService.sleepThroughDay(currentGameState);
      } else {
          newState = await this.gameLogicService.processAction(currentGameState, action);
      }
      this.gameState.set(newState);
    } finally {
      this.isProcessingAction.set(false);
    }
  }

  toRoman(num: number): string {
    const roman: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (let i of Object.keys(roman)) {
      let q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }
    return str;
  }
}
