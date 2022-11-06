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
import {AuthState} from '../../auth/reducers';
import {formatDate} from '@angular/common';


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
  bankShortName: string;
  first: number;
  totalRecords: number;
  currentYear: number;
  donYears: any[];
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
    this.bankShortName = '';
    this.currentYear = (new Date()).getFullYear();
  }
  ngOnInit() {
    this.donYears = [
      {label: $localize`:@@All:All`, value: null},
      {label: this.currentYear.toString(), value: this.currentYear.toString()},
      {label: (this.currentYear - 1 ).toString(), value: (this.currentYear - 1).toString()},
      {label: (this.currentYear - 2).toString(), value: (this.currentYear - 2).toString()},
      {label: (this.currentYear - 3).toString(), value: (this.currentYear - 3).toString()},
      {label: (this.currentYear - 4 ).toString(), value: (this.currentYear - 4).toString()},
      {label: (this.currentYear - 5).toString(), value: (this.currentYear - 5).toString()},
      {label: (this.currentYear - 6).toString(), value: (this.currentYear - 6).toString()},
      {label: (this.currentYear - 7 ).toString(), value: (this.currentYear - 7).toString()},
      {label: (this.currentYear - 8).toString(), value: (this.currentYear - 8).toString()},
      {label: (this.currentYear - 9).toString(), value: (this.currentYear - 9).toString()},
      {label: (this.currentYear - 10 ).toString(), value: (this.currentYear - 10).toString()},
      {label: (this.currentYear - 11).toString(), value: (this.currentYear - 11).toString()},
      {label: (this.currentYear - 12).toString(), value: (this.currentYear - 12).toString()}
    ];
    this.reload();
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
  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.user) {
      this.lienBanque = authState.banque.bankId;
      this.bankShortName = authState.banque.bankShortName;
      this.filterBase = { 'lienBanque': authState.banque.bankId};
      if (authState.user.rights === 'Admin_Banq') {
        this.booIsAdmin = true;
      }
    }
  }
  exportAsXLSX(): void {
    this.donHttpService.getDonReport(this.authService.accessToken, this.lienBanque).subscribe(
        (dons: any[] ) => {
          const cleanedList = dons.map(({ idDon, lienBanque, donateurId, appended, checked, totalRecords, ...item }) => item);
          this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.gifts.' + formatDate(new Date(),'ddMMyyyy.HHmm','en-US') + '.xlsx');
        });
  }

}



