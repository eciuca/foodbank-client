import {filter, first, mergeMap, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {UserEntityService} from './services/user-entity.service';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {loggedInUser} from '../auth/auth.selectors';
import {AppState} from '../reducers';

@Injectable()
export class UsersResolver implements Resolve<boolean> {

    constructor(
        private usersService: UserEntityService,
        private store: Store<AppState>
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.usersService.loaded$
            .pipe(
                tap( loaded => {
                    if (!loaded) {
                        this.store
                            .pipe(
                                select(loggedInUser),
                                mergeMap((user) => {
                                    console.log('Logged In User is :', user);
                                    
                                    if (user.idCompany) {
                                        return this.usersService.getWithQuery({ 'idCompany': user.idCompany });
                                    }

                                    return this.usersService.getAll();
                                })
                            ).subscribe(loadedUsers => {
                                console.log('Loaded users: ' + loadedUsers.length);
                                this.usersService.setLoaded(true);
                            });
                    }
                }),
                filter(loaded => !!loaded ),
                first()
            );
    }

}
