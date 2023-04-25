import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ExcelService} from './services/excel.service';

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
import {FallbackComponent} from './fallback.component';
import {ShouldLoginComponent} from './should-login.component';
import {AuthGuardWithForcedLogin} from './auth/auth-guard-with-forced-login.guard';
import {ToastModule} from 'primeng/toast';
import {DocumentationComponent} from './documentation/documentation.component';
import {AccordionModule} from 'primeng/accordion';


const routes: Routes = [
    { path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'audits',
        loadChildren: () => import('./audits/audits.module').then(m => m.AuditsModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
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
    { path: 'donations',
        loadChildren: () => import('./donations/donations.module').then(m => m.DonationsModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'mailings',
        loadChildren: () => import('./mailings/mailings.module').then(m => m.MailingsModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'trips',
        loadChildren: () => import('./trips/trips.module').then(m => m.TripsModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'movements',
        loadChildren: () => import('./movements/movements.module').then(m => m.MovementsModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuardWithForcedLogin]
    },
    { path: 'documentation', component: DocumentationComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
        path: '**',
        redirectTo: '/home'
    }
];


@NgModule({
    declarations: [
        AppComponent,
        FallbackComponent,
        ShouldLoginComponent,
        DocumentationComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, {}),
        MenubarModule,
        OverlayPanelModule,
        ProgressSpinnerModule,
        MessagesModule,
        AuthModule.forRoot(),
        StoreModule.forRoot(reducers, {
            metaReducers,
            runtimeChecks: {
                strictStateImmutability: false,
                strictActionImmutability: false,
                strictActionSerializability: false,
                strictStateSerializability: false
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
        PanelModule,
        ToastModule,
        AccordionModule
    ],
    providers: [ MessageService, ExcelService,
        { provide: DefaultDataServiceConfig,
            useValue: {
                root: environment.apiUrl
            }
        }],
    bootstrap: [AppComponent]
})
export class AppModule {
}
