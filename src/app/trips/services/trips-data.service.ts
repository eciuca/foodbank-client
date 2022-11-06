import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Trip} from '../model/trip';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class TripsDataService extends DefaultDataService<Trip> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Trip', http, httpUrlGenerator, config);
    }
}
