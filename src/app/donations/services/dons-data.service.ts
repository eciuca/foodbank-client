import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Don} from '../model/don';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class DonsDataService extends DefaultDataService<Don> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Don', http, httpUrlGenerator, config);
    }
}
