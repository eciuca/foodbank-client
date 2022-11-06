import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Orgaudit} from '../model/orgaudit';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class OrgauditsDataService extends DefaultDataService<Orgaudit> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Orgaudit', http, httpUrlGenerator, config);
    }
}