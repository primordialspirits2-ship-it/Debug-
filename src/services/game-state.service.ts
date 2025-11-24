import { Injectable, signal } from '@angular/core';
import { Character } from '../models/character.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  /**
   * Holds the fully created character for the active game session.
   * This signal is set at the end of character creation and read by the GameComponent.
   */
  activeCharacter = signal<Character | null>(null);

  /**
   * Resets the active character state. Called when starting a new game.
   */
  reset(): void {
    this.activeCharacter.set(null);
  }
}
