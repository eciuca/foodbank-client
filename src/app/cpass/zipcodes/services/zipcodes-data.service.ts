import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {HttpClient} from '@angular/common/http';
import {Zipcode} from '../../model/zipcode';

@Injectable()
export class ZipcodesDataService extends DefaultDataService<Zipcode> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Zipcode', http, httpUrlGenerator, config);
    }
}
