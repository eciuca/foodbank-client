import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first, mergeMap } from 'rxjs/operators';
import { OrganisationEntityService } from './services/organisation-entity.service';

import { select, Store } from '@ngrx/store';
import { AppState } from '../reducers';
import { globalAuthState } from '../auth/auth.selectors';
import { AuthState } from '../auth/reducers';
import { Organisation } from './model/organisation';

@Injectable()
export class OrganisationsResolver implements Resolve<boolean> {

    constructor(
        private organisationsService: OrganisationEntityService,
        private store: Store<AppState>
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.loadOrganisations();

        return this.organisationsService.loaded$
            .pipe(
                filter(loaded => !!loaded),
                first()
            );
    }

    private loadOrganisations() {
        const authenticatedUserState$ = this.store
            .pipe(
                select(globalAuthState),
                filter(authState => this.userIsPresent(authState))
            );

        const organisationsNotLoaded$ = this.organisationsService.loaded$
            .pipe(
                filter(loaded => !loaded)
            );

        organisationsNotLoaded$
            .pipe(
                mergeMap(_ => authenticatedUserState$),
                mergeMap(authState => this.loadOrganisationsDependingOnUserRights(authState))
            )
            .subscribe(loadedOrganisations => {
                console.log('Loaded organisations: ' + loadedOrganisations.length);
                this.organisationsService.setLoaded(true);
            });
    }

    private userIsPresent(authState: AuthState): boolean {
        if (authState && authState.user) {
            return true;
        }
        return false;
    }

    private loadOrganisationsDependingOnUserRights(authState: AuthState): Observable<Organisation[]> {
        console.log('checking authState for org');
        switch (authState.user.rights) {
            case 'Bank':
            case 'Admin_Banq':
                console.log('Requesting organisations');
                const bankParam = { 'lienBanque': authState.banque.bankId.toString() };
                return this.organisationsService.getWithQuery(bankParam);
            case 'Asso':
            case 'Admin_Asso':
                const orgParam = { 'idDis': authState.organisation.idDis.toString() };
                return this.organisationsService.getWithQuery(orgParam);
            default:
                return null;
        }
    }
}
