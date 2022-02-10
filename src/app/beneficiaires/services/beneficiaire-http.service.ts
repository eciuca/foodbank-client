import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Beneficiaire} from '../model/beneficiaire';

@Injectable({
    providedIn: 'root'
})
export class BeneficiaireHttpService {
    private baseUrl = '/api/beneficiaires';
    constructor(private http: HttpClient) {
    }
    getBeneficiaireReport(accesstoken: string, lienBanque: number): Observable<Beneficiaire[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        // tslint:disable-next-line:max-line-length
        return this.http.get<Beneficiaire[]>(`${this.baseUrl}/?actif=1&lienBanque=${lienBanque.toString()}&offset=0&rows=999&sortOrder=1&sortField=nom`, requestOptions);
    }
}