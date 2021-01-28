import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, first, mergeMap, tap} from 'rxjs/operators';
import {BeneficiaireEntityService} from './services/beneficiaire-entity.service';

import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {globalAuthState} from '../auth/auth.selectors';

@Injectable()
export class BeneficiairesResolver implements Resolve<boolean> {

    constructor(
        private beneficiairesService: BeneficiaireEntityService,
        private store: Store<AppState>
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.beneficiairesService.loaded$
            .pipe(
                tap( loaded => {
                    if (!loaded) { this.store
                        .pipe(
                            select(globalAuthState),
                            mergeMap((authState) => {
                                console.log('Logged In User is :', authState.user);
                                if (authState.user) {
                                    switch (authState.user.rights) {
                                        case 'Bank':
                                        case 'Admin_Banq':
                                            // tslint:disable-next-line:max-line-length
                                            return this.beneficiairesService.getWithQuery({ 'bankShortName': authState.banque.bankShortName.toString() });
                                        case 'Asso':
                                        case 'Admin_Asso':
                                            return this.beneficiairesService.getWithQuery({ 'idOrg': authState.user.idOrg.toString() });
                                        default:
                                            return this.beneficiairesService.getWithQuery({ 'bankShortName': '????' });
                                    }

                                }
                                this.beneficiairesService.clearCache();
                                return this.beneficiairesService.getWithQuery({ 'bankShortName': '????' });
                            })
                        ).subscribe(loadedBeneficiaires => {
                            console.log('Loaded beneficiaires: ' + loadedBeneficiaires.length);
                            this.beneficiairesService.setLoaded(true);
                        });
                    }
                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
