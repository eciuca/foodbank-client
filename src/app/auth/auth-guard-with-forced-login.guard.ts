import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AppState} from '../reducers';
import {Store} from '@ngrx/store';
import {filter, switchMap, tap} from 'rxjs/operators';
import {AuthService} from './auth.service';


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
