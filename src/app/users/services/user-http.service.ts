import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../model/user';

@Injectable({
    providedIn: 'root'
})
export class UserHttpService {
    private baseUrl = '/api/usersall';
    constructor(private http: HttpClient) {
    }
    getUserReport(accesstoken: string,  queryParams: string ): Observable<User[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if (queryParams) {
            return this.http.get<User[]>(`${this.baseUrl}/?${queryParams}`, requestOptions);
        } else {
            return this.http.get<User[]>(`${this.baseUrl}/`, requestOptions);
        }
    }
}