import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Orgcontact} from '../model/orgcontact';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class OrgcontactsDataService extends DefaultDataService<Orgcontact> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Orgcontact', http, httpUrlGenerator, config);
    }
}
