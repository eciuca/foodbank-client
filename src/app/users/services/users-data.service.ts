import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/user';
@Injectable()
export class UsersDataService extends DefaultDataService<User> {
    constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        console.log('Alain - DefaultDataServiceConfig', config);
        super('User', http, httpUrlGenerator, config);
    }
}
