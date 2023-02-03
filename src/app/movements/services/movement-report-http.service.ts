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
    getMovementDailyReport(accesstoken: string, idCompany: string, lowRange:string=null, highRange:string=null,lastDays:string=null): Observable<MovementReport[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        let parmContinuationChar = '?';

        this.requestUrl = '/api/movementsdaily/';

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
            parmContinuationChar = '&';
        }
        if (lastDays) {
            this.requestUrl += parmContinuationChar + 'lastDays=' + lastDays ;
        }

        return this.http.get<MovementReport[]>(`${this.requestUrl}`, requestOptions);
    }
    getMovementReportByBank(accesstoken: string, scope: string,category:string, idCompany: string,idDepot:string=null, lowRange:string=null, highRange:string=null,lastDays:string=null): Observable<MovementReport[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        let parmContinuationChar = '?';
        if (category === 'Depot') {
            if (scope === 'monthly') {
                this.requestUrl = '/api/movementsmonthlybankdepot/';
            } else {
                this.requestUrl = '/api/movementsdailybankdepot/';
            }
        } else {
            if (scope === 'monthly') {
                this.requestUrl = '/api/movementsmonthlybank/';
            }
            else {
                this.requestUrl = '/api/movementsdailybank/';
            }
        }

        if (idCompany) {
            this.requestUrl += '?idCompany=' + idCompany;
            parmContinuationChar = '&';
        }
        if (idDepot) {
            this.requestUrl += parmContinuationChar + 'idDepot=' + idDepot;
            parmContinuationChar = '&';
        }

        if (lowRange) {
            this.requestUrl += parmContinuationChar + 'lowRange=' + lowRange ;
            parmContinuationChar = '&';
        }
        if (highRange) {
            this.requestUrl += parmContinuationChar + 'highRange=' + highRange ;
        }
        if (lastDays) {
            this.requestUrl += parmContinuationChar + 'lastDays=' + lastDays ;
        }

        return this.http.get<MovementReport[]>(`${this.requestUrl}`, requestOptions);
    }
}