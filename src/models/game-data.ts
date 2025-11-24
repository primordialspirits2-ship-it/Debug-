import { TimeOfDay, LocationName, ActionName, GameState } from "./character.model";
import { LOCATIONS, HAVEN_UPGRADES } from './character-data';

export const TIME_CYCLE: TimeOfDay[] = ['Dusk', 'Midnight', 'Pre-Dawn', 'Day'];

export const getActionsForLocation = (locationName: LocationName, state: GameState, time: TimeOfDay = 'Dusk'): ActionName[] => {
    if (state.hasDiablerieOpportunity) {
        return ['Commit Diablerie', 'Walk Away'];
    }

    if (time === 'Day') {
        if (locationName === 'Your Haven') {
            return ['Sleep until Dusk'];
        }
        return []; // No actions available if caught outside during the day
    }

    switch(locationName) {
        case 'Your Haven':
            const baseActions: ActionName[] = ['Rest and Meditate', 'Study Ancient Texts', 'Develop your Haven'];
            if (state.hasEnthralledMortal) {
                baseActions.push('Feed from your Thrall');
            }
            if (state.herdSize > 0) {
                baseActions.push('Cultivate Herd');
            }
            if (!state.disciplineUsed) {
                const disciplineAction = `Unleash ${state.character.vClass.discipline.name}` as ActionName;
                baseActions.push(disciplineAction);
            }
            baseActions.push('Travel...');
            return baseActions;
        case 'The Elysian Fields':
            return ['Observe the Court', 'Scheme with a Primogen', 'Travel...'];
        case 'The Industrial Slums':
            return ['Hunt for Blood', 'Intimidate a Gang', 'Establish a Hidden Lair', 'Travel...'];
        case 'The Neon Strip':
            return ['Hunt Amongst the Crowds', 'Charm a Mortal', 'Travel...'];
        case 'The Docks': {
            const actions: ActionName[] = ['Feed on a Dockworker', 'Interrogate a Smuggler', 'Sabotage a Rival\'s Shipment'];
            if (state.hasRivalIntrigue) {
                actions.push('Investigate your Rival\'s Assets');
            }
            if (state.hasRivalConfrontation) {
                actions.push('Confront Rival');
            }
            actions.push('Travel...');
            return actions;
        }
        default:
            return ['Travel...'];
    }
}
