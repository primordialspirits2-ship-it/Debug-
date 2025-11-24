import { ChangeDetectionStrategy, Component, input, output, viewChild, ElementRef, effect, afterNextRender, inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState, ActionName } from '../../models/character.model';
import { StatusBarComponent } from '../status-bar/status-bar.component';

@Component({
  selector: 'app-game-dashboard',
  standalone: true,
  imports: [CommonModule, StatusBarComponent],
  templateUrl: './game-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDashboardComponent {
  gameState = input<GameState | null>();
  isProcessingAction = input(false);

  actionTaken = output<ActionName>();
  startOver = output<void>();
  viewChronicle = output<void>();

  private eventLogContainer = viewChild<ElementRef<HTMLDivElement>>('eventLogContainer');
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      // When gameState changes, the log is updated in the DOM.
      // We want to scroll to the bottom after that DOM update has completed.
      if (this.gameState()) {
        afterNextRender(() => {
          this.scrollToBottom();
        }, { injector: this.injector });
      }
    });
  }

  private scrollToBottom(): void {
    const container = this.eventLogContainer()?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
