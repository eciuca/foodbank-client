import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Membre} from '../model/membre';

@Injectable({
    providedIn: 'root'
})
export class MembreHttpService {
    private baseUrl = '/api/membresall';
    constructor(private http: HttpClient) {
    }
    getMembreReport(accesstoken: string, lienBanque: number): Observable<Membre[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        // tslint:disable-next-line:max-line-length
        if (lienBanque) {
            return this.http.get<Membre[]>(`${this.baseUrl}/?actif=1&lienBanque=${lienBanque.toString()}`, requestOptions);
        }
        else {
            return this.http.get<Membre[]>(`${this.baseUrl}/?actif=1`, requestOptions);

        }
    }
}