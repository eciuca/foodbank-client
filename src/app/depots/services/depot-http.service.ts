import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Depot} from '../model/depot';

@Injectable({
    providedIn: 'root'
})
export class DepotHttpService {
    private baseUrl = '/api/depots';
    constructor(private http: HttpClient) {
    }
    getDepotReport(accesstoken: string, idCompany:string): Observable<Depot[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        // tslint:disable-next-line:max-line-length
        return this.http.get<Depot[]>(`${this.baseUrl}/?actif=1&idCompany=${idCompany}&offset=0&rows=999&sortOrder=1&sortField=nom`, requestOptions);
    }
}