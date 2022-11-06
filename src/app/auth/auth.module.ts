import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StoreModule} from '@ngrx/store';
import {AuthService} from './auth.service';
import {authReducer} from './reducers';
import {EffectsModule} from '@ngrx/effects';
import {AuthEffects} from './auth.effects';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {MessageModule} from 'primeng/message';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {AuthGuardWithForcedLogin} from './auth-guard-with-forced-login.guard';
import {AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage} from 'angular-oauth2-oidc';
import {authConfig} from './auth-config';
import {authModuleConfig} from './auth-module-config';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';

// We need a factory since localStorage is not available at AOT build time
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function storageFactory(): OAuthStorage {
    return localStorage;
  }

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild([{path: 'login', component: LoginComponent}]),
        StoreModule.forFeature('auth', authReducer),
        EffectsModule.forFeature([AuthEffects]),
        HttpClientModule,
        HttpClientJsonpModule,
        OAuthModule.forRoot(),
        ButtonModule,
        FormsModule,
        PanelModule,
        MessageModule,
        DropdownModule,
        InputTextModule
    ],
    declarations: [LoginComponent],
    exports: [LoginComponent]
})
export class AuthModule {
    static forRoot(): ModuleWithProviders<AuthModule> {
        return {
            ngModule: AuthModule,
            providers: [
                AuthService,
                AuthGuardWithForcedLogin,
                { provide: AuthConfig, useValue: authConfig },
                { provide: OAuthModuleConfig, useValue: authModuleConfig },
                { provide: OAuthStorage, useFactory: storageFactory },
            ]
        }
    }

    constructor(@Optional() @SkipSelf() parentModule: AuthModule) {
        if (parentModule) {
          throw new Error('AuthModule is already loaded. Import it in the AppModule only');
        }
      }
}
