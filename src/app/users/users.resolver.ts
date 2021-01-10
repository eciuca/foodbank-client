import {filter, first, map, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {UserEntityService} from './services/user-entity.service';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable()
export class UsersResolver implements Resolve<boolean> {

    constructor(
        private usersService: UserEntityService
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.usersService.loaded$
            .pipe(
                tap( loaded => {
                    if (!loaded) {this.usersService.getAll(); }
                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
