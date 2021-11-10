import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Don} from '../model/don';

@Injectable({
    providedIn: 'root'
})
export class DonHttpService {
    private baseUrl = '/api/dons';
    constructor(private http: HttpClient) {
    }
    getDonReport(accesstoken: string, lienBanque: number): Observable<Don[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        // tslint:disable-next-line:max-line-length
        return this.http.get<Don[]>(`${this.baseUrl}/?lienBanque=${lienBanque.toString()}&offset=0&rows=999&sortOrder=1&sortField=donateurNom`, requestOptions);
    }
}
