import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, first, map, tap} from 'rxjs/operators';
import {OrganisationEntityService} from './services/organisation-entity.service';

@Injectable()
export class OrganisationsResolver implements Resolve<boolean> {

    constructor(
        private organisationsService: OrganisationEntityService
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.organisationsService.loaded$
            .pipe(
                tap( loaded => {
                    if (!loaded) {this.organisationsService.getAll(); }
                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
