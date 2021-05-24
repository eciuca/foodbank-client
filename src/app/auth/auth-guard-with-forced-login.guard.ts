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

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.authService.isDoneLoading$.pipe(
            filter(isDone => isDone),
            switchMap(_ => this.authService.isAuthenticated$),
            tap(isAuthenticated => isAuthenticated || this.authService.login(state.url)),
        );
    }

}
