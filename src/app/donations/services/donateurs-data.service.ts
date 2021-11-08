import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Donateur} from '../model/donateur';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
@Injectable()
export class DonateursDataService extends DefaultDataService<Donateur> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Donateur', http, httpUrlGenerator, config);
    }
}
