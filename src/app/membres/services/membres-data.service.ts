import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Membre} from '../model/membre';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class MembresDataService extends DefaultDataService<Membre> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Membre', http, httpUrlGenerator, config);
    }
}
