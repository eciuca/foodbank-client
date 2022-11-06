import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Region} from '../model/region';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class RegionsDataService extends DefaultDataService<Region> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Region', http, httpUrlGenerator, config);
    }
}