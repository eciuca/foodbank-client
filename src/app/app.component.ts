import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ActivatedRoute, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {AppState} from './reducers';
import {globalAuthState, isLoggedIn, isLoggedOut} from './auth/auth.selectors';
import {login, logout} from './auth/auth.actions';
import {FilterMatchMode, MenuItem} from 'primeng/api';
import {IAuthPrincipal } from './auth/auth-principal';
import { AuthState } from './auth/reducers';
import { PrimeNGConfig } from 'primeng/api';
import { OAuthService, UserInfo } from 'angular-oauth2-oidc';
import { AuthService } from './auth/auth.service';

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
    menuLoggedInItems: MenuItem[] = [];
    loggedInBankName = '';
    loggedInOrganisationName = '';
    loggedInUserName = '';
    loggedInUserRole = '';

    loading = true;

    isLoggedIn$: Observable<boolean>;

    isLoggedOut$: Observable<boolean>;

    isAuthenticated: Observable<boolean>;
    isDoneLoading: Observable<boolean>;
    canActivateProtectedRoutes: Observable<boolean>;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private primengConfig: PrimeNGConfig,
        private authService: AuthService
    ) {

    }

    ngOnInit() {
        this.isAuthenticated = this.authService.isAuthenticated$;
        this.isDoneLoading = this.authService.isDoneLoading$;
        this.canActivateProtectedRoutes = this.authService.canActivateProtectedRoutes$;

        this.authService.runInitialLoginSequence();

        this.isLoggedIn$ = this.isAuthenticated;
        this.isLoggedOut$ = this.isAuthenticated.pipe(map(authenticated => !authenticated));
        
        this.store.pipe(select(globalAuthState)).subscribe(authState => this.processAuthState(authState))

        this.primengConfig.ripple = true;
        this.primengConfig.filterMatchModeOptions = {
            text: [
                FilterMatchMode.CONTAINS
            ],
            numeric: [
                FilterMatchMode.EQUALS,
                FilterMatchMode.NOT_EQUALS,
                FilterMatchMode.LESS_THAN,
                FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
                FilterMatchMode.GREATER_THAN,
                FilterMatchMode.GREATER_THAN_OR_EQUAL_TO
            ],
            date: [
                FilterMatchMode.DATE_IS,
                FilterMatchMode.DATE_IS_NOT,
                FilterMatchMode.DATE_BEFORE,
                FilterMatchMode.DATE_AFTER
            ]
        };

        const userProfileString = localStorage.getItem('user');

        // if (userProfileString && userProfileString !== 'undefined') {
        //     const userProfile: IAuthPrincipal = JSON.parse(userProfileString);
        //     const loginAction = login(userProfile);
        //     this.store.dispatch(loginAction);
        // }

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
    }

    login() { this.authService.login(); }
    refresh() { this.authService.refresh(); }
    reload() { window.location.reload(); }
    clearStorage() { localStorage.clear(); }

    logoutExternally() {
        window.open(this.authService.logoutUrl);
    }

    get hasValidToken() { return this.authService.hasValidToken(); }
    get accessToken() { return this.authService.accessToken; }
    get refreshToken() { return this.authService.refreshToken; }
    get identityClaims() { return this.authService.identityClaims; }
    get idToken() { return this.authService.idToken; }

    doLogout() {

        this.authService.logout();
        this.store.dispatch(logout());

    }

    private processAuthState(authState: AuthState) {
        console.log('processAuthState')
        // console.log('User lienbat is:', authState.user.lienBat);
        const groups: string[] = authState.groups;
        this.loggedInUserName = authState.user?.idUser;

        if (this.loggedInUserName) {
            if (groups.indexOf('bank') > -1 || groups.indexOf('admin_banq') > -1) {
                this.loggedInUserRole = 'Bank'
                this.loggedInBankName = authState.banque.bankName;
                this.loggedInOrganisationName = '';
                this.menuLoggedInItems = [
                    { label: 'My Profile', icon: 'pi pi-fw pi-user', routerLink: [`/membres/${authState.user.lienBat}`] },
                    { label: 'Banque', icon: 'pi pi-fw pi-globe', routerLink: [`/banques/${authState.banque.bankId}`] },
                    { label: 'Organisations', icon: 'pi pi-fw pi-map', routerLink: ['/organisations'] },
                    { label: 'Users', icon: 'pi pi-fw pi-users', routerLink: ['/users'] },
                    { label: 'Membres', icon: 'pi pi-fw pi-users', routerLink: ['/membres'] },
                    { label: 'Logout', icon: 'pi pi-fw pi-sign-out', command: (event) => { this.doLogout(); } }
                ];
            } else if (groups.indexOf('asso') > -1 || groups.indexOf('admin_asso') > -1) {
                this.loggedInBankName = authState.banque.bankName;
                this.loggedInOrganisationName = authState.organisation.societe;
                this.menuLoggedInItems = [
                    {label: 'My Profile', icon: 'pi pi-fw pi-user',  routerLink: [`/membres/${authState.user.lienBat}` ]},
                    {label: 'Organisation', icon: 'pi pi-fw pi-map',  routerLink: [`/organisations/${authState.organisation.idDis}` ]},
                    {label: 'Users', icon: 'pi pi-fw pi-users',  routerLink: ['/users']},
                    {label: 'Membres', icon: 'pi pi-fw pi-users',  routerLink: ['/membres']},
                    {label: 'Contacts', icon: 'pi pi-fw pi-users',  routerLink: [`/organisations/contacts/${authState.organisation.idDis}` ]},
                    {label: 'Beneficiaires', icon: 'pi pi-fw pi-map',  routerLink: ['/beneficiaires']},
                    {label: 'Logout', icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.authService.logout(); }}
                ];
            } else if (groups.indexOf('admin') > -1) {
                    this.loggedInBankName = authState.banque.bankName;
                    this.loggedInOrganisationName = '';
                    this.menuLoggedInItems = [
                        {label: 'My Profile', icon: 'pi pi-fw pi-user',  routerLink: [`/membres/${authState.user.lienBat}` ]},
                        {label: 'Banques', icon: 'pi pi-fw pi-globe',  routerLink: ['/banques']},
                        {label: 'Cpass', icon: 'pi pi-fw pi-users',  routerLink: ['/cpass']},
                        {label: 'Depots', icon: 'pi pi-fw pi-users',  routerLink: ['/depots']},
                        {label: 'Logout', icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.doLogout(); }}
                    ];
            } else {
                this.loggedInBankName = authState.banque.bankName;
                this.loggedInOrganisationName = '';
                this.menuLoggedInItems = [
                    { label: 'My Profile', icon: 'pi pi-fw pi-user', routerLink: [`/membres/${authState.user.lienBat}`] },
                    { label: 'Logout', icon: 'pi pi-fw pi-sign-out', command: (event) => { this.doLogout(); } }
                ];
            }
        }
    }
}
