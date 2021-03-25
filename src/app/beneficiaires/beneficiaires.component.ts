import { Component, OnInit } from '@angular/core';
import {Beneficiaire, DefaultBeneficiaire} from './model/beneficiaire';
import {BeneficiaireEntityService} from './services/beneficiaire-entity.service';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {Router} from '@angular/router';
import {AuthState} from '../auth/reducers';
import {LazyLoadEvent} from 'primeng/api';


@Component({
  selector: 'app-beneficiaires',
  templateUrl: './beneficiaires.component.html',
  styleUrls: ['./beneficiaires.component.css']
})

export class BeneficiairesComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdClient$ = new BehaviorSubject(0);
  beneficiaires: Beneficiaire[];
  beneficiaire: Beneficiaire = null;
  cols: any[];
  displayDialog: boolean;
  totalRecords: number;
  loading: boolean;
  filterBase: any;
  booCanCreate: boolean;

  constructor(private beneficiaireService: BeneficiaireEntityService,
              private router: Router,
              private store: Store
  ) {
    this.booCanCreate = false;
  }

  ngOnInit() {
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.beneficiaireService.getWithQuery(queryParams))
        )
        .subscribe(loadedBeneficiaires => {
          console.log('Loaded beneficiaires from nextpage: ' + loadedBeneficiaires.length);
          if (loadedBeneficiaires.length > 0) {
            this.totalRecords = loadedBeneficiaires[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.beneficiaires  = loadedBeneficiaires;
          this.loading = false;
          this.beneficiaireService.setLoaded(true);
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

    this.cols = [
      { field: 'nom', header: 'Nom' },
      { field: 'prenom', header: 'Prenom' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'cp', header: 'Code Postal' },
      { field: 'localite', header: 'Commune' }
    ];

  }
  handleSelect(beneficiaire) {
    console.log( 'Beneficiaire was selected', beneficiaire);
    this.selectedIdClient$.next(beneficiaire.idClient);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedIdClient$.next(0);
    this.displayDialog = true;
  }

  handleBeneficiaireQuit() {
    this.displayDialog = false;
  }

  handleBeneficiaireUpdate(updatedBeneficiaire) {
    const index = this.beneficiaires.findIndex(beneficiaire => beneficiaire.idClient === updatedBeneficiaire.idClient);
    this.beneficiaires[index] = updatedBeneficiaire;
    this.displayDialog = false;
  }
  handleBeneficiaireCreate(createdBeneficiaire: Beneficiaire) {
    this.beneficiaires.push({...createdBeneficiaire});
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

  handleBeneficiaireDeleted(deletedBeneficiaire) {
    const index = this.beneficiaires.findIndex(beneficiaire => beneficiaire.idClient === deletedBeneficiaire.idClient);
    this.beneficiaires.splice(index, 1);
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

  nextPage(event: LazyLoadEvent) {
    console.log('Lazy Loaded Event', event);
    this.loading = true;
    if (event.sortField == null) {
      setTimeout(() => {
        console.log('waiting first 250ms for reset to take place');
      }, 250);
    }
    const queryParms = {...this.filterBase};
    queryParms['offset'] = event.first.toString();
    queryParms['rows'] = event.rows.toString();
    queryParms['sortOrder'] = event.sortOrder.toString();
    if (event.filters) {
      if (event.filters.nom && event.filters.nom.value) {
        queryParms['sortField'] = 'nom';
        queryParms['searchField'] = 'nom';
        queryParms['searchValue'] = event.filters.nom.value;
      } else if (event.filters.prenom && event.filters.prenom.value) {
        queryParms['sortField'] = 'prenom';
        queryParms['searchField'] = 'prenom';
        queryParms['searchValue'] = event.filters.prenom.value;
      } else if (event.filters.adresse && event.filters.adresse.value) {
        queryParms['sortField'] = 'adresse';
        queryParms['searchField'] = 'adresse';
        queryParms['searchValue'] = event.filters.adresse.value;
      } else if (event.filters.cp && event.filters.cp.value) {
        queryParms['sortField'] = 'cp';
        queryParms['searchField'] = 'cp';
        queryParms['searchValue'] = event.filters.cp.value;
      } else if (event.filters.localite && event.filters.localite.value) {
        queryParms['sortField'] = 'localite';
        queryParms['searchField'] = 'localite';
        queryParms['searchValue'] = event.filters.localite.value;
      }
    }
    if (!queryParms.hasOwnProperty('sortField')) {
      if (event.sortField) {
        queryParms['sortField'] = event.sortField;
      } else {
        queryParms['sortField'] = 'nom';
      }
    }
    this.beneficiaireService.getWithQuery(queryParms)
        .subscribe(loadedBeneficiaires => {
          console.log('Loaded membres from nextpage: ' + loadedBeneficiaires.length);
          if (loadedBeneficiaires.length > 0) {
            this.totalRecords = loadedBeneficiaires[0].totalRecords;
          } else {
            this.totalRecords = 0;
          }
          this.beneficiaires  = loadedBeneficiaires;
          this.loading = false;
          this.beneficiaireService.setLoaded(true);
        });
  }

  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.banque) {
      switch (authState.user.rights) {
        case 'Bank':
        case 'Admin_Banq':
          this.filterBase = { 'bankShortName': authState.banque.bankShortName};
          if (authState.user.rights === 'Admin_Banq' ) { this.booCanCreate = true; }
          break;
        case 'Asso':
        case 'Admin_Asso':
          this.filterBase = { 'lienDis': authState.organisation.idDis};
          if ( authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
          break;
        default:
      }

    }
  }
}
