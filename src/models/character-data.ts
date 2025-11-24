import { Race, Background, Location } from "./character.model";

export const RACES = [
  { name: 'Sanguine', description: 'Elegant and aristocratic, the Sanguine move through mortal society with ease, their charm and beauty a dangerous mask for the predator within.' },
  { name: 'Nosferatu', description: 'Cursed with monstrous forms, the Nosferatu lurk in the shadows and sewers, gathering secrets from the forgotten places of the city. They are masters of stealth and information.' },
  { name: 'Strigoi', description: 'Feral and bestial, the Strigoi are closer to the Beast than any other kin. They are terrifying hunters, their bodies twisted into weapons of primal fury.' },
] as const;

// FIX: Removed the explicit `: readonly VClass[]` type annotation to break a circular dependency.
// TypeScript can now infer the type of VCLASSES from the data, which allows VClassName
// to be derived correctly in character.model.ts.
export const VCLASSES = [
  { name: 'Blood Knight', description: 'Warriors of the eternal night, they treat combat as a grim art form. They are masters of physical conflict, their bodies honed into perfect weapons.', discipline: { name: 'Aegis of Caine', description: 'Instantly harden your flesh into a stone-like carapace, granting immense resilience against physical harm for a short duration.' } },
  { name: 'Shadowmancer', description: 'These vampires command the very darkness, weaving shadows into tangible weapons and cloaks of invisibility. They are spies and assassins without peer.', discipline: { name: 'Obtenebration', description: 'Coalesce the very shadows around you into a tangible, suffocating darkness that can terrify mortals and obscure you from sight.' } },
  { name: 'Siren', description: 'Their power lies not in brute force, but in irresistible allure. Sirens can bend the will of mortals and lesser vampires, turning enemies into puppets and admirers into devoted thralls.', discipline: { name: 'Presence', description: 'Channel your supernatural allure to overwhelm the senses of all mortals in your immediate vicinity, leaving them in a state of stunned adoration.' } },
  { name: 'Beastmaster', description: 'Connected to the primal spirit of the city\'s fauna, Beastmasters command vermin and strays. They are lords of the urban jungle, their spies lurking in every alley.', discipline: { name: 'Animalism', description: 'Assert your dominance over the lesser creatures of the city, summoning a swarm of vermin to reveal secrets, create diversions, or attack your foes.' } },
  { name: 'Alchemist', description: 'Scholars of the vitae, they manipulate their own blood to create potent effects, from enhancing their abilities to concocting arcane poisons. Their power is subtle but profound.', discipline: { name: 'Thaumaturgy', description: 'Transmute a portion of your own vitae into a potent elixir, a draught of liquid power that can temporarily heighten one of your core attributes to a superhuman level.' } },
  { name: 'Revenant', description: 'Possessing an unholy resilience, Revenants can withstand punishment that would destroy other vampires. They are tireless and implacable, their will to survive made manifest.', discipline: { name: 'Fortitude\'s Embrace', description: 'Enter a death-like trance, focusing your will to mend grievous wounds and purge physical frailties, restoring your body to an unholy wholeness.' } },
] as const;

export const BACKGROUNDS = [
  { name: 'Exiled Noble', description: 'Born to power and privilege, you lost it all. You carry an air of aristocracy and a bitter grudge.', bonus: 'Your aristocratic bearing makes you naturally influential in high society.' },
  { name: 'Street Urchin', description: 'You grew up in the gutters, surviving on scraps and cunning. You are resilient, resourceful, and invisible to the powerful.', bonus: 'You know the city\'s hidden paths and forgotten places like the back of your hand.' },
  { name: 'Occult Scholar', description: 'You dedicated your mortal life to forbidden knowledge. You sought power in dusty tomes and found it in the blood.', bonus: 'You possess a deep understanding of supernatural lore and rituals.' },
  { name: 'Corporate Drone', description: 'Trapped in a soullless job, you were a ghost in the machine long before you died. You understand systems, exploitation, and how to go unnoticed.', bonus: 'You are adept at going unnoticed and navigating bureaucratic systems.' },
  { name: 'Ex-Military', description: 'You were a soldier, defined by discipline and violence. The transition to this new, secret war was almost seamless.', bonus: 'Your training allows you to remain calm under pressure, resisting the Beast\'s frenzy.' },
  { name: 'Failed Artist', description: 'You lived for passion and beauty, but the world was indifferent. Your eternal unlife is a canvas for the torment and ecstasy you once craved.', bonus: 'Your passionate soul allows you to connect with or manipulate the emotions of mortals more easily.' }
] as const;

export const LOCATIONS = [
  { name: 'Your Haven', description: 'A place of safety and quiet contemplation. The scent of dust and dried roses hangs in the air.' },
  { name: 'The Elysian Fields', description: 'The opulent heart of the city\'s vampire society. A high-stakes game of politics and power plays out in lavish, velvet-draped salons.' },
  { name: 'The Industrial Slums', description: 'A maze of rusted factories and desperate mortals. The air is thick with smog and the tang of spilled blood. A dangerous but plentiful hunting ground.' },
  { name: 'The Neon Strip', description: 'A vibrant, chaotic artery of mortal nightlife. Kine flock here for fleeting pleasures, their pulses a deafening drumbeat to the hungry ear.' },
  { name: 'The Docks', description: 'The salt-choked air hangs heavy with the smell of fish and decay. Here, forgotten cargo containers rust under the pale moonlight, and shadows cling to every corner.' },
] as const;

// NEW: Interface for Haven upgrades to avoid circular dependencies
export interface HavenUpgrade {
    name: 'Library' | 'Secure Crypt' | 'Blood Cellar';
    description: string;
    influenceCost: number;
}

// NEW: Data for available Haven upgrades
export const HAVEN_UPGRADES: readonly HavenUpgrade[] = [
  { name: 'Library', description: 'Unlocks deeper secrets when Studying Ancient Texts.', influenceCost: 15 },
  { name: 'Secure Crypt', description: 'A fortified resting place. You recover more Blood when you Sleep until Dusk.', influenceCost: 10 },
  { name: 'Blood Cellar', description: 'A refrigerated store of vitae. Provides a small buffer against nightly hunger.', influenceCost: 20 },
] as const;
