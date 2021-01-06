import {Injectable} from '@angular/core';
import {DefaultDataService, HttpUrlGenerator} from '@ngrx/data';
import {Banque} from '../model/banque';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Course} from '../../courses/model/course';

@Injectable()
export class BanquesDataService extends DefaultDataService<Banque> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator) {
        super('Banque', http, httpUrlGenerator);
    }
    getAll(): Observable<Banque[]>  {
        return this.http.get<any>('assets/data/banques.json')
            .pipe(
                map (res =>  <Banque[]> res)
            );

    }
}
