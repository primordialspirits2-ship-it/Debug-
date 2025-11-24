import { Routes } from '@angular/router';
import { CharacterCreatorComponent } from './components/character-creator/character-creator.component';
import { GameComponent } from './components/game/game.component';
import { GenderSelectionComponent } from './components/gender-selection/gender-selection.component';
import { RaceSelectionComponent } from './components/race-selection/race-selection.component';
import { ClassSelectionComponent } from './components/class-selection/class-selection.component';
import { BackgroundSelectionComponent } from './components/background-selection/background-selection.component';
import { AttributeSelectionComponent } from './components/attribute-selection/attribute-selection.component';
import { SummaryComponent } from './components/summary/summary.component';

export const routes: Routes = [
    {
        path: 'creation',
        component: CharacterCreatorComponent,
        // The individual creation steps are child routes, rendered inside the CharacterCreatorComponent's router-outlet
        children: [
            { path: 'gender', component: GenderSelectionComponent },
            { path: 'race', component: RaceSelectionComponent },
            { path: 'class', component: ClassSelectionComponent },
            { path: 'background', component: BackgroundSelectionComponent },
            { path: 'attributes', component: AttributeSelectionComponent },
            { path: 'summary', component: SummaryComponent },
            // Redirect any other 'creation' sub-path to the beginning
            { path: '**', redirectTo: 'gender', pathMatch: 'full' }
        ]
    },
    {
        path: 'game',
        component: GameComponent
    },
    // Default route redirects to the first step of character creation
    {
        path: '',
        redirectTo: '/creation/gender',
        pathMatch: 'full'
    },
    // Wildcard route for any other path
    {
        path: '**',
        redirectTo: '/creation/gender'
    }
];
