import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {HttpClient} from '@angular/common/http';
import {MailAddress} from '../model/mailaddress';

@Injectable({providedIn: 'root'})
export class MailAddressesDataService extends DefaultDataService<MailAddress> {
    constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('MailAddress', http, httpUrlGenerator, config);
    }
}