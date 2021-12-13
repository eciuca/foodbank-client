import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Audit} from '../model/audit';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AuditsDataService extends DefaultDataService<Audit> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
         super('Audit', http, httpUrlGenerator, config);
    }
}