import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [],
  templateUrl: './status-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBarComponent {
  label = input.required<string>();
  currentValue = input.required<number>();
  maxValue = input.required<number>();
  color = input.required<'red' | 'blue' | 'orange'>();
  size = input<'small' | 'large'>('small');

  barSizeClass = computed(() => {
    return this.size() === 'small' ? 'w-1.5 h-2.5' : 'w-3 h-4';
  });

  segmentClasses = computed(() => {
    const current = this.currentValue();
    const max = this.maxValue();
    const color = this.color();
    const classes: string[] = [];

    let activeClass = '';
    switch (color) {
      case 'red':
        activeClass = 'bg-gradient-to-b from-red-500 to-red-700 shadow-[0_0_5px_rgba(220,38,38,0.5)]';
        break;
      case 'blue':
        activeClass = 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_0_5px_rgba(59,130,246,0.5)]';
        break;
      case 'orange':
        activeClass = 'bg-gradient-to-b from-orange-400 to-orange-600 shadow-[0_0_5px_rgba(249,115,22,0.5)]';
        break;
    }
    const inactiveClass = 'bg-stone-800 border border-stone-700/50 opacity-50';

    for (let i = 0; i < max; i++) {
      classes.push(i < current ? activeClass : inactiveClass);
    }
    return classes;
  });
}