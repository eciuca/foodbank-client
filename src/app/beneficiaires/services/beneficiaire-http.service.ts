import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Beneficiaire} from '../model/beneficiaire';
import {Population} from '../model/population';

@Injectable({
    providedIn: 'root'
})
export class BeneficiaireHttpService {
    private baseUrl = '/api/beneficiairesall';
    constructor(private http: HttpClient) {
    }
    getBeneficiaireReport(accesstoken: string, lienBanque: number, lienDis: number): Observable<Beneficiaire[]> {
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        if(lienDis > 0) {
            return this.http.get<Beneficiaire[]>(`${this.baseUrl}/?lienDis=${lienDis.toString()}`, requestOptions);
        }
        if (lienBanque) {
            return this.http.get<Beneficiaire[]>(`${this.baseUrl}/?lienBanque=${lienBanque.toString()}`, requestOptions);
        }
        else {
            return this.http.get<Beneficiaire[]>(`${this.baseUrl}/`, requestOptions);

        }
    }
    getPopulationReport(accesstoken: string,lienBanque:number=null): Observable<Population[]> {
        let baseUrl = '/api/populationReport/';
        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization:  'Bearer ' + accesstoken
            }),
        };
        if (lienBanque) {
            baseUrl += '?lienBanque=' + lienBanque;

        }

        // tslint:disable-next-line:max-line-length
        return this.http.get<Population[]>(`${baseUrl}`, requestOptions);
    }
}