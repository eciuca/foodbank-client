import {Component, OnInit} from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Organisation} from '../model/organisation';
import {OrganisationEntityService} from '../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {globalAuthState} from '../../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {AuthState} from '../../auth/reducers';
import {enmOrgCategories, enmStatusCompany, enmYn} from '../../shared/enums';
import {RegionEntityService} from '../services/region-entity.service';
import {DepotEntityService} from '../../depots/services/depot-entity.service';
import {QueryParams} from '@ngrx/data';
import {formatDate} from '@angular/common';
import {ExcelService} from '../../services/excel.service';
import {AuthService} from '../../auth/auth.service';
import {OrganisationHttpService} from '../services/organisation-http.service';


@Component({
  selector: 'app-orgbenefoverview',
  templateUrl: './orgbenefoverview.component.html',
  styleUrls: ['./orgbenefoverview.component.css']
})

export class OrgbenefoverviewComponent implements OnInit {

  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdDis$ = new BehaviorSubject(0);
  organisation: Organisation = null;
  organisations: Organisation[];
  orgCategories: any[];
  displayDialog: boolean;
  totalRecords: number;
  loading: boolean;
  filterBase: any;
  regions: any[];
  depots: any[];
  YNOptions:  any[];
  bankName: string;
  lienBanque: number;
  bankShortName: string;
  depotName: string;
  first: number;
  regionSelected: number;
  depotSelected: string;
  statutSelected: string;
  statuts: any[];
  constructor(private organisationService: OrganisationEntityService,
              private regionService: RegionEntityService,
              private depotService: DepotEntityService,
              private organisationHttpService: OrganisationHttpService,
              private authService: AuthService,
              private excelService: ExcelService,
              private router: Router,
              private route: ActivatedRoute,
              private store: Store<AppState>
  ) {
    this.orgCategories = enmOrgCategories;
    this.statuts = enmStatusCompany;
    this.YNOptions = enmYn;
    this.lienBanque = 0;
    this.bankName = '';
    this.bankShortName = '';
    this.depotName = '';
    this.first = 0;
  }

