import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BanqueOrgCount} from '../model/banqueOrgCount';

@Injectable({
    providedIn: 'root'
})
export class BanqueOrgCountService {
    private baseUrl = '/api/banqueOrgCount';

    constructor(private http: HttpClient) {
    }
    getOrgCountReport(accesstoken: string,hasBirbCode: boolean): Observable<BanqueOrgCount[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if ( hasBirbCode) {
            return this.http.get<BanqueOrgCount[]>(`${this.baseUrl}/?hasBirbCode=1`, requestOptions);
        }
        return this.http.get<BanqueOrgCount[]>(`${this.baseUrl}/`, requestOptions);
    }

}