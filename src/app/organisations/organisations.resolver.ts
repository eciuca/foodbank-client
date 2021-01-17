import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, first, mergeMap, tap} from 'rxjs/operators';
import {OrganisationEntityService} from './services/organisation-entity.service';

import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {globalAuthState} from '../auth/auth.selectors';

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
                    if (!loaded) { this.store
                        .pipe(
                            select(globalAuthState),
                            mergeMap((authState) => {
                                console.log('Logged In User is :', authState.user);
                                if (authState.user.idCompany) {
                                    switch (authState.user.rights) {
                                        case 'Bank':
                                        case 'Admin_Banq':
                                            return this.organisationsService.getWithQuery({ 'lienBanque': authState.banque.bankId.toString() });
                                        case 'Asso':
                                        case 'Admin_Asso':
                                            return this.organisationsService.getWithQuery({ 'idDis': authState.user.idOrg.toString() });
                                        default:
                                            return this.organisationsService.getAll();
                                    }

                                }

                                return this.organisationsService.getAll();
                            })
                        ).subscribe(loadedOrganisations => {
                            console.log('Loaded organisations: ' + loadedOrganisations.length);
                            this.organisationsService.setLoaded(true);
                        });
                    }
                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
