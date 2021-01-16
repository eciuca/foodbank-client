import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, combineLatest} from 'rxjs';
import {User} from '../users/model/user';
import {Banque} from '../banques/model/banque';
import {map, mergeMap} from 'rxjs/operators';
import {Organisation} from '../organisations/model/organisation';
import { IAuthPrincipal, AuthPrincipal } from './auth-principal';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) {

    }

    login(idUser: string, password: string): Observable<IAuthPrincipal> {
        return this.http.get<User>(`/api/user/${idUser}`)
            .pipe(mergeMap((user) => this.createAuthPrincipalFromUser(user)));
    }

    private createAuthPrincipalFromUser(user: User): Observable<IAuthPrincipal> {
        const authBanque$ =  this.http.get<Banque>(`/api/banque/getByShortName/${user.idCompany}`);
        const authOrganisation$ =  this.http.get<Organisation>(`/api/organisation/${user.idOrg}`);

        return combineLatest([of(user), authBanque$, authOrganisation$])
                .pipe(map(([user, banque, organisation]) => new AuthPrincipal(user, banque, organisation)))
    }

}
