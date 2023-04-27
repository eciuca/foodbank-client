import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Membre} from '../model/membre';

@Injectable({
    providedIn: 'root'
})
export class MembreHttpService {
    private baseUrl = '/api/membresall';
    constructor(private http: HttpClient) {
    }
    getMembreReport(accesstoken: string, queryParams: string ): Observable<Membre[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if(queryParams) {
            return this.http.get<Membre[]>(`${this.baseUrl}/?${queryParams}`, requestOptions);
        }

        else {
            return this.http.get<Membre[]>(`${this.baseUrl}/`, requestOptions);

        }
    }
}