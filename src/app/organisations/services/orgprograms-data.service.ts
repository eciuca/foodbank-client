import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {OrgProgram} from '../model/orgprogram';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class OrgProgramsDataService extends DefaultDataService<OrgProgram> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('OrgProgram', http, httpUrlGenerator, config);
    }
}