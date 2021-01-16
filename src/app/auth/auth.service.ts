import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { User } from '../users/model/user';
import { Banque } from '../banques/model/banque';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Organisation } from '../organisations/model/organisation';
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
        const authBanque$ = !user.idCompany
            ? of(undefined)
            : this.http.get<Banque>(`/api/banque/getByShortName/${user.idCompany}`).pipe(catchError(err => this.handleNotFound(err)));

        const authOrganisation$ = user.idOrg === 0
            ? of(undefined)
            : this.http.get<Organisation>(`/api/organisation/${user.idOrg}`).pipe(catchError(err => this.handleNotFound(err)));

        return forkJoin([of(user), authBanque$, authOrganisation$])
            .pipe(map(([user, banque, organisation]) => new AuthPrincipal(user, banque, organisation)))
    }

    private handleNotFound(error: any) {
        if (error.status === 404) {
            return of(undefined);
        } else {
            //important to use the rxjs error here not the standard one
            return throwError(error);
        }
    }
}
