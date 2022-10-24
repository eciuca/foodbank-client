import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    private baseUrl = '/api/mailing';

    constructor(private http: HttpClient) {
    }

    upload(file: File, accesstoken: string): Observable<any> {

        const formData: FormData = new FormData();
             formData.append('file', file);

        const requestOptions = {
            headers: new HttpHeaders( {
                responseType: 'json',
                Authorization: 'Bearer ' + accesstoken
            }),
        };

        return this.http.post(`${this.baseUrl}/upload/`, formData, requestOptions );
    }

}
