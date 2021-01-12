import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../users/model/user';




@Injectable()
export class AuthService {

    constructor(private http: HttpClient) {

    }

    login(idUser: string, password: string): Observable<User> {
        return this.http.get<User>(`/api/user/${idUser}`);
       //  return this.http.post<User>('/api/login', {idUser, password});
    }

}
