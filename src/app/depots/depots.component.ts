import {Component, OnInit, Output} from '@angular/core';
import { Depot } from './model/depot';
import {DepotEntityService} from './services/depot-entity.service';
import {concatMap, map, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';


@Component({
  selector: 'app-depots',
  templateUrl: './depots.component.html',
  styleUrls: ['./depots.component.css']
})

export class DepotsComponent implements OnInit {
  selectedDepotid$ = new BehaviorSubject(0);
  depots$: Observable<Depot[]>;
  cols: any[];
  displayDialog: boolean;

  constructor(
      private depotService: DepotEntityService,
      private router: Router,
  ) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.depots$  = this.depotService.entities$
        .pipe(
            tap( (depotsEntities) => {
              console.log('Depots now loaded:', depotsEntities); }),
        )
    ;
    this.cols = [
      { field: 'depotId', header: 'Identifiant' },
      { field: 'nom', header: 'Nom' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'cp', header: 'Code Postal' },
      { field: 'ville', header: 'Ville' }
    ];

  }
  handleSelect(depot: Depot) {
    console.log( 'Depot was selected', depot);
    this.selectedDepotid$.next( Number(depot.idDepot));
    this.displayDialog = true;
  }
}
