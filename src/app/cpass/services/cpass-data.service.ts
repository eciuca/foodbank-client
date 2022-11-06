import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Cpas} from '../model/cpas';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class CpassDataService extends DefaultDataService<Cpas> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Cpas', http, httpUrlGenerator, config);
    }
}
