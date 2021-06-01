import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {filter, mergeMap} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {AppState} from './reducers';
import {globalAuthState, isLoggedIn, isLoggedOut} from './auth/auth.selectors';
import {login, logout} from './auth/auth.actions';
import {FilterMatchMode, MenuItem} from 'primeng/api';
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
    menuLoggedInItems: MenuItem[] = [];
    loggedInBankName = '';
    loggedInOrganisationName = '';
    loggedInUserName = '';
    loggedInUserRole = '';

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
        if (authState.user) {
            console.log('User lienbat is:', authState.user.lienBat);
            this.loggedInUserName =  authState.user.userName;
            this.loggedInUserRole = authState.user.rights;
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.loggedInBankName = authState.banque.bankName;
                    this.loggedInOrganisationName = '';
                    this.menuLoggedInItems = [
                        {label: $localize`:@@menuProfile:My Profile`, icon: 'pi pi-fw pi-user',  routerLink: [`/membres/${authState.user.lienBat}` ]},
                        // tslint:disable-next-line:max-line-length
                        {label: $localize`:@@menuBank:Bank`, icon: 'pi pi-fw pi-globe',  routerLink: [`/banques/${authState.banque.bankId}` ]},
                        {label: $localize`:@@menuOrganisations:Organisations`, icon: 'pi pi-fw pi-map',  routerLink: ['/organisations']},
                        {label: $localize`:@@menuEmployees:Employees`, icon: 'pi pi-fw pi-users',  routerLink: ['/membres']},
                        {label: $localize`:@@menuUsers:Users`, icon: 'pi pi-fw pi-users',  routerLink: ['/users']},
                        {label: $localize`:@@menuBeneficiaries:Beneficiaries`, icon: 'pi pi-fw pi-map',  routerLink: ['/beneficiaires']},
                        {label: $localize`:@@menuLogout:Logout`, icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.logout(); }}
                    ];

                    break;
                case 'Asso':
                case 'Admin_Asso':
                    this.loggedInBankName = authState.banque.bankName;
                    this.loggedInOrganisationName = authState.organisation.societe;
                    this.menuLoggedInItems = [
                        {label: $localize`:@@menuProfile:My Profile`, icon: 'pi pi-fw pi-user',  routerLink: [`/membres/${authState.user.lienBat}` ]},
                        {label: $localize`:@@menuOrganisation:Organisation`, icon: 'pi pi-fw pi-map',  routerLink: [`/organisations/${authState.organisation.idDis}` ]},
                        {label: $localize`:@@menuEmployees:Employees`, icon: 'pi pi-fw pi-users',  routerLink: ['/membres']},
                        {label: $localize`:@@menuUsers:Users`, icon: 'pi pi-fw pi-users',  routerLink: ['/users']},
                        {label: 'Contacts', icon: 'pi pi-fw pi-users',  routerLink: [`/organisations/contacts/${authState.organisation.idDis}` ]}
                    ];
                    if (authState.organisation && authState.organisation.gestBen) {
                        this.menuLoggedInItems.push(
                            {label: $localize`:@@menuBeneficiaries:Beneficiaries`, icon: 'pi pi-fw pi-map',  routerLink: ['/beneficiaires']}
                        );
                    }
                    this.menuLoggedInItems.push(
                        {label: $localize`:@@menuLogout:Logout`, icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.logout(); }}
                    );

                    break;
                case 'admin':
                    this.loggedInBankName = authState.banque.bankName;
                    this.loggedInOrganisationName = '';
                    this.menuLoggedInItems = [
                        {label: $localize`:@@menuProfile:My Profile`, icon: 'pi pi-fw pi-user',  routerLink: [`/membres/${authState.user.lienBat}` ]},
                        {label: $localize`:@@menuBanks:Banks`, icon: 'pi pi-fw pi-globe',  routerLink: ['/banques']},
                        {label: 'Cpass', icon: 'pi pi-fw pi-users',  routerLink: ['/cpass']},
                        {label: 'Depots', icon: 'pi pi-fw pi-users',  routerLink: ['/depots']},
                        {label: $localize`:@@menuLogout:Logout`, icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.logout(); }}
                    ];
                    break;
                default:
                    this.loggedInBankName = authState.banque.bankName;
                    this.loggedInOrganisationName = '';
                    this.menuLoggedInItems = [
                        {label: $localize`:@@menuProfile:My Profile`, icon: 'pi pi-fw pi-user',  routerLink: [`/membres/${authState.user.lienBat}` ]},
                        {label: $localize`:@@menuLogout:Logout`, icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.logout(); }}
                    ];
            }
        }
    }
}
