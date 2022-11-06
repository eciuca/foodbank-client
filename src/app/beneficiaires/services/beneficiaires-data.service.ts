import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Beneficiaire} from '../model/beneficiaire';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class BeneficiairesDataService extends DefaultDataService<Beneficiaire> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
       super('Beneficiaire', http, httpUrlGenerator, config);
    }
}
