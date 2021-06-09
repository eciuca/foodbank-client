import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import {HttpClientModule} from '@angular/common/http';

import {RouterModule, Routes} from '@angular/router';
import {AuthModule} from './auth/auth.module';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {RouterState, StoreRouterConnectingModule} from '@ngrx/router-store';

import {EffectsModule} from '@ngrx/effects';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {metaReducers, reducers} from './reducers';
import {DefaultDataServiceConfig, EntityDataModule} from '@ngrx/data';
import {MenubarModule} from 'primeng/menubar';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {MessagesModule} from 'primeng/messages';
import {MessageService} from 'primeng/api';
import {appEntityMetadata} from './app-entity.metadata';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import { FallbackComponent } from './fallback.component';
import { ShouldLoginComponent } from './should-login.component';
import { AuthGuardWithForcedLogin } from './auth/auth-guard-with-forced-login.guard';

const routes: Routes = [
    { path: 'banques',
        loadChildren: () => import('./banques/banques.module').then(m => m.BanquesModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'users',
        loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'organisations',
        loadChildren: () => import('./organisations/organisations.module').then(m => m.OrganisationsModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'beneficiaires',
        loadChildren: () => import('./beneficiaires/beneficiaires.module').then(m => m.BeneficiairesModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    {
        path: 'membres',
        loadChildren: () => import('./membres/membres.module').then(m => m.MembresModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'cpass',
        loadChildren: () => import('./cpass/cpass.module').then(m => m.CpassModule) ,
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'depots',
        loadChildren: () => import('./depots/depots.module').then(m => m.DepotsModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: '', redirectTo: '/users', pathMatch: 'full' },
    {
        path: '**',
        redirectTo: '/users'
    }
];


@NgModule({
    declarations: [
        AppComponent,
        FallbackComponent,
        ShouldLoginComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'}),
        MenubarModule,
        OverlayPanelModule,
        ProgressSpinnerModule,
        MessagesModule,
        AuthModule.forRoot(),
        StoreModule.forRoot(reducers, {
            metaReducers,
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictActionSerializability: true,
                strictStateSerializability: true
            }
        }),
        StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
        EffectsModule.forRoot([]),
        EntityDataModule.forRoot({
            entityMetadata: appEntityMetadata,
        }),
        StoreRouterConnectingModule.forRoot({
            stateKey: 'router',
            routerState: RouterState.Minimal
        }),
        ButtonModule,
        PanelModule
    ],
    providers: [ MessageService,
        { provide: DefaultDataServiceConfig,
            useValue: {
                root: environment.apiUrl
            }
        }],
    bootstrap: [AppComponent]
})
export class AppModule {
}
