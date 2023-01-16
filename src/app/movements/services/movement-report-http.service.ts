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
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        if (scope === 'monthly') {
          this.requestUrl =  '/api/movementsmonthlybank/';
        } else {
          this.requestUrl =  '/api/movementsdailybank/';
        }

        this.requestUrl+= '?idCompany=' + idCompany ;

        if (lowRange) {
            this.requestUrl += '&lowRange=' + lowRange ;
        }
        if (highRange) {
            this.requestUrl += '&highRange=' + highRange ;
        }

        return this.http.get<MovementReport[]>(`${this.requestUrl}`, requestOptions);
    }
}