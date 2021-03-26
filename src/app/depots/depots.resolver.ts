import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first, mergeMap } from 'rxjs/operators';
import { DepotEntityService } from './services/depot-entity.service';

@Injectable()
export class DepotsResolver implements Resolve<boolean> {

    constructor(
        private depotsService: DepotEntityService
    ) {

    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.loadDepots();

        return this.depotsService.loaded$
            .pipe(
                filter(loaded => !!loaded),
                first()
            );
    }

    private loadDepots() {
        const depotsNotLoaded$ = this.depotsService.loaded$
            .pipe(
                filter(loaded => !loaded)
            );

        depotsNotLoaded$
            .pipe(
                mergeMap(_ => this.depotsService.getAll())
            )
            .subscribe(loadedDepots => {
                console.log('Loaded depots: ' + loadedDepots.length);
                this.depotsService.setLoaded(true);
            });
    }


}

