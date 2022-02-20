import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
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
import { environment } from '../environments/environment';
import {HttpClient} from '@angular/common/http';

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
    baseurl: string;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private primengConfig: PrimeNGConfig,
        private authService: AuthService,
        private http: HttpClient,
        @Inject(LOCALE_ID) public locale: string
    ) {
        this.baseurl = window.location.origin;
    }

    ngOnInit() {
        this.isAuthenticated = this.authService.isAuthenticated$;
        this.isDoneLoading = this.authService.isDoneLoading$;
        this.canActivateProtectedRoutes = this.authService.canActivateProtectedRoutes$;

        this.authService.runInitialLoginSequence();

        this.isLoggedIn$ = this.isAuthenticated;
        this.isLoggedOut$ = this.isAuthenticated.pipe(map(authenticated => !authenticated));

        this.store.pipe(select(globalAuthState)).subscribe(authState => this.processAuthState(authState));

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

        // const userProfileString = localStorage.getItem('user');

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
    openFEAD() {
       const feadUrl = `${this.baseurl}/isis/general/portal/access.jsp` ;
       console.log('Opening FEAD Tab', feadUrl);
        window.open(feadUrl, '_blank');
    }


    private processAuthState(authState: AuthState) {
        console.log('User lienbat is:', authState.user?.lienBat, 'Membre Langue is ', authState.user?.membreLangue);
       // const idLanguage = authState.user?.idLanguage;
                let idLanguage = null;
        if (authState.user?.membreLangue === 1) {
            idLanguage = 'fr-FR';
        }
        if (authState.user?.membreLangue === 2) {
            idLanguage = 'nl-NL';
        }
        console.log(environment.availableLocales);
        console.log(this.locale);
        if (idLanguage && environment.availableLocales.includes(idLanguage) && idLanguage !== this.locale) {
            const url = window.location.href;
            const newLocaleUrl = url.replace(this.locale, idLanguage);
            window.location.replace(newLocaleUrl);
        }
        this.loggedInUserName = authState.user?.idUser;

        if (this.loggedInUserName) {
            this.loggedInBankName = authState.banque.bankName;
            this.loggedInOrganisationName = '';
            switch (authState.user.rights) {
                case 'Bank':
                    this.loggedInUserRole = $localize`:@@RoleBankUser:Bank User`;
                    break;
                case 'Admin_Banq':
                    this.loggedInUserRole = $localize`:@@RoleBankAdmin:Bank admin`;
                    break;
                case 'Asso':
                    this.loggedInUserRole = $localize`:@@RoleOrgUser:Org User`;
                    this.loggedInOrganisationName = authState.organisation.societe;
                    break;
                case 'Admin_Asso':
                    this.loggedInUserRole = $localize`:@@RoleOrgAdmin:Org Admin`;
                    this.loggedInOrganisationName = authState.organisation.societe;
                  break;

                case 'admin':
                    this.loggedInUserRole = $localize`:@@RoleAdmin:Global admin`;
                    this.loggedInBankName = authState.banque.bankName;
                    this.loggedInOrganisationName = '';
                    break;
                default:
                    this.loggedInBankName = authState.banque.bankName;
                    this.loggedInOrganisationName = '';
            }
            this.buildMenu(authState);

        }
    }
    private buildMenu(authState: AuthState): void {
        // home for everyone
        this.menuLoggedInItems = [
            {label: $localize`:@@menuHome:Home`, icon: 'pi pi-fw pi-home',  routerLink: ['/home' ]}
        ];
        // handle Personal Info Items
        if (['Bank', 'Admin_Banq'].includes(authState.user.rights)) {
            this.menuLoggedInItems.push(
                {label: $localize`:@@menuMyInfo:MyInfo`, icon: 'pi pi-fw pi-user',
                    items: [
                        {label: $localize`:@@menuProfile:My Profile`, icon: 'pi pi-fw pi-user',  routerLink: [`/membres/${authState.user.lienBat}` ]},
                        {label: $localize`:@@menuTrips:Trips`, icon: 'pi pi-fw pi-map',  routerLink: ['/trips']},
                    ]
                }
            );
        } else if (['Asso', 'Admin_Asso', 'admin'].includes(authState.user.rights)) {
            this.menuLoggedInItems.push(
                // tslint:disable-next-line:max-line-length
                {label: $localize`:@@menuProfile:My Profile`, icon: 'pi pi-fw pi-user',  routerLink: [`/membres/${authState.user.lienBat}` ]}
            );
        }
        // handle own bank or own organisation(s) items
        if ( ['Bank', 'Admin_Banq'].includes(authState.user.rights)) {
            this.menuLoggedInItems.push(
                {label: $localize`:@@menuBank:Bank`, icon: 'pi pi-fw pi-globe',  routerLink: [`/banques/${authState.banque.bankId}` ]},
            );
        }
        if ( authState.user.rights === 'admin') {
            this.menuLoggedInItems.push(
                {label: $localize`:@@menuBanks:Banks`, icon: 'pi pi-fw pi-globe',  routerLink: ['/banques']},
            );
        }
        // Add Depots
        if ( ['Bank', 'Admin_Banq'].includes(authState.user.rights)) {
            this.menuLoggedInItems.push(
                {label: 'Depots', icon: 'pi pi-fw pi-map', routerLink: ['/depots']}
            );
        } else if (['Asso', 'Admin_Asso'].includes(authState.user.rights)) {
            if (authState.organisation && authState.organisation.depyN === true) {
                // items for depot
                this.menuLoggedInItems.push(
                    {   label: 'Depot', icon: 'pi pi-fw pi-map', routerLink: [`/depots/${authState.organisation.idDis}`]}
                );
            }
        }
        // handle  organisation(s) items
        if (  ['admin', 'Admin_FEAD'].includes(authState.user.rights))  {
            this.menuLoggedInItems.push(
                {label: $localize`:@@menuOrganisations:Organisations`, icon: 'pi pi-fw pi-map',  routerLink: ['/organisations']},

            );
        } else if ( ['Bank', 'Admin_Banq'].includes(authState.user.rights)) {
            this.menuLoggedInItems.push(
                    {label: $localize`:@@menuOrganisations:Organisations`, icon: 'pi pi-fw pi-map',
                    items: [
                        {label: $localize`:@@menuOrganisations:Organisations`, icon: 'pi pi-fw pi-map',  routerLink: ['/organisations']},
                        {
                            label: $localize`:@@menuRegions:Regions`, icon: 'pi pi-fw pi-globe',
                            routerLink: [`/organisations/regions/${authState.user.lienBat}`]
                        },
                        {
                            label: $localize`:@@menuMemberships:Memberships`, icon: 'pi pi-fw pi-euro',
                            items: [
                                {
                                    label: $localize`:@@menuMembershipMgt:Membership Management`,
                                    icon: 'pi pi-fw pi-euro',
                                    routerLink: [`/organisations/memberships/${authState.user.lienBat}`]
                                },
                                {
                                    label: $localize`:@@menuMembershipMailing:Membership Mailing`,
                                    icon: 'pi pi-fw pi-euro',
                                    routerLink: [`/organisations/membershipmailing/${authState.user.lienBat}`]
                                }
                            ]
                        },
                        {
                            label: $localize`:@@menuOrgaudits:Audits`, icon: 'pi pi-fw pi-globe',
                            routerLink: [`/organisations/orgaudits/${authState.user.lienBat}`]
                        },
                    ]
                }
            );
        } else if ( ['Asso', 'Admin_Asso'].includes(authState.user.rights)) {
            if (authState.organisation && authState.organisation.depyN === true) {
                // organisation is depot
                this.menuLoggedInItems.push(
                   {label: $localize`:@@menuOrganisationsDepot:Orgs Depot`, icon: 'pi pi-fw pi-map',  routerLink: ['/organisations']}
                );
            } else {
                // classic organisation
                this.menuLoggedInItems.push(
                    {label: $localize`:@@menuOrganisation:Organisation`, icon: 'pi pi-fw pi-map', routerLink: [`/organisations/${authState.organisation.idDis}`]}
                );
            }
        }
       
        // handle members and users
        if ( ['Admin_Banq', 'Bank', 'Asso', 'Admin_Asso'].includes(authState.user.rights)) {
            const commonSubItems = [
                {label: $localize`:@@menuEmployees:Employees`, icon: 'pi pi-fw pi-users', routerLink: ['/membres']},
                {label: $localize`:@@menuUsers:Users`, icon: 'pi pi-fw pi-users', routerLink: ['/users']},
            ];
            if (['Admin_Banq', 'Bank'].includes(authState.user.rights)) {
                commonSubItems.push(
                    {label: $localize`:@@menuUserRights:User Rights`, icon: 'pi pi-fw pi-users', routerLink: ['/users/rights/']},
                );
            }
            if (['Asso', 'Admin_Asso'].includes(authState.user.rights)) {
                commonSubItems.push(
                    {label: 'Contacts', icon: 'pi pi-fw pi-users', routerLink: [`/organisations/contacts/${authState.organisation.idDis}`]},
                );
            }
            this.menuLoggedInItems.push(
                {
                    label: $localize`:@@menuMembers:Members`, icon: 'pi pi-fw pi-users',
                    items: commonSubItems
                }
            );
        }
          // Add Beneficiaries
            if (['Bank', 'Admin_Banq'].includes(authState.user.rights))
            {
                if (authState.user.gestBen) {
                    this.menuLoggedInItems.push(
                        {
                            label: $localize`:@@menuBeneficiaries:Beneficiaries`, icon: 'pi pi-fw pi-heart',
                            items: [
                                {
                                    label: $localize`:@@menuBenefOverview:Overview`,
                                    icon: 'pi pi-fw pi-heart',
                                    routerLink: ['/organisations/orgbenefoverview/']
                                },
                                {
                                    label: 'Details',
                                    icon: 'pi pi-fw pi-heart',
                                    routerLink: ['/beneficiaires']
                                }
                            ]
                        }
                    );
                }
            }
        if (( authState.user.rights === 'Admin_Asso' && authState.organisation.gestBen)
            || (authState.user.rights === 'Asso' && authState.organisation.gestBen && authState.user.gestBen)
        )
        {
            this.menuLoggedInItems.push(
                {
                    label: $localize`:@@menuBeneficiaries:Beneficiaries`, icon: 'pi pi-fw pi-heart', routerLink: ['/beneficiaires']
                })

        }
            // Add Donateurs
            if ( ['Bank', 'Admin_Banq'].includes(authState.user.rights) && authState.user.gestDon) {
                this.menuLoggedInItems.push(
                    {label: $localize`:@@menuDonations:Donations`, icon: 'pi pi-fw pi-heart',
                        items: [
                            {label: $localize`:@@menuDonators:Donators`, icon: 'pi pi-fw pi-users',  routerLink: [`/donations/donateurs/${authState.banque.bankId}`]},
                            {label: $localize`:@@menuGifts:Gifts`, icon: 'pi pi-fw pi-heart',  routerLink: [`/donations/dons/${authState.banque.bankId}`]},
                        ]
                    }
                );
            }
        // handle  login(s) items
        if ( ['admin', 'Admin_Banq'].includes(authState.user.rights)) {
            this.menuLoggedInItems.push(
                {label: 'Logins', icon: 'pi pi-fw pi-users',
                    items: [
                        {label: $localize`:@@menuOverview:Overview`, icon: 'pi pi-fw pi-users',  routerLink: [`/audits/auditreports/${authState.banque.bankId}`]},
                        {label: 'Logins', icon: 'pi pi-fw pi-users', routerLink: ['/audits']},
                    ]
                }
            );
        }
            // add cpass and depots for admin
            if ( authState.user.rights === 'admin') {
                this.menuLoggedInItems.push(
                    {label: 'Cpass', icon: 'pi pi-fw pi-users',  routerLink: ['/cpass']},
                    {label: 'Depots', icon: 'pi pi-fw pi-users',  routerLink: ['/depots']},
                 );
            }
            // add mailings for everyone
            this.menuLoggedInItems.push(
                {label: $localize`:@@menuMailings:Mailings`, icon: 'pi pi-fw pi-envelope',  routerLink: ['/mailings']}
            );
            /* add reports
            if (['Bank', 'Admin_Banq'].includes(authState.user.rights)) {
                this.menuLoggedInItems.push(
                    {label: $localize`:@@menuReports:Reports`, icon: 'pi pi-fw pi-map',  routerLink: [`/organisations/orgreports/${authState.banque.bankId}`]}
                );
            } else if (['Asso', 'Admin_Asso'].includes(authState.user.rights)) {
                this.menuLoggedInItems.push(
                    {label: $localize`:@@menuReports:Reports`, icon: 'pi pi-fw pi-map',  routerLink: [`/organisations/orgreport/${authState.organisation.idDis}`]}
                );
            }
            */

        // Add FEAD
        if ( authState.user.rights === 'Admin_Banq')  {
            this.menuLoggedInItems.push(
                {
                    label: 'Stock', icon: 'pi pi-fw pi-briefcase',
                    items: [
                        {
                            label: $localize`:@@menuFEADOverview:Overview`,
                            icon: 'pi pi-fw pi-map',
                            routerLink: ['/organisations/orgfeadoverview/']
                        },
                        {
                            label: $localize`:@@menuFEADApplication:Application` ,
                                 icon: 'pi pi-fw pi-briefcase',
                            command: (event) => { this.openFEAD(); }
                         },
                    ]
                 }
        );

        } else {
            if (authState.user.rights === 'Admin_FEAD' || authState.user.rights === 'Admin_EXT' ||authState.user.gestFead) {
                this.menuLoggedInItems.push(
                    {
                        label: $localize`:@@menuFEADApplication:Application` ,
                        icon: 'pi pi-fw pi-briefcase',
                        command: (event) => { this.openFEAD(); }
                    }
                );
            }
        }
            // add logout
            this.menuLoggedInItems.push(
                {label: $localize`:@@menuLogout:Logout`, icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.doLogout(); }}
            );
    }
}
