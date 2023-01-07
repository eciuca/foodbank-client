import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MovementReport} from '../model/movementReport';

@Injectable({
    providedIn: 'root'
})
export class MovementReportHttpService {
    private baseUrl = '/api/movements';
    constructor(private http: HttpClient) {
    }
    getMovementReport(accesstoken: string, idCompany: string, lienDis: number): Observable<MovementReport[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        if(lienDis > 0) {
            return this.http.get<MovementReport[]>(`${this.baseUrl}/?lienDis=${lienDis.toString()}`, requestOptions);
        }
        if (idCompany) {
            return this.http.get<MovementReport[]>(`${this.baseUrl}/?idCompany=${idCompany}`, requestOptions);
        }
        else {
            return this.http.get<MovementReport[]>(`${this.baseUrl}/`, requestOptions);
        }
    }
}