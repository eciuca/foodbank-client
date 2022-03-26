import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {MembreFunction} from '../model/membreFunction';
import {HttpClient, HttpHeaders} from '@angular/common/http';
@Injectable()
export class MembreFunctionsDataService extends DefaultDataService<MembreFunction> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('MembreFunction', http, httpUrlGenerator, config);
    }
}