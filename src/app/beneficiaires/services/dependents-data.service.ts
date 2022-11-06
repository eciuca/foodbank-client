import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Dependent} from '../model/dependent';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class DependentsDataService extends DefaultDataService<Dependent> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Dependent', http, httpUrlGenerator, config);
    }
}
