import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {HttpClient} from '@angular/common/http';
import {ZipCode} from '../../model/zipCode';

@Injectable()
export class ZipcodesDataService extends DefaultDataService<ZipCode> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Zipcode', http, httpUrlGenerator, config);
    }
}
