import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MovementReport} from '../model/movementReport';

@Injectable({
    providedIn: 'root'
})
export class MovementReportHttpService {
    private requestUrl = '';
    constructor(private http: HttpClient) {
    }
    getMovementReportByBank(accesstoken: string, scope: string, idCompany: string, lowRange:string=null, highRange:string=null): Observable<MovementReport[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        let parmContinuationChar = '?';
        if (scope === 'monthly') {
            this.requestUrl = '/api/movementsmonthlybank/';
        } else {
            this.requestUrl = '/api/movementsdailybank/';
        }
        if (idCompany) {
            this.requestUrl += '?idCompany=' + idCompany;
            parmContinuationChar = '&';
        }

        if (lowRange) {
            this.requestUrl += parmContinuationChar + 'lowRange=' + lowRange ;
            parmContinuationChar = '&';
        }
        if (highRange) {
            this.requestUrl += parmContinuationChar + 'highRange=' + highRange ;
        }

        return this.http.get<MovementReport[]>(`${this.requestUrl}`, requestOptions);
    }
}