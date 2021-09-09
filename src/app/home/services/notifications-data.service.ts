import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Notification} from '../notifications/model/notification';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class NotificationsDataService extends DefaultDataService<Notification> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Notification', http, httpUrlGenerator, config);
    }
}