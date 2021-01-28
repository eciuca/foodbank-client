import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {AppState} from './reducers';
import {isLoggedIn, isLoggedOut} from './auth/auth.selectors';
import {login, logout} from './auth/auth.actions';
import {MenubarModule} from 'primeng/menubar';
import {MenuItem} from 'primeng/api';
import { IAuthPrincipal } from './auth/auth-principal';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    menuLogggedInItems: MenuItem[] = [];

    loading = true;

    isLoggedIn$: Observable<boolean>;

    isLoggedOut$: Observable<boolean>;

    constructor(private router: Router,
                private store: Store<AppState>) {

    }

    ngOnInit() {
        this.menuLogggedInItems = [
            {label: 'Banques', icon: 'pi pi-fw pi-globe',  routerLink: ['/banques']},
            {label: 'Users', icon: 'pi pi-fw pi-users',  routerLink: ['/users']},
            {label: 'Organisations', icon: 'pi pi-fw pi-map',  routerLink: ['/organisations']},
            {label: 'Beneficiaires', icon: 'pi pi-fw pi-map',  routerLink: ['/beneficiaires']},
            {label: 'Logout', icon: 'pi pi-fw pi-sign-out',  command: (event) => { this.logout(); }}
        ];

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

    }

    logout() {

        this.store.dispatch(logout());

    }

}
