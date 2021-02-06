import {filter, first, map, mergeMap, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {MembreEntityService} from './services/membre-entity.service';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {AppState} from '../reducers';


@Injectable()
export class MembresResolver implements Resolve<boolean> {

    constructor(
        private membresService: MembreEntityService,
        private store: Store<AppState>
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.membresService.loaded$
            .pipe(
                tap( loaded => {
                    if (!loaded) {
                        this.store
                            .pipe(
                                select(globalAuthState),
                                mergeMap((authState) => {
                                    if (authState && authState.user) {
                                        switch (authState.user.rights) {
                                            case 'Bank':
                                            case 'Admin_Banq':
                                                return this.membresService.getWithQuery({ 'idCompany': authState.user.idCompany });
                                            case 'Asso':
                                            case 'Admin_Asso':
                                                return this.membresService.getWithQuery({ 'idOrg': authState.user.idOrg.toString() });
                                            default:
                                                return this.membresService.getAll();
                                        }

                                    }
                                })
                            ).subscribe(loadedMembres => {
                            console.log('Loaded membres from resolver: ' + loadedMembres.length);
                            this.membresService.setLoaded(true);
                        });
                    }
                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
