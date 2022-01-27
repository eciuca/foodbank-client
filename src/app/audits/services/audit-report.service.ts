import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuditReport} from '../model/auditreport';

@Injectable({
    providedIn: 'root'
})
export class AuditReportService {
    private baseUrl = '/api/auditreport';

    constructor(private http: HttpClient) {
    }


    getAuditReport(accesstoken: string, reportType: String): Observable<AuditReport[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        return this.http.get<AuditReport[]>(`${this.baseUrl}/?reportType=${reportType}`, requestOptions);
    }

    getAuditReportForBank(accesstoken: string, shortBankName: string, reportType: String): Observable<AuditReport> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        return this.http.get<AuditReport>(`${this.baseUrl}/?shortBankName=${shortBankName}&reportType=${reportType}`, requestOptions);
    }
}