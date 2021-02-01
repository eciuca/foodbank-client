import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {BanqueEntityService} from './services/banque-entity.service';
import {filter, first, tap, mergeMap} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {globalAuthState} from '../auth/auth.selectors';

@Injectable()
export class BanquesResolver implements Resolve<boolean> {

    constructor(
        private banquesService: BanqueEntityService,
        private store: Store<AppState>
    ) {}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.banquesService.loaded$
            .pipe(
                tap( loaded => {
                    if (!loaded) {
                        this.store
                            .pipe(
                                select(globalAuthState),
                                mergeMap((authState) => {
                                    if (authState && authState.user) {
                                       return this.banquesService.getAll();
                                    }
                                })
                            ).subscribe(loadedBanques => {
                            console.log('Loaded banques: ' + loadedBanques.length);
                            this.banquesService.setLoaded(true);
                        });
                    }
                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
