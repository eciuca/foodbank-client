import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Banque} from '../model/banque';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class BanquesDataService extends DefaultDataService<Banque> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        console.log('Alain - DefaultDataServiceConfig', config);
       super('Banque', http, httpUrlGenerator, config);
    }
}
