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
import * as moment from 'moment/moment';


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
  totalFamilies: number;
  totalPersons: number;
  totalInfants: number;
  totalBabies: number;
  totalChildren: number;
  totalTeens: number;
  totalYoungAdults: number;
  totalSeniors: number;
  totalAdults: number;
  totalEq: number;
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
            this.totalFamilies = loadedOrganisations[0].totalFamilies;
            this.totalPersons = loadedOrganisations[0].totalPersons;
            this.totalEq = loadedOrganisations[0].totalEq;
            this.totalInfants = loadedOrganisations[0].totalInfants;
            this.totalBabies = loadedOrganisations[0].totalBabies;
            this.totalChildren = loadedOrganisations[0].totalChildren;
            this.totalTeens = loadedOrganisations[0].totalTeens;
            this.totalYoungAdults = loadedOrganisations[0].totalYoungAdults;
            this.totalSeniors = loadedOrganisations[0].totalSeniors;
            this.totalAdults = this.totalPersons - this.totalInfants - this.totalBabies - this.totalChildren - this.totalTeens - this.totalYoungAdults - this.totalSeniors;
          }  else {
            this.totalRecords = 0;
            this.totalFamilies = 0;
            this.totalPersons = 0;
            this.totalEq = 0;
            this.totalInfants = 0;
            this.totalBabies = 0;
            this.totalChildren = 0;
            this.totalTeens = 0;
            this.totalYoungAdults = 0;
            this.totalSeniors = 0;
            this.totalAdults = 0;
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
    // don't exfilter all depots
    this.filterBase = {  };
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
    this.regionSelected = regId;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
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
    this.depotSelected = idDepot;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
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
    this.statutSelected = statut;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
     // when we switch , we need to restart from first page
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
  exportAsXLSX(onlySelection:boolean): void {
    let excelQueryParams = {...this.loadPageSubject$.getValue()};
    let label ="";
    if (onlySelection) {
      delete excelQueryParams['rows'];
      delete excelQueryParams['offset'];
      delete excelQueryParams['sortOrder'];
      delete excelQueryParams['sortField'];
      label = "filtered.";

    }
    else {
      excelQueryParams = {'actif': '1'};
      excelQueryParams['lienBanque'] = this.lienBanque;
    }
    let params = new URLSearchParams();
    for(let key in excelQueryParams){
      params.set(key, excelQueryParams[key])
    }
    this.organisationHttpService.getOrganisationReport(this.authService.accessToken, params.toString()).subscribe(
        (organisations: any[]) => {
          const cleanedList = [
          ];
          organisations.map((item) => {
            const cleanedItem = {};
            cleanedItem['Id'] = item.idDis;
            cleanedItem[$localize`:@@Organisation:Organisation`] =item.societe;
            cleanedItem[$localize`:@@OrgRefInt:Internal Reference`] =item.refInt;
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
            cleanedItem[$localize`:@@Adults:Adults`] =item.nPers - item.nNour - item.nBebe - item.nEnf - item.nAdo - item.n1824 - item.nSen;
            cleanedItem['Equivalents'] =item.nEq;
            cleanedList.push( cleanedItem);
          });

          cleanedList.push({}); // add empty line

          cleanedList.push({
            [$localize`:@@Organisation:Organisation`]: organisations.length,
            [$localize`:@@Families:Families`]: this.totalFamilies,
            [$localize`:@@Beneficiaries:Beneficiaries`]: this.totalPersons,
            [$localize`:@@Infants:Infants`]: this.totalInfants,
            [$localize`:@@Babies:Babies`]: this.totalBabies,
            [$localize`:@@Children:Children`]: this.totalChildren,
            [$localize`:@@TeenAgers:TeenAgers`]: this.totalTeens,
            [$localize`:@@YoungAdults:YoungAdults`]: this.totalYoungAdults,
            [$localize`:@@Adults:Adults`]: this.totalAdults,
            ['Seniors']: this.totalSeniors,
            ['Equivalents']: this.totalEq
          });

            this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.organisations.beneficiaries.' + label  + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');

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
  getTotalStatistics() {
    return $localize`:@@OrgTotalStatistics:Total for selection ${this.totalFamilies} families, ${this.totalPersons} persons,${this.totalEq} equivalents,${this.totalInfants} infants,${this.totalBabies} babies,${this.totalChildren} children,${this.totalTeens} teenagers,${this.totalYoungAdults} young adults,${this.totalAdults} adults,${this.totalSeniors} seniors`;
  }

  hasOrganisationAnomalies(organisation: Organisation) {
    if (!organisation.gestBen && organisation.nbRegisteredClients > 0) {
      return true;     }
    if (organisation.gestBen && organisation.nbRegisteredClients === 0) {
      return true;
    }
    if (organisation.gestBen && organisation.latestClientUpdate !== null) {
      const dayDifference = - moment(organisation.latestClientUpdate, 'DD/MM/YYYY').diff(moment(),'days');
      if (dayDifference > 30) {
        return true;
      }
    }
      return false;
  }

  generateToolTipMessageForOrganisationAnomalies(organisation: Organisation) {
    if (!organisation.gestBen && organisation.nbRegisteredClients > 0) {
      return $localize`:@@OrgBenAnomaly1:Anomaly: the organisation says it does not record beneficiaries but has encoded ${organisation.nbRegisteredClients} families`;
    }
    if (organisation.gestBen && organisation.nbRegisteredClients === 0) {
      return $localize`:@@OrgBenAnomaly2:Anomaly: the organisation says it records beneficiaries but has not encoded any families`;
    }
    if (organisation.gestBen && organisation.latestClientUpdate !== null) {
      const dayDifference = - moment(organisation.latestClientUpdate, 'DD/MM/YYYY').diff(moment(),'days');
      if (dayDifference > 60) {
        return $localize`:@@OrgBenAnomaly3:Anomaly: the organisation says it records beneficiaries but has not updated its families for ${dayDifference} days`;
      }
    }
    return '';
  }


  generateTooltipRegisteredClients() {
    return $localize`:@@OrgRegisteredClients:Nombre de familles encodées`;
  }

  generateTooltipLatestClientUpdate() {
    return $localize`:@@OrgLatestClientUpdate:Date de dernière mise à jour des familles encodées`;
  }
}


