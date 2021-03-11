import {Component, OnInit} from '@angular/core';
import { Depot } from './model/depot';
import {DepotEntityService} from './services/depot-entity.service';
import { tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';


@Component({
  selector: 'app-depots',
  templateUrl: './depots.component.html',
  styleUrls: ['./depots.component.css']
})

export class DepotsComponent implements OnInit {
  selectedDepot: Depot;
  depots$: Observable<Depot[]>;
  cols: any[];
  displayDialog: boolean;

  constructor(
      private depotService: DepotEntityService
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
      { field: 'idDepot', header: 'Identifiant' },
      { field: 'nom', header: 'Nom' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'cp', header: 'Code Postal' },
      { field: 'ville', header: 'Ville' }
    ];

  }
  handleSelect(depot: Depot) {
    console.log( 'Depot was selected', depot);
    this.selectedDepot = depot;
    this.displayDialog = true;
  }

  handleDialogClose() {
    this.displayDialog = false;
  }
}
