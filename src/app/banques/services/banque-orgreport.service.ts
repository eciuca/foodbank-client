import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BanqueOrgReport} from '../model/banqueOrgReport';

@Injectable({
    providedIn: 'root'
})
export class BanqueOrgReportService {
    private baseUrl = '/api/banqueOrgReport';


    constructor(private http: HttpClient) {
    }
    getOrgReport(accesstoken: string): Observable<BanqueOrgReport[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        return this.http.get<BanqueOrgReport[]>(`${this.baseUrl}/`, requestOptions);
    }

}