import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BanqueOrgReport} from '../model/banqueOrgReport';
import {BanqueCount} from '../model/banqueCount';

@Injectable({
    providedIn: 'root'
})
export class BanqueReportService {

    constructor(private http: HttpClient) {
    }
    getOrgReport(accesstoken: string): Observable<BanqueOrgReport[]> {
        const baseUrl = '/api/banqueOrgReport';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        return this.http.get<BanqueOrgReport[]>(`${baseUrl}/`, requestOptions);
    }
    getOrgCountReport(accesstoken: string,hasBirbCode: boolean): Observable<BanqueCount[]> {
        const baseUrl = '/api/banqueOrgCount';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if ( hasBirbCode) {
            return this.http.get<BanqueCount[]>(`${baseUrl}/?hasBirbCode=1`, requestOptions);
        }
        return this.http.get<BanqueCount[]>(`${baseUrl}/`, requestOptions);
    }
    getMembreCountReport(accesstoken: string): Observable<BanqueCount[]> {
        const baseUrl = '/api/banqueMembreCount';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        return this.http.get<BanqueCount[]>(`${baseUrl}/`, requestOptions);
    }
    getUserCountReport(accesstoken: string): Observable<BanqueCount[]> {
        const baseUrl = '/api/banqueUserCount';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        return this.http.get<BanqueCount[]>(`${baseUrl}/`, requestOptions);
    }

}