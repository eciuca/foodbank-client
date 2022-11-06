import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuditReport} from '../model/auditreport';
import {QueryParams} from '@ngrx/data';

@Injectable({
    providedIn: 'root'
})
export class AuditReportService {
    private baseUrl = '/api/auditreport';

    constructor(private http: HttpClient) {
    }


    getAuditReport(accesstoken: string, reportFilter: QueryParams): Observable<AuditReport[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        const queryParams = Object.keys(reportFilter).map(key => key + '=' + reportFilter[key]).join('&');
        return this.http.get<AuditReport[]>(`${this.baseUrl}/?${queryParams}`, requestOptions);
    }


}