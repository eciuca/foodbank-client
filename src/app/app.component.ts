import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {filter, mergeMap} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {AppState} from './reducers';
import {globalAuthState, isLoggedIn, isLoggedOut} from './auth/auth.selectors';
import {login, logout} from './auth/auth.actions';
import {MenuItem} from 'primeng/api';
import {IAuthPrincipal } from './auth/auth-principal';
import { AuthState } from './auth/reducers';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
// Ultima variables
    topbarTheme = 'blue';

    menuTheme = 'light';

    layoutMode = 'light';

    menuMode = 'static';

    inlineMenuPosition = 'bottom';

    inputStyle = 'filled';

    ripple = true;

    isRTL = false;
// application variables
    menuLogggedInItems: MenuItem[] = [];

    loading = true;

    isLoggedIn$: Observable<boolean>;

    isLoggedOut$: Observable<boolean>;

    constructor(private router: Router,
                private store: Store<AppState>,
                private primengConfig: PrimeNGConfig
    ) {

    }

    ngOnInit() {
        this.primengConfig.ripple = true;
        const userProfileString = localStorage.getItem('user');

        if (userProfileString && userProfileString !== 'undefined') {
            const userProfile: IAuthPrincipal = JSON.parse(userProfileString);
            const loginAction = login(userProfile);
            this.store.dispatch(loginAction);
        }

        this.router.events.subscribe(event => {
            switch (true) {
                case event instanceof NavigationStart: {
                    this.loading = true;
                    break;
                }

                case event instanceof NavigationEnd:
                case event instanceof NavigationCancel:
                case event instanceof NavigationError: {
                    this.loading = false;
                    break;
                }
                default: {
                    break;
                }
            }
        });

        this.isLoggedIn$ = this.store
            .pipe(
                select(isLoggedIn)
            );

        this.isLoggedOut$ = this.store
            .pipe(
                select(isLoggedOut)
            );

        this.isLoggedIn$.pipe(
            filter(isLoggedIn => isLoggedIn),
            mergeMap(isLoggedIn => this.store.pipe(select(globalAuthState)))
        ).subscribe(authState => this.processAuthState(authState));
    }

    logout() {

        this.store.dispatch(logout());

    }

    private processAuthState(authState: AuthState) {
        if (authState.banque) {
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.menuLogggedInItems = [
                        {label: 'Banque', icon: 'pi pi-fw pi-globe',  routerLink: [`/banques/${authState.banque.bankId}` ]},
                        {label: 'Organisations', icon: 'pi pi-fw pi-map',  routerLink: ['/organisations']},
                        {label: 'Users', icon: 'pi pi-fw pi-users',  routerLink: ['/users']},
                        {label: 'Membres', icon: 'pi pi-fw pi-users',  routerLink: ['/membres']},
                        {label: 'Logout', icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.logout(); }}
                    ];

                    break;
                case 'Asso':
                case 'Admin_Asso':
                    this.menuLogggedInItems = [
                        {label: 'Organisation', icon: 'pi pi-fw pi-map',  routerLink: [`/organisations/${authState.organisation.idDis}` ]},
                        {label: 'Users', icon: 'pi pi-fw pi-users',  routerLink: ['/users']},
                        {label: 'Membres', icon: 'pi pi-fw pi-users',  routerLink: ['/membres']},
                        {label: 'Beneficiaires', icon: 'pi pi-fw pi-map',  routerLink: ['/beneficiaires']},
                        {label: 'Logout', icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.logout(); }}
                    ];

                    break;
                default:
                    this.menuLogggedInItems = [
                        {label: 'Banques', icon: 'pi pi-fw pi-globe',  routerLink: ['/banques']},
                        {label: 'Users', icon: 'pi pi-fw pi-users',  routerLink: ['/users']},
                        {label: 'Membres', icon: 'pi pi-fw pi-users',  routerLink: ['/membres']},
                        {label: 'Organisations', icon: 'pi pi-fw pi-map',  routerLink: ['/organisations']},
                        {label: 'Logout', icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.logout(); }}
                    ];

            }
        }
    }

}
