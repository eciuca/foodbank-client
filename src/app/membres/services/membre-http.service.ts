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
    getMembreReport(accesstoken: string, lienBanque: number, lienDis: number,lienDepot: number ): Observable<Membre[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if(lienDepot > 0) {
            return this.http.get<Membre[]>(`${this.baseUrl}/?lienDepot=${lienDepot.toString()}`, requestOptions);
        }
        if(lienDis > 0) {
            return this.http.get<Membre[]>(`${this.baseUrl}/?lienDis=${lienDis.toString()}`, requestOptions);
        }
        if (lienBanque) {
            return this.http.get<Membre[]>(`${this.baseUrl}/?lienBanque=${lienBanque.toString()}`, requestOptions);
        }
        else {
            return this.http.get<Membre[]>(`${this.baseUrl}/`, requestOptions);

        }
    }
}