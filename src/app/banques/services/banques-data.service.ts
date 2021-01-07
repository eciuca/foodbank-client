import {Injectable} from '@angular/core';
import {DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator} from '@ngrx/data';
import {Banque} from '../model/banque';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
@Injectable()
export class BanquesDataService extends DefaultDataService<Banque> {
    constructor( http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) {
        console.log('Alain - DefaultDataServiceConfig', config);
       super('Banque', http, httpUrlGenerator, config);
    }
    /*
    getAll(): Observable<Banque[]>  {
        return this.http.get<any>('assets/data/banques.json')
            .pipe(
                map (res =>  <Banque[]> res)
            );

    }

     */
}
