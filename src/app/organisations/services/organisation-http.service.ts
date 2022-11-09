import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Organisation} from '../model/organisation';

@Injectable({
    providedIn: 'root'
})
export class OrganisationHttpService {
    private baseUrl = '/api/organisations';
    constructor(private http: HttpClient) {
    }
    getOrganisationReport(accesstoken: string, lienBanque: number): Observable<Organisation[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if (lienBanque) {
            // tslint:disable-next-line:max-line-length
            return this.http.get<Organisation[]>(`${this.baseUrl}/?lienBanque=${lienBanque.toString()}&actif=1&offset=0&rows=999&sortOrder=1&sortField=idDis`, requestOptions);
        }
        else {
            return this.http.get<Organisation[]>(`${this.baseUrl}/?actif=1&offset=0&rows=999&sortOrder=1&sortField=idDis`, requestOptions);
        }
    }
}