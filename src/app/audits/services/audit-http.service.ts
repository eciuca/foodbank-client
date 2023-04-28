import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuditUser} from '../model/auditUser';

@Injectable({
    providedIn: 'root'
})
export class AuditHttpService {

    constructor(private http: HttpClient) {
    }
    getAuditUserReport(accesstoken: string,queryParams: string ): Observable<AuditUser[]> {
        const baseUrl = '/api/auditusersall';
        const requestOptions = {
            headers: new HttpHeaders({
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };
        if(queryParams) {
            return this.http.get<AuditUser[]>(`${baseUrl}/?${queryParams}`, requestOptions);
        }

        else {
            return this.http.get<AuditUser[]>(`${baseUrl}/`, requestOptions);

        }
    }
}