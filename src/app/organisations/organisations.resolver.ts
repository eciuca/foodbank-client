import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, first, mergeMap, tap} from 'rxjs/operators';
import {OrganisationEntityService} from './services/organisation-entity.service';

import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {loggedInUser} from '../auth/auth.selectors';

@Injectable()
export class OrganisationsResolver implements Resolve<boolean> {

    constructor(
        private organisationsService: OrganisationEntityService,
        private store: Store<AppState>
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.organisationsService.loaded$
            .pipe(
                tap( loaded => {
                    if (!loaded) {this.organisationsService.getAll(); }
                      /*  this.store
                            .pipe(
                                select(loggedInUser),
                                mergeMap((user) => {
                                    console.log('Logged In User in organisations resolver is :', user);
                                    return this.organisationsService.getWithQuery({'lienBanque': 2});
                                })
                            ).subscribe(loadedOrganisations => {
                            console.log('Loaded Organisations: ' + loadedOrganisations.length);
                            this.organisationsService.setLoaded(true);
                        });

                       */

                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
