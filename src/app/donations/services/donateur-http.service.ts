import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Donateur} from '../model/donateur';

@Injectable({
    providedIn: 'root'
})
export class DonateurHttpService {
    private baseUrl = '/api/donateurs';
    constructor(private http: HttpClient) {
    }
    getDonateurReport(accesstoken: string, lienBanque: number): Observable<Donateur[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        // tslint:disable-next-line:max-line-length
        return this.http.get<Donateur[]>(`${this.baseUrl}/?lienBanque=${lienBanque.toString()}&offset=0&rows=999&sortOrder=1&sortField=nom`, requestOptions);
    }
}
