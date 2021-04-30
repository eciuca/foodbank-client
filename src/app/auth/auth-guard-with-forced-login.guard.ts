import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppState } from '../reducers';
import { select, Store } from '@ngrx/store';
import { isLoggedIn } from './auth.selectors';
import { filter, switchMap, tap } from 'rxjs/operators';
import { login, logout } from './auth.actions';
import { AuthService } from './auth.service';


@Injectable()
export class AuthGuardWithForcedLogin implements CanActivate {

    constructor(
        private store: Store<AppState>,
        private authService: AuthService,
        private router: Router) {

    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> {

        console.log('AUTH GUARD WITH FORCED LOGIN TRIGGERED');
        return this.authService.isDoneLoading$.pipe(
            // return of(true).pipe(
            filter(isDone => {
                console.log('is done: ' + isDone)
                return isDone
            }),
            switchMap(_ => this.authService.isAuthenticated$),
            tap(isAuthenticated => {
                console.log('authenticated: ' + isAuthenticated);
                return isAuthenticated || this.authService.login(state.url);
            }),
        );

        // return this.store
        // .pipe(
        //     select(isLoggedIn),
        //     tap(loggedIn => {
        //         if (!loggedIn) {
        //             this.router.navigateByUrl('/login');
        //         }
        //     })
        // )
    }

}
