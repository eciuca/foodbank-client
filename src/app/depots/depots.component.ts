import {Component, Input, OnInit} from '@angular/core';
import {Depot} from './model/depot';
import {DepotEntityService} from './services/depot-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {ExcelService} from '../services/excel.service';
import {AuthService} from '../auth/auth.service';
import {DepotHttpService} from './services/depot-http.service';
import {AuthState} from '../auth/reducers';



@Component({
  selector: 'app-depots',
  templateUrl: './depots.component.html',
  styleUrls: ['./depots.component.css']
})

export class DepotsComponent implements OnInit {
  @Input() lienBanque$: Observable<number>;
  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdDepot$ = new BehaviorSubject(0);
  depots: Depot[];
  depot: Depot = null;
  displayDialog: boolean;
  loading: boolean;
  filterBase: any;
  booIsAdmin: boolean;
  lienBanque: number;
  first: number;
  totalRecords: number;
  constructor(private depotService: DepotEntityService,
              private authService: AuthService,
              private excelService: ExcelService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store,
              private depotHttpService: DepotHttpService
  ) {
    this.booIsAdmin = false;
    this.first = 0;
    this.totalRecords = 0;
    this.filterBase = {};
  }
  ngOnInit() {
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.depotService.getWithQuery(queryParams))
        )
        .subscribe(loadedDepots => {
          console.log('Loaded depots from nextpage: ' + loadedDepots.length);
          if (loadedDepots.length > 0) {
            this.totalRecords = loadedDepots[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.depots  = loadedDepots;
          this.loading = false;
          this.depotService.setLoaded(true);
        });
  }
  reload() {
    this.loading = true;
    this.totalRecords = 0;

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.initializeDependingOnUserRights(authState);
            })
        )
        .subscribe();
  }
  handleSelect(depot) {
    console.log( 'Depot was selected', depot);
    this.selectedIdDepot$.next(depot.idDepot);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedIdDepot$.next(0);
    this.displayDialog = true;
  }

  handleDepotQuit() {
    this.displayDialog = false;
  }

  handleDepotUpdate(updatedDepot) {
    const index = this.depots.findIndex(depot => depot.idDepot === updatedDepot.idDepot);
    this.depots[index] = updatedDepot;
    this.displayDialog = false;
  }
  handleDepotCreate(createdDepot: Depot) {
    this.depots.push({...createdDepot});
    this.displayDialog = false;
  }

  handleDepotDeleted(deletedDepot) {
    const index = this.depots.findIndex(depot => depot.idDepot === deletedDepot.idDepot);
    this.depots.splice(index, 1);
    this.displayDialog = false;
  }
  nextPage(event: LazyLoadEvent) {
    console.log('Lazy Loaded Event', event);
    this.loading = true;
    const queryParms = {...this.filterBase};
    queryParms['offset'] = event.first.toString();
    queryParms['rows'] = event.rows.toString();
    queryParms['sortOrder'] = event.sortOrder.toString();
    if (event.sortField) {
      queryParms['sortField'] = event.sortField.toString();
    } else {
      queryParms['sortField'] =  'nom';
    }
    if (event.filters) {
      if (event.filters.nom && event.filters.nom.value) {
        queryParms['nom'] = event.filters.nom.value;
      }
    }
    this.loadPageSubject$.next(queryParms);
  }
  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.user) {
      this.lienBanque = authState.banque.bankId;
      this.filterBase = { 'lienBanque': authState.banque.bankId};
      if (authState.user.rights === 'Admin_Banq') {
        this.booIsAdmin = true;
      }
    }
  }
  exportAsXLSX(): void {
    this.depotHttpService.getDepotReport(this.authService.accessToken, this.lienBanque).subscribe(
        (depots: any[] ) => {
          const cleanedList = depots.map(({ actif, isNew, totalRecords, ...item }) => item);
          this.excelService.exportAsExcelFile(cleanedList, 'foodit.depots.' + new Date().getTime() + '.xlsx');
        });
  }

}


