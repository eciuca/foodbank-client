import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {OrgSummary} from '../model/orgsummary';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class OrgSummariesDataService extends DefaultDataService<OrgSummary> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('OrgSummary', http, httpUrlGenerator, config);
    }
}
