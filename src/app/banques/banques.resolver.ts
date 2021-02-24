import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {BanqueEntityService} from './services/banque-entity.service';
import {filter, first, tap, mergeMap} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {globalAuthState} from '../auth/auth.selectors';
import {AuthState} from '../auth/reducers';
import {Banque} from './model/banque';


@Injectable()
export class BanquesResolver implements Resolve<boolean> {

    constructor(
        private banquesService: BanqueEntityService,
        private store: Store<AppState>
    ) {}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        this.loadBanques();
        return this.banquesService.loaded$
            .pipe(
                filter(loaded => !!loaded ),
                first()
            );
    }
    private loadBanques() {
        const authenticatedUserState$ = this.store
            .pipe(
                select(globalAuthState),
                filter(authState => this.userIsPresent(authState))
            );

        const banquesNotLoaded$ = this.banquesService.loaded$
            .pipe(
                filter(loaded => !loaded)
            );

        banquesNotLoaded$
            .pipe(
                mergeMap(_ => authenticatedUserState$),
                mergeMap(authState => this.loadBanquesDependingOnUserRights(authState))
                )
            .subscribe(loadedBanques => {
            console.log('Loaded banques: ' + loadedBanques.length);
            this.banquesService.setLoaded(true);
        });
    }

    private userIsPresent(authState: AuthState): boolean {
        if (authState && authState.user) {
            return true;
        }

        return false;
    }

    private loadBanquesDependingOnUserRights(authState: AuthState): Observable<Banque[]> {
        switch (authState.user.rights) {
            case 'Bank':
            case 'Admin_Banq':
                const bankShortNameParam = { 'bankShortName': authState.banque.bankShortName.toString() };
                return this.banquesService.getWithQuery(bankShortNameParam);
            case 'admin':
                return this.banquesService.getAll();
            default:
                return of([]);
        }
    }
}
