
import { ChangeDetectionStrategy, Component, computed, effect, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Attributes } from '../../models/character.model';
import { CharacterCreationService } from '../../services/character-creation.service';

// NEW: Interface for managing attribute display and state
interface AttributeDisplay {
  key: keyof Attributes;
  name: string;
  description: string;
  value: WritableSignal<number>;
}

@Component({
  selector: 'app-attribute-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attribute-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeSelectionComponent {
  private router = inject(Router);
  private creationService = inject(CharacterCreationService);

  baseAttributes = this.creationService.baseAttributes;
  isGeneratingAttributes = this.creationService.isGeneratingAttributes;
  characterName = this.creationService.characterName;

  spentPoints = signal(0);
  availablePoints = signal(3);
  private initialAttributes = signal<Attributes | null>(null);

  // NEW: Consolidated attribute management in a data-driven array
  attributes: AttributeDisplay[] = [
    { key: 'strength', name: 'Strength', description: 'Raw physical power and brutality.', value: signal(0) },
    { key: 'dexterity', name: 'Dexterity', description: 'Agility, speed, and fine motor control.', value: signal(0) },
    { key: 'charisma', name: 'Charisma', description: 'Force of personality and persuasion.', value: signal(0) },
    { key: 'fortitude', name: 'Fortitude', description: 'Resilience and resistance to harm.', value: signal(0) },
    { key: 'celerity', name: 'Celerity', description: 'Supernatural speed and reflexes.', value: signal(0) },
    { key: 'dominate', name: 'Dominate', description: 'Mental control and vampiric will.', value: signal(0) },
  ];

  currentAttributes = computed<Attributes>(() => {
    return this.attributes.reduce((acc, attr) => {
      acc[attr.key] = attr.value();
      return acc;
    }, {} as Attributes);
  });

  constructor() {
    effect(() => {
      const incomingAttrs = this.baseAttributes();
      if (incomingAttrs) {
        if (incomingAttrs !== this.initialAttributes()) {
            this.initialAttributes.set(incomingAttrs);
            this.spentPoints.set(0);
            
            // Sync local signals with new base attributes
            this.attributes.forEach(attr => {
                attr.value.set(incomingAttrs[attr.key]);
            });
        }
      }
    });

    effect(() => {
      if (this.initialAttributes()) {
        this.creationService.finalAttributes.set(this.currentAttributes());
      }
    });
  }

  onRegenerate(): void {
    this.creationService.generateAttributes();
  }

  canIncrease(currentValue: number): boolean {
    return this.spentPoints() < this.availablePoints() && currentValue < 5;
  }
  
  canDecrease(attr: AttributeDisplay): boolean {
    const baseValue = this.initialAttributes()?.[attr.key] ?? 0;
    return attr.value() > baseValue;
  }

  changeAttribute(attr: AttributeDisplay, amount: number): void {
      if (amount > 0 && !this.canIncrease(attr.value())) return;
      if (amount < 0 && !this.canDecrease(attr)) return;
      
      attr.value.update(val => val + amount);
      this.spentPoints.update(val => val + amount);
  }

  onNameInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.creationService.characterName.set(inputElement.value);
  }

  navigateBack(): void {
    this.router.navigate(['/creation/background']);
  }

  navigateNext(): void {
    this.router.navigate(['/creation/summary']);
  }
}
