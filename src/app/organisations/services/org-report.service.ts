import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {OrgMemberReport} from '../model/orgmemberreport';
import {OrgBeneficiaryReport} from '../model/orgbeneficiaryreport';

@Injectable({
    providedIn: 'root'
})
export class OrgReportService {
    private baseUrl = '/api/orgreport';
    constructor(private http: HttpClient) {
    }
    getMemberReport(accesstoken: string, lienBanque: number): Observable<OrgMemberReport[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        return this.http.get<OrgMemberReport[]>(`${this.baseUrl}/members/?lienBanque=${lienBanque.toString()}`, requestOptions);
    }
    getBeneficiaryReport(accesstoken: string, lienBanque: number): Observable<OrgBeneficiaryReport[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        return this.http.get<OrgBeneficiaryReport[]>(`${this.baseUrl}/clients/?lienBanque=${lienBanque.toString()}`, requestOptions);
    }
}
