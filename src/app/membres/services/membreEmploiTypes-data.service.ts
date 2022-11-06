import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {MembreEmploiType} from '../model/membreEmploiType';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class MembreEmploiTypesDataService extends DefaultDataService<MembreEmploiType> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('MembreEmploiType', http, httpUrlGenerator, config);
    }
}