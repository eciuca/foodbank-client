import {Component, Input, OnInit} from '@angular/core';
import {Don} from '../model/don';
import {DonEntityService} from '../services/don-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {ExcelService} from '../../services/excel.service';
import {AuthService} from '../../auth/auth.service';
import {DonHttpService} from '../services/don-http.service';



@Component({
  selector: 'app-dons',
  templateUrl: './dons.component.html',
  styleUrls: ['./dons.component.css']
})

export class DonsComponent implements OnInit {
  @Input() lienBanque$: Observable<number>;
  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdDon$ = new BehaviorSubject(0);
  dons: Don[];
  don: Don = null;
  displayDialog: boolean;
  loading: boolean;
  filterBase: any;
  booIsAdmin: boolean;
  lienBanque: number;
  first: number;
  totalRecords: number;
  constructor(private donService: DonEntityService,
              private authService: AuthService,
              private excelService: ExcelService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store,
              private donHttpService: DonHttpService
  ) {
    this.booIsAdmin = false;
    this.first = 0;
    this.totalRecords = 0;
    this.filterBase = {};
  }
  ngOnInit() {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                this.lienBanque = authState.banque.bankId;
                this.filterBase = { 'lienBanque': authState.banque.bankId};
                if (authState.user.rights === 'Admin_Banq') {
                  this.booIsAdmin = true;
                }
              }
            })
        )
        .subscribe();

    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.donService.getWithQuery(queryParams))
        )
        .subscribe(loadedDons => {
          console.log('Loaded dons from nextpage: ' + loadedDons.length);
          if (loadedDons.length > 0) {
            this.totalRecords = loadedDons[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.dons  = loadedDons;
          this.loading = false;
          this.donService.setLoaded(true);
        });
  }
  handleSelect(don) {
    console.log( 'Don was selected', don);
    this.selectedIdDon$.next(don.idDon);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedIdDon$.next(0);
    this.displayDialog = true;
  }

  handleDonQuit() {
    this.displayDialog = false;
  }

  handleDonUpdate(updatedDon) {
    const index = this.dons.findIndex(don => don.idDon === updatedDon.idDon);
    this.dons[index] = updatedDon;
    this.displayDialog = false;
  }
  handleDonCreate(createdDon: Don) {
    this.dons.push({...createdDon});
    this.displayDialog = false;
  }

  handleDonDeleted(deletedDon) {
    const index = this.dons.findIndex(don => don.idDon === deletedDon.idDon);
    this.dons.splice(index, 1);
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
      queryParms['sortField'] =  'donateurNom';
    }
    if (event.filters) {
      if (event.filters.donateurNom && event.filters.donateurNom.value) {
        queryParms['donateurNom'] = event.filters.donateurNom.value;
      }
      if (event.filters.donYear && event.filters.donYear.value) {
        queryParms['donYear'] = event.filters.donYear.value;
      }
    }
    this.loadPageSubject$.next(queryParms);
  }

  exportAsXLSX(): void {
    this.donHttpService.getDonReport(this.authService.accessToken, this.lienBanque).subscribe(
        (dons: any[] ) => {
          const cleanedList = dons.map(({ idDon, lienBanque, donateurId, appended, checked, totalRecords, ...item }) => item);
          this.excelService.exportAsExcelFile(cleanedList, 'don_data');
        });
  }

}



