import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Don} from '../model/don';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
@Injectable()
export class DonsDataService extends DefaultDataService<Don> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Don', http, httpUrlGenerator, config);
    }
}
