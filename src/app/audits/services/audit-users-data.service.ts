import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {AuditUser} from '../model/auditUser';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AuditUsersDataService extends DefaultDataService<AuditUser> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('AuditUser', http, httpUrlGenerator, config);
    }
}