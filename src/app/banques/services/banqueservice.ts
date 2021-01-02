import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Banque } from '../model/banque';

@Injectable()
export class BanqueService {

    constructor(private http: HttpClient) {}

    getBanquesSmall() {
        return this.http.get<any>('assets/data/cars-small.json')
            .toPromise()
            .then(res => <Banque[]> res.data)
            .then(data => data);
    }
}
