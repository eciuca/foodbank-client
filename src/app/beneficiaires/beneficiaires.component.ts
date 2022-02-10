import { Component, OnInit } from '@angular/core';
import {Beneficiaire} from './model/beneficiaire';
import {BeneficiaireEntityService} from './services/beneficiaire-entity.service';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {Router} from '@angular/router';
import {AuthState} from '../auth/reducers';
import {LazyLoadEvent} from 'primeng/api';
import {QueryParams} from '@ngrx/data';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {enmYn} from '../shared/enums';
import {AuthService} from '../auth/auth.service';
import {ExcelService} from '../services/excel.service';
import {BeneficiaireHttpService} from './services/beneficiaire-http.service';
import {formatDate} from '@angular/common';


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
  displayDialog: boolean;
  totalRecords: number;
  loading: boolean;
  filterBase: any;
  booCanCreate: boolean;
  booShowArchived: boolean;
  filteredOrganisation: any;
  filteredOrganisations: any[];
  filteredOrganisationsPrepend: any[];
  booShowOrganisations: boolean;
  first: number;
  bankid: number;
  bankName: string;
  bankShortName: string;
  orgName: string; // if logging in with asso role we need to display the organisation
  YNOptions:  any[];
  constructor(private beneficiaireService: BeneficiaireEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private authService: AuthService,
              private excelService: ExcelService,
              private beneficiaireHttpService: BeneficiaireHttpService,
              private router: Router,
              private store: Store
  ) {
    this.booCanCreate = false;
    this.booShowArchived = false;
    this.bankid = 0;
    this.booShowOrganisations = false;
    this.first = 0;
    this.bankName = '';
    this.bankShortName = '';
    this.orgName = '';
    this.filteredOrganisationsPrepend = [
          {idDis: null, fullname: $localize`:@@organisations:Organisations` },
    ];
    this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
    this.YNOptions = enmYn;
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
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
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
    if (event.sortField) {
      queryParms['sortField'] = event.sortField.toString();
    } else {
      queryParms['sortField'] =  'nom';
    }
    if (this.booShowArchived ) {
      queryParms['actif'] = '0';
    }  else {
      queryParms['actif'] = '1';
    }
    console.log('Filtered Organisation', this.filteredOrganisation);
    if (this.booShowOrganisations && this.filteredOrganisation && this.filteredOrganisation.idDis != null) {
      queryParms['lienDis'] = this.filteredOrganisation.idDis;
    }
    if (event.filters) {
      if (event.filters.nom && event.filters.nom.value) {
        queryParms['nom'] = event.filters.nom.value;
      }
      if (event.filters.adresse && event.filters.adresse.value) {
        queryParms['adresse'] = event.filters.adresse.value;
      }
      if (event.filters.cp && event.filters.cp.value) {
         queryParms['cp'] = event.filters.cp.value;
      }
      if (event.filters.localite && event.filters.localite.value) {
         queryParms['localite'] = event.filters.localite.value;
      }
      if (event.filters.suspect && event.filters.suspect.value) {
        queryParms['suspect'] = event.filters.suspect.value;
      }
    }
    this.loadPageSubject$.next(queryParms);
  }

  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.user) {
      this.bankid = authState.banque.bankId;
      this.bankName = authState.banque.bankName;
      this.bankShortName = authState.banque.bankShortName;
      switch (authState.user.rights) {
        case 'Bank':
        case 'Admin_Banq':
          this.booShowOrganisations = true;
          this.filterBase = { 'lienBanque': authState.banque.bankId};
          if (authState.user.rights === 'Admin_Banq' ) { this.booCanCreate = true; }
          break;
        case 'Asso':
        case 'Admin_Asso':
          this.filterBase = { 'lienDis': authState.organisation.idDis};
          this.orgName = authState.organisation.idDis + ' ' + authState.organisation.societe;
          if ( authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
          break;
        default:
      }

    }
  }
  filterOrganisation(event ) {
    const  queryOrganisationParms: QueryParams = {};
    queryOrganisationParms['lienBanque'] = this.bankid.toString();
    if (event.query.length > 0) {
      queryOrganisationParms['societe'] = event.query.toLowerCase();
    }
    this.orgsummaryService.getWithQuery(queryOrganisationParms)
        .subscribe(filteredOrganisations => {
          this.filteredOrganisations = this.filteredOrganisationsPrepend.concat(filteredOrganisations.map((organisation) =>
              Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
          ));
          console.log('Proposed Organisations', this.filteredOrganisations);
        });
  }
  filterOrganisationBeneficiaries(idDis: number) {
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    latestQueryParams['offset'] = '0';
    console.log('Latest Query Parms and new idOrg', latestQueryParams, idDis);
    // when we switch from active to archived list and vice versa , we need to restart from first page
    if (idDis != null) {
      latestQueryParams['lienDis'] = idDis;
    } else {
      if (latestQueryParams.hasOwnProperty('lienDis')) {
        delete latestQueryParams['lienDis'];
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }
  changeArchiveFilter($event) {
    console.log('Archive is now:', $event);
    this.booShowArchived = $event.checked;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    console.log('Latest Query Parms', latestQueryParams);
    // when we switch from active to archived list and vice versa , we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (this.booShowArchived ) {
      latestQueryParams['actif'] = '0';
    } else {
      latestQueryParams['actif'] = '1';
    }
    this.loadPageSubject$.next(latestQueryParams);
  }

  getSuspectStatus(coeff: number) {
    if (coeff === 1) {
      return 'N';
    } else {
      return 'Coeff ' + coeff;
    }
  }
  exportAsXLSX(): void {
    this.beneficiaireHttpService.getBeneficiaireReport(this.authService.accessToken, this.bankid).subscribe(
        (beneficiaires: any[] ) => {
          const cleanedList = [];
          beneficiaires.map((item) => {
            cleanedList.push({  gender: this.labelCivilite(item.civilite), name: item.nom ,firstname: item.prenom, address: item.adresse, city: item.localite,
              zip: item.cp, tel: item.tel, gsm: item.gsm, email: item.email })
          });
          this.excelService.exportAsExcelFile(cleanedList,  'foodit.' + this.bankShortName +'.beneficiaries.' + formatDate(new Date(),'ddMMyyyy.HHmm','en-US') + '.xlsx');
        });
  }
  labelCivilite(civilite: number) {
    switch (civilite) {
      case 1:
        return 'Mr';
      case 2:
        return 'Mrs.';
      case 3:
        return 'Miss';
      default:
        return 'Unspecified';
    }

  }
}
