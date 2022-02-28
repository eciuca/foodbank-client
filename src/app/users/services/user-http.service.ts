import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from '../model/user';

@Injectable({
    providedIn: 'root'
})
export class UserHttpService {
    private baseUrl = '/api/usersall';
    constructor(private http: HttpClient) {
    }
    getUserReport(accesstoken: string, lienBanque: number,idOrg: number,lienBat?:number): Observable<User[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if (lienBat) {
            return this.http.get<User[]>(`${this.baseUrl}/?lienBat=${lienBat.toString()}`, requestOptions);
        }
        if(idOrg > 0) {
            return this.http.get<User[]>(`${this.baseUrl}/?idOrg=${idOrg.toString()}`, requestOptions);
        }
        if (lienBanque) {
            return this.http.get<User[]>(`${this.baseUrl}/?lienBanque=${lienBanque.toString()}`, requestOptions);
        }
        else {
            return this.http.get<User[]>(`${this.baseUrl}/`, requestOptions);

        }
    }
}