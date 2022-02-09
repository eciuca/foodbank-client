import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Membre} from '../model/membre';

@Injectable({
    providedIn: 'root'
})
export class MembreHttpService {
    private baseUrl = '/api/membres';
    constructor(private http: HttpClient) {
    }
    getMembreReport(accesstoken: string, lienBanque: number): Observable<Membre[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        // tslint:disable-next-line:max-line-length
        return this.http.get<Membre[]>(`${this.baseUrl}/?lienBanque=${lienBanque.toString()}&offset=0&rows=999&sortOrder=1&sortField=nom`, requestOptions);
    }
}