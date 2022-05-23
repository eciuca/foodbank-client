import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Donateur} from '../model/donateur';
import {HttpClient} from '@angular/common/http';
@Injectable()
export class DonateursDataService extends DefaultDataService<Donateur> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Donateur', http, httpUrlGenerator, config);
    }
}
