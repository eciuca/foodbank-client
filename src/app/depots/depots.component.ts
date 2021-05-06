import {Component, OnInit} from '@angular/core';
import { Depot } from './model/depot';
import {DepotEntityService} from './services/depot-entity.service';
import {map, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';


@Component({
  selector: 'app-depots',
  templateUrl: './depots.component.html',
  styleUrls: ['./depots.component.css']
})

export class DepotsComponent implements OnInit {
  selectedIdDepot$ = new BehaviorSubject('');
  depot: Depot = null;
  depots$: Observable<Depot[]>;
  cols: any[];
  displayDialog: boolean;
  booCanCreate: boolean;

  constructor(
      private depotService: DepotEntityService,
      private store: Store
  ) {
    this.booCanCreate = false;
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.depots$ = this.depotService.entities$
        .pipe(
            tap((depotsEntities) => {
              console.log('Depots now loaded:', depotsEntities);
            }),
        )
    ;
    this.cols = [
      {field: 'idDepot', header: 'Id'},
      {field: 'nom', header: 'Name'},
      {field: 'adresse', header: 'Address'},
      {field: 'cp', header: 'Zip Code'},
      {field: 'ville', header: 'City'}
    ];
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.banque) {
                switch (authState.user.rights) {
                  case 'admin':
                  case 'Admin_Banq':
                      this.booCanCreate = true;
                   break;
                 default:
                }
              }
            })
        )
        .subscribe();
  }

  handleSelect(depot: Depot) {
    console.log('Depot was selected', depot);
    this.selectedIdDepot$.next(depot.idDepot);
    this.displayDialog = true;
  }


  handleDepotQuit() {
    this.displayDialog = false;
  }

  handleDepotUpdate(updatedDepot) {
    // Non-paged nothing to be done
    this.displayDialog = false;
  }
  handleDepotCreated(createdDepot: Depot) {
    // this.organisations.push({...createdOrganisation});
    this.displayDialog = false;
  }
  handleDepotDeleted(deletedDepot) {
    // Non-paged nothing to be done
    this.displayDialog = false;
  }
  showDialogToAdd() {
    this.selectedIdDepot$.next('');
    this.displayDialog = true;
  }


}
