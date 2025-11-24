import { ChangeDetectionStrategy, Component, output, input, viewChild, ElementRef, afterNextRender, effect, inject, Injector } from '@angular/core';

@Component({
  selector: 'app-chronicle-modal',
  standalone: true,
  imports: [],
  templateUrl: './chronicle-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChronicleModalComponent {
  chronicle = input.required<string[]>();
  closeModal = output<void>();

  private contentEl = viewChild<ElementRef<HTMLDivElement>>('content');
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      // Scroll to bottom when new entries are added
      if (this.chronicle()) {
        afterNextRender(() => {
          this.scrollToBottom();
        }, { injector: this.injector });
      }
    });
  }

  private scrollToBottom(): void {
    const el = this.contentEl()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
