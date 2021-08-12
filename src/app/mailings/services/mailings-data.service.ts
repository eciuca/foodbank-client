import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {HttpClient} from '@angular/common/http';
import {Mailing} from '../../mailings/model/mailing';

@Injectable({providedIn: 'root'})
export class MailingsDataService extends DefaultDataService<Mailing> {
    constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        super('Mailing', http, httpUrlGenerator, config);
    }
}