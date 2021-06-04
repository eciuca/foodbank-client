import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Organisation} from '../model/organisation';
import {HttpClient} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class OrganisationsDataService extends DefaultDataService<Organisation> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        console.log('Alain - DefaultDataServiceConfig', config);
        super('Organisation', http, httpUrlGenerator, config);
    }
}
