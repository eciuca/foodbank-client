import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, pipe} from 'rxjs';
import {User} from '../users/model/user';
import {Banque} from '../banques/model/banque';
import {map, tap} from 'rxjs/operators';
import {Organisation} from '../organisations/model/organisation';




@Injectable()
export class AuthService {
    private authUser$: Observable<User>;
    private authBanque$: Observable<Banque> ;
    private authOrganisation$: Observable<Organisation> ;
    constructor(private http: HttpClient) {

    }

    login(idUser: string, password: string): Observable<any[]> {
        this.authUser$ = this.http.get<User>(`/api/user/${idUser}`)
            .pipe(
                map((user) => {
                    this.authBanque$ =  this.http.get<Banque>( `/api/banque/getByShortName/${user.idCompany}`);
                    this.authOrganisation$ =  this.http.get<Organisation>( `/api/òrganisation/${user.idOrg} ` );
                })
            );
         return [this.authUser$,this.authBanque$,this.authOrganisation$];
       //  return this.http.post<User>('/api/login', {idUser, password});
    }

}
