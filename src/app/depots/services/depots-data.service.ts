import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Depot} from '../model/depot';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class DepotsDataService extends DefaultDataService<Depot> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Depot', http, httpUrlGenerator, config);
    }
}
