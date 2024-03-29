import {Component, Input, OnInit} from '@angular/core';
import {Donateur} from '../model/donateur';
import {DonateurEntityService} from '../services/donateur-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {ExcelService} from '../../services/excel.service';
import {AuthService} from '../../auth/auth.service';
import {DonateurHttpService} from '../services/donateur-http.service';
import {AuthState} from '../../auth/reducers';
import {formatDate} from '@angular/common';


@Component({
  selector: 'app-donateurs',
  templateUrl: './donateurs.component.html',
  styleUrls: ['./donateurs.component.css']
})

export class DonateursComponent implements OnInit {
  @Input() lienBanque$: Observable<number>;
  loadPageSubject$ = new BehaviorSubject(null);
  selectedDonateurId$ = new BehaviorSubject(0);
  donateurs: Donateur[];
  donateur: Donateur = null;
  displayDialog: boolean;
  loading: boolean;
  filterBase: any;
  booIsAdmin: boolean;
  lienBanque: number;
  bankShortName: string;
  first: number;
  totalRecords: number;
  constructor(private donateurService: DonateurEntityService,
              private authService: AuthService,
              private excelService: ExcelService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store,
              private donateurHttpService: DonateurHttpService
  ) {
    this.booIsAdmin = false;
    this.first = 0;
    this.totalRecords = 0;
    this.bankShortName = '';
    this.filterBase = {};
  }
  ngOnInit() {
    this.reload();
    this.loadPageSubject$
          .pipe(
              filter(queryParams => !!queryParams),
              mergeMap(queryParams => this.donateurService.getWithQuery(queryParams))
          )
          .subscribe(loadedDonateurs => {
            console.log('Loaded donateurs from nextpage: ' + loadedDonateurs.length);
            if (loadedDonateurs.length > 0) {
              this.totalRecords = loadedDonateurs[0].totalRecords;
            }  else {
              this.totalRecords = 0;
            }
            this.donateurs  = loadedDonateurs;
            this.loading = false;
            this.donateurService.setLoaded(true);
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
  handleSelect(donateur) {
    this.selectedDonateurId$.next(donateur.donateurId);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedDonateurId$.next(0);
    this.displayDialog = true;
  }

  handleDonateurQuit() {
    this.displayDialog = false;
  }

  handleDonateurUpdate(updatedDonateur) {
    const index = this.donateurs.findIndex(donateur => donateur.donateurId === updatedDonateur.donateurId);
    this.donateurs[index] = updatedDonateur;
    this.displayDialog = false;
  }
  handleDonateurCreate(createdDonateur: Donateur) {
    this.donateurs.push({...createdDonateur});
    this.displayDialog = false;
  }

  handleDonateurDeleted(deletedDonateur) {
    const index = this.donateurs.findIndex(donateur => donateur.donateurId === deletedDonateur.donateurId);
    this.donateurs.splice(index, 1);
    this.displayDialog = false;
  }
  nextPage(event: LazyLoadEvent) {
    
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
      if (event.filters.prenom && event.filters.prenom.value) {
        queryParms['prenom'] = event.filters.prenom.value;
      }
      if (event.filters.adresse && event.filters.adresse.value) {
        queryParms['adresse'] = event.filters.adresse.value;
      }
      if (event.filters.cp && event.filters.cp.value) {
        queryParms['cp'] = event.filters.cp.value;
      }
      if (event.filters.city && event.filters.city.value) {
        queryParms['city'] = event.filters.city.value;
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
    this.donateurHttpService.getDonateurReport(this.authService.accessToken, this.lienBanque).subscribe(
        (donateurs: any[] ) => {
          const cleanedList = donateurs.map(({ donateurId, lienBanque, pays, totalRecords, ...item }) => item);
          this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.donateurs.' + formatDate(new Date(),'ddMMyyyy.HHmm','en-US') + '.xlsx');
        });
  }

}