  ngOnInit() {
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.organisationService.getWithQuery(queryParams))
        )
        .subscribe(loadedOrganisations => {
          console.log('Loaded organisations from nextpage: ' + loadedOrganisations.length);
          if (loadedOrganisations.length > 0) {
            this.totalRecords = loadedOrganisations[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.organisations  = loadedOrganisations;
          this.loading = false;
          this.organisationService.setLoaded(true);
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

  handleSelect(organisation) {
    console.log( 'Organisation was selected', organisation);
    this.selectedIdDis$.next(organisation.idDis);
    this.displayDialog = true;
  }
  handleOrganisationQuit() {
    this.displayDialog = false;
  }

  handleOrganisationUpdate(updatedOrganisation) {
    const index = this.organisations.findIndex(organisation => organisation.idDis === updatedOrganisation.idDis);
    this.organisations[index] = updatedOrganisation;
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
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
      queryParms['sortField'] =  'societe';
    }
    queryParms['actif'] = '1';
    if (event.filters) {
      if (event.filters.idDis && event.filters.idDis.value) {
        queryParms['idDis'] = event.filters.idDis.value;
      }
      if (event.filters.societe && event.filters.societe.value) {
        queryParms['societe'] = event.filters.societe.value;
      }
      if (event.filters.gestBen && event.filters.gestBen.value !== null) {
        queryParms['gestBen'] = event.filters.gestBen.value;
      }
      if (this.regionSelected) {
        queryParms['regId'] = this.regionSelected;
      }
      if (this.depotSelected) {
        queryParms['lienDepot'] = this.depotSelected;
      }
      if (this.statutSelected && (this.statutSelected !== '')) {
        queryParms['statut'] = this.statutSelected;
      }

    }
    this.loadPageSubject$.next(queryParms);
  }
  private initializeDependingOnUserRights(authState: AuthState) {
    // exfilter all depots
    this.filterBase = { 'isDepot': '0' };
    if (authState.banque) {
      this.lienBanque = authState.banque.bankId;
      this.filterBase['lienBanque'] = authState.banque.bankId;
      this.bankName = authState.banque.bankName;
      this.bankShortName = authState.banque.bankShortName;
      switch (authState.user.rights) {
        case 'Bank':
        case 'Admin_Banq':
          const  queryDepotParms: QueryParams = {};
          queryDepotParms['offset'] = '0';
          queryDepotParms['rows'] = '999';
          queryDepotParms['sortField'] = 'idDepot';
          queryDepotParms['sortOrder'] = '1';
          queryDepotParms['idCompany'] = this.bankShortName;
          queryDepotParms['actif'] = '1';
          this.depotService.getWithQuery(queryDepotParms)
              .subscribe(depots => {
                this.depots = [{ value: null, label: ''}];
                depots.map((depot) =>
                    this.depots.push({value: depot.idDepot, label: depot.nom})
                );
              });

          break;
        case 'Asso':
        case 'Admin_Asso':
          // This module is only called for depots see menu
          this.depotName = authState.organisation.societe;
          this.filterBase['lienDepot'] = authState.organisation.idDis;
           break;
        default:
      }
      this.regionService.getWithQuery({'lienBanque': this.lienBanque.toString()})
          .subscribe(regions => {
            this.regions = [{ value: null, label: ''}];
            regions.map((region) =>
                this.regions.push({value: region.regId, label: region.regName})
            );
          });
    }
  }

  showDialogToAdd() {
    this.selectedIdDis$.next(0);
    this.displayDialog = true;
  }

  getTitle(): string {
    if ( this.depotName) {
      return $localize`:@@DepotOrgsTitleActive:Active Organisations of depot ${this.depotName} `;

    } else {
      return $localize`:@@BankOrgsTitleActive:Active Organisations of bank ${this.bankName} `;
    }
  }

  filterRegion(regId) {
    console.log('Region filter is now:', regId);
    this.regionSelected = regId;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    console.log('Latest Region Query Parms', latestQueryParams);
    // when we switch from active to archived list and vice versa , we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (this.regionSelected) {
      latestQueryParams['regId'] = regId;
    } else {
      // delete regId entry
      if (latestQueryParams.hasOwnProperty('regId')) {
        delete latestQueryParams['regId'];
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }
  filterDepot(idDepot) {
    console.log('Depot filter is now:', idDepot);
    this.depotSelected = idDepot;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    console.log('Latest Depot Query Parms', latestQueryParams);
    // when we switch f we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (this.depotSelected) {
      latestQueryParams['lienDepot'] = idDepot;
    } else {
      // delete idDepot entry
      if (latestQueryParams.hasOwnProperty('lienDepot')) {
        delete latestQueryParams['lienDepot'];
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }


  filterStatut(statut) {
    console.log('statut filter is now:', statut);
    this.statutSelected = statut;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    console.log('Latest statut Query Parms', latestQueryParams);
    // when we switch f, we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (statut !== '') {
      latestQueryParams['statut'] = statut;
    } else {
      if (latestQueryParams.hasOwnProperty('statut')) {
        delete latestQueryParams['statut'];
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }
  exportAsXLSX(): void {
     const reportOption = this.lienBanque;
    this.organisationHttpService.getOrganisationReport(this.authService.accessToken, reportOption).subscribe(
        (organisations: any[]) => {
          const cleanedList = [

          ];
          organisations.map((item) => {
            const cleanedItem = {};
            cleanedItem['Id'] = item.idDis;
            cleanedItem[$localize`:@@Organisation:Organisation`] =item.societe;
            const regionObject = this.regions.find(obj => obj.value == item.region);
            cleanedItem[$localize`:@@Region:Region`] =(typeof regionObject !== "undefined") ? regionObject.label : '';
            cleanedItem[$localize`:@@City:City`] =item.localite;
            cleanedItem[$localize`:@@FeadCode:Fead Code`] =item.birbCode;
            cleanedItem[$localize`:@@Families:Families`] = item.nFam;
            cleanedItem[$localize`:@@Beneficiaries:Beneficiaries`] = item.nPers;
            cleanedItem[$localize`:@@Infants:Infants`] = item.nNour;
            cleanedItem[$localize`:@@Babies:Babies`] = item.nBebe;
            cleanedItem[$localize`:@@Children:Children`] =item.nEnf;
            cleanedItem[$localize`:@@TeenAgers:TeenAgers`] =item.nAdo;
            cleanedItem[$localize`:@@YoungAdults:YoungAdults`] =item.n1824;
            cleanedItem['Seniors'] =item.nSen;

            cleanedList.push( cleanedItem);
          });

            this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.organisations.beneficiaries.' + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');

        });
  }
    generateTooltipGestBen() {
      return $localize`:@@OrgGestBen:Organisation Manages itself its Beneficiaries`;
    }

  generateTooltipBenFam() {
    return $localize`:@@OrgStatFamilies:Families`;
  }

  generateTooltipBenPers() {
    return $localize`:@@OrgStatPersons:Persons`
  }

  generateTooltipBenInfants() {
    return $localize`:@@OrgStatInfants:Infants(0-6 months)`;
  }

  generateTooltipBenBabies() {
    return $localize`:@@OrgStatBabies:Babies(6-24 months)`;
  }

  generateTooltipBenChildren() {
    return $localize`:@@OrgStatChildren:Children(2-14 years)`;
  }

  generateTooltipBenTeenagers() {
    return  $localize`:@@OrgStatTeenagers:Teenagers(14-18 years)`;
  }

  generateTooltipBenYoungAdults() {
    return $localize`:@@OrgStatYoungAdults:Young Adults(18-24 years)`;
  }

  generateTooltipBenSeniors() {
    return $localize`:@@OrgSeniors:Seniors(> 65 years)`;
  }
}


