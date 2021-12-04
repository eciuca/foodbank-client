import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {BanqProg} from '../model/banqprog';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class BanqProgsDataService extends DefaultDataService<BanqProg> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('BanqProg', http, httpUrlGenerator, config);
    }
}