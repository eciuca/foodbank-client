import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BanqueClientReport} from '../model/banqueClientReport';
import {BanqueCount} from '../model/banqueCount';
import {BanqueOrgCount} from '../model/banqueOrgCount';
import {BanqueFeadReport} from '../model/banqueFeadReport';

@Injectable({
    providedIn: 'root'
})
export class BanqueReportService {

    constructor(private http: HttpClient) {
    }
    getOrgClientReport(accesstoken: string,bankShortName:string=null): Observable<BanqueClientReport[]> {
        let baseUrl = '/api/banqueOrgClientReport/';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if (bankShortName) {
            baseUrl += '?bankShortName=' + bankShortName;

        }

        return this.http.get<BanqueClientReport[]>(`${baseUrl}`, requestOptions);
    }
    getOrgFeadReport(accesstoken: string): Observable<BanqueFeadReport[]> {
        const baseUrl = '/api/banqueOrgFeadReport';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        return this.http.get<BanqueFeadReport[]>(`${baseUrl}/`, requestOptions);
    }
    getOrgCountReport(accesstoken: string,filter:string): Observable<BanqueCount[]> {
        const baseUrl = '/api/banqueOrgCount';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        if (filter.length >0) {
           return this.http.get<BanqueCount[]>(`${baseUrl}/?filter=${filter}`, requestOptions);
        }
        return this.http.get<BanqueCount[]>(`${baseUrl}/`, requestOptions);
    }
    getMembreCountReport(accesstoken: string): Observable<BanqueOrgCount[]> {
        const baseUrl = '/api/banqueMembreCount';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        return this.http.get<BanqueOrgCount[]>(`${baseUrl}/`, requestOptions);
    }
    getUserCountReport(accesstoken: string): Observable<BanqueOrgCount[]> {
        const baseUrl = '/api/banqueUserCount';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        return this.http.get<BanqueOrgCount[]>(`${baseUrl}/`, requestOptions);
    }

}