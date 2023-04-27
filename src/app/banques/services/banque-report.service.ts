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
        let requestUrl = '/api/banqueOrgClientReport/';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if (bankShortName) {
            requestUrl += '?bankShortName=' + bankShortName;
        }

        return this.http.get<BanqueClientReport[]>(`${requestUrl}`, requestOptions);
    }
    getOrgFeadReport(accesstoken: string,bankShortName:string=null): Observable<BanqueFeadReport[]> {
        let requestUrl = '/api/banqueOrgFeadReport/';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if (bankShortName) {
            requestUrl += '?bankShortName=' + bankShortName;
        }
        return this.http.get<BanqueFeadReport[]>(`${requestUrl}`, requestOptions);
    }
    getOrgCountReport(accesstoken: string,filter:string): Observable<BanqueCount[]> {
        const requestUrl = '/api/banqueOrgCount';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        if (filter.length >0) {
           return this.http.get<BanqueCount[]>(`${requestUrl}/?filter=${filter}`, requestOptions);
        }
        return this.http.get<BanqueCount[]>(`${requestUrl}/`, requestOptions);
    }
    getMembreCountReport(accesstoken: string,bankShortName:string=null): Observable<BanqueOrgCount[]> {
        let requestUrl = '/api/banqueMembreCount/';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if (bankShortName) {
            requestUrl += '?bankShortName=' + bankShortName;
        }
        return this.http.get<BanqueOrgCount[]>(`${requestUrl}`, requestOptions);
    }
    getUserCountReport(accesstoken: string,bankShortName:string=null): Observable<BanqueOrgCount[]> {
       let requestUrl = '/api/banqueUserCount/';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if (bankShortName) {
            requestUrl += '?bankShortName=' + bankShortName;
        }
        return this.http.get<BanqueOrgCount[]>(`${requestUrl}`, requestOptions);
    }

}