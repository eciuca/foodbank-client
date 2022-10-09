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
import {enmYn, enmStatusCompany, enmOrgCategories} from '../../shared/enums';
import {RegionEntityService} from '../services/region-entity.service';
import {DepotEntityService} from '../../depots/services/depot-entity.service';
import {QueryParams} from '@ngrx/data';


@Component({
  selector: 'app-orgfeadoverview',
  templateUrl: './orgfeadoverview.component.html',
  styleUrls: ['./orgfeadoverview.component.css']
})

export class OrgfeadoverviewComponent implements OnInit {

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
  bankShortName: string;
  lienBanque: number;
  depotName: string;
  first: number;
  regionSelected: number;
  depotSelected: string;
  feadSelected: string;
  statutSelected: string;
  statuts: any[];
  constructor(private organisationService: OrganisationEntityService,
              private regionService: RegionEntityService,
              private depotService: DepotEntityService,
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
    if (this.regionSelected) {
      queryParms['regId'] = this.regionSelected;
    }
    if (this.depotSelected) {
      queryParms['lienDepot'] = this.depotSelected;
    }
    if (this.statutSelected && (this.statutSelected !== '')) {
      queryParms['statut'] = this.statutSelected;
    }
    if (this.feadSelected ) {
      queryParms['isFead'] = this.feadSelected;
    }
    if (event.filters) {
      if (event.filters.idDis && event.filters.idDis.value) {
        queryParms['idDis'] = event.filters.idDis.value;
      }
      if (event.filters.societe && event.filters.societe.value) {
        queryParms['societe'] = event.filters.societe.value;
      }
      if (event.filters.agreed && event.filters.agreed.value != null) {
        queryParms['agreed'] = event.filters.agreed.value;
      }
      if (event.filters.birbCode && event.filters.birbCode.value !== null) {
        queryParms['birbCode'] = event.filters.birbCode.value;
      }
      if (event.filters.feadN && event.filters.feadN.value !== null) {
        queryParms['feadN'] = event.filters.feadN.value;
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
  filterFEAD(isFead) {
    console.log('FEAD filter is now:', isFead);
    this.feadSelected = isFead;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    console.log('Latest statut Query Parms', latestQueryParams);
    // when we switch f, we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (isFead != null) {
      latestQueryParams['isFead'] = isFead;
    } else {
      if (latestQueryParams.hasOwnProperty('isFead')) {
        delete latestQueryParams['isFead'];
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }
  generateTooltipAgreed() {
    return $localize`:@@OrgToolTipIsAgreed:Is Organisation Agreed?`;
  }

  generateTooltipUsesFEAD() {
    return $localize`:@@OrgToolTipUsesFEAD:Does Organisation Receive FEAD ?`;
  }

  generateTooltipFEADPersons() {
    return $localize`:@@OrgToolTipFEADPersons:Nb of Persons Agreed by FEAD`;
  }

  generateTooltipFEADFromUs() {
    return $localize`:@@OrgToolTipFEADFromUs:Is FEAD distributed by Food Banks ?`;
  }

  generateTooltipFEADCode() {
    return $localize`:@@OrgToolTipFEADCode:FEAD Code of the Organisation`;
  }


}

