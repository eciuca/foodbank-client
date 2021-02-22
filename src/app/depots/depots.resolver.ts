import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { iif, Observable } from 'rxjs';
import { filter, first, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { DepotEntityService } from './services/depot-entity.service';

import { select, Store } from '@ngrx/store';
import { AppState } from '../reducers';
import { globalAuthState } from '../auth/auth.selectors';
import { AuthState } from '../auth/reducers';
import { Depot } from './model/depot';
import { ThrowStmt } from '@angular/compiler';

@Injectable()
export class DepotsResolver implements Resolve<boolean> {

    constructor(
        private depotsService: DepotEntityService,
        private store: Store<AppState>
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.loadDepots();

        return this.depotsService.loaded$
            .pipe(
                filter(loaded => !!loaded),
                first()
            );
    }

    private loadDepots() {
        const authenticatedUserState$ = this.store
            .pipe(
                select(globalAuthState),
                filter(authState => this.userIsPresent(authState))
            );

        const depotsNotLoaded$ = this.depotsService.loaded$
            .pipe(
                filter(loaded => !loaded)
            );

        depotsNotLoaded$
            .pipe(
                mergeMap(_ => authenticatedUserState$),
                mergeMap(authState => this.loadDepotsDependingOnUserRights(authState))
            )
            .subscribe(loadedDepots => {
                console.log('Loaded depots: ' + loadedDepots.length);
                this.depotsService.setLoaded(true);
            });
    }

    private userIsPresent(authState: AuthState): boolean {
        if (authState && authState.user) {
            return true;
        }

        return false;
    }

    private loadDepotsDependingOnUserRights(authState: AuthState): Observable<Depot[]> {
        console.log('checking authState for org');
        switch (authState.user.rights) {
            case 'Bank':
            case 'Admin_Banq':
            case 'Asso':
            case 'Admin_Asso':
                console.log('Requesting depots');
                const bankShortNameParam = { 'bankShortName': authState.banque.bankShortName.toString() };
                return this.depotsService.getWithQuery(bankShortNameParam);
            default:
                return this.depotsService.getAll();
        }
    }
}

