import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {BanqueEntityService} from './services/banque-entity.service';
import {filter, first, map, tap} from 'rxjs/operators';

@Injectable()
export class BanquesResolver implements Resolve<boolean> {

    constructor(
        private banquesService: BanqueEntityService
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.banquesService.loaded$
            .pipe(
                tap( loaded => {
                    if (!loaded) {this.banquesService.getAll(); }
                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
