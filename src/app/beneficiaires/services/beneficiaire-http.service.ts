import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Beneficiaire} from '../model/beneficiaire';
import {Population} from '../model/population';

@Injectable({
    providedIn: 'root'
})
export class BeneficiaireHttpService {

    constructor(private http: HttpClient) {
    }
    getBeneficiaireReport(accesstoken: string, lienBanque: number): Observable<Beneficiaire[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        // tslint:disable-next-line:max-line-length
        return this.http.get<Beneficiaire[]>(`/api/beneficiaires/?actif=1&lienBanque=${lienBanque.toString()}&offset=0&rows=999&sortOrder=1&sortField=nom`, requestOptions);
    }
    getPopulationReport(accesstoken: string): Observable<Population[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        // tslint:disable-next-line:max-line-length
        return this.http.get<Population[]>(`/api/populationReport/`, requestOptions);
    }
}