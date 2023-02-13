import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Organisation} from '../model/organisation';
import {Membre} from '../../membres/model/membre';

@Injectable({
    providedIn: 'root'
})
export class OrganisationHttpService {
    private baseUrl = '/api/organisationsall';
    constructor(private http: HttpClient) {
    }
    getOrganisationReport(accesstoken: string,queryParams: string ): Observable<Organisation[]> {
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if(queryParams) {
            return this.http.get<Organisation[]>(`${this.baseUrl}/?${queryParams}`, requestOptions);
        }

        else {
            return this.http.get<Organisation[]>(`${this.baseUrl}/`, requestOptions);

        }
    }
}