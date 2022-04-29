import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {AuditChange} from '../model/auditChange';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AuditChangesDataService extends DefaultDataService<AuditChange> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('AuditChange', http, httpUrlGenerator, config);
    }
}