import {filter, first, map, mergeMap, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {UserEntityService} from './services/user-entity.service';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState, loggedInUser} from '../auth/auth.selectors';
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
                                select(globalAuthState),
                                mergeMap((authState) => {
                                    console.log('Logged In User is :', authState.user);
                                    if (authState.user) {
                                        switch (authState.user.rights) {
                                            case 'Bank':
                                            case 'Admin_Banq':
                                                return this.usersService.getWithQuery({ 'idCompany': authState.user.idCompany });
                                            case 'Asso':
                                            case 'Admin_Asso':
                                                return this.usersService.getWithQuery({ 'idOrg': authState.user.idOrg.toString() });
                                            default:
                                                return this.usersService.getWithQuery({ 'idCompany': '????' });
                                        }

                                    }
                                    this.usersService.clearCache();
                                    return this.usersService.getWithQuery({ 'idCompany': '????' });

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
