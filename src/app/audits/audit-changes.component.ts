import {Component, OnInit} from '@angular/core';
import {AuditChange} from './model/auditChange';
import {AuditChangeEntityService} from './services/auditChange-entity.service';
import {BehaviorSubject} from 'rxjs';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {LazyLoadEvent} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {enmApp, enmDbChangeActions, enmDbChangeEntities,enmDbChangeEntitiesAdmin, enmUserRoles} from '../shared/enums';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {AuthState} from '../auth/reducers';

@Component({
  selector: 'app-audit-changes',
  templateUrl: './audit-changes.component.html',
  styleUrls: ['./audit-changes.component.css']
})

export class AuditChangesComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  auditChanges: AuditChange[];
  loading: boolean;
  first: number;
  totalRecords: number;
  fromDate: any;
  booRangeFilter: boolean;
  toDate: Date;
  bankOptions: any[];
  rightOptions: any[];
  appOptions: any[];
  filterBase: any;
  lienBanque: number;
  actionOptions: any[];
  entityOptions: any[];
  constructor(
      private auditChangeService: AuditChangeEntityService,
      private banqueService: BanqueEntityService,
      private store: Store,
      public datepipe: DatePipe
  ) {
    this.first = 0;
    this.totalRecords = 0;
    this.rightOptions = enmUserRoles;
    this.appOptions = enmApp;
    this.actionOptions = enmDbChangeActions;

  }

  ngOnInit() {
    this.fromDate = new Date();
    this.fromDate.setDate(this.fromDate.getDate() - 30);
    this.booRangeFilter = true;
    this.toDate = new Date();
    this.toDate.setDate(this.toDate.getDate() + 1);
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.auditChangeService.getWithQuery(queryParams))
        )
        .subscribe(loadedAuditChanges => {
          console.log('Loaded auditChanges from nextpage: ' + loadedAuditChanges.length);
          if (loadedAuditChanges.length > 0) {
            this.totalRecords = loadedAuditChanges[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.auditChanges  = loadedAuditChanges;
          this.loading = false;
          this.auditChangeService.setLoaded(true);
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
  private initializeDependingOnUserRights(authState: AuthState) {
    if (['Admin_FBBA','Admin_Banq'].includes(authState.user.rights)) {
      this.lienBanque = authState.banque.bankId;
      this.filterBase = { 'bankShortName': authState.banque.bankShortName};
      this.entityOptions = enmDbChangeEntities;
    }

    if (authState.user.rights === 'admin') {
      this.lienBanque = 0;
      this.filterBase = {};
      this.entityOptions = [...enmDbChangeEntities];
      this.entityOptions.concat(enmDbChangeEntitiesAdmin);
      this.banqueService.getAll()
          .pipe(
              tap((banquesEntities) => {
                console.log('Banques now loaded:', banquesEntities.length);
                this.bankOptions = banquesEntities.map(({bankShortName}) => ({'label': bankShortName, 'value': bankShortName}));
              })
          ).subscribe();
    }
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
      queryParms['sortField'] =  'dateIn';
    }
    if (event.filters) {
      if (event.filters.userName && event.filters.userName.value) {
        queryParms['userName'] = event.filters.userName.value;
      }
      if (event.filters.user && event.filters.user.value) {
        queryParms['user'] = event.filters.user.value;
      }
      if (event.filters.bankShortName && event.filters.bankShortName.value) {
        queryParms['bankShortName'] = event.filters.bankShortName.value;
      }
      if (event.filters.idDis && event.filters.idDis.value) {
        queryParms['idDis'] = event.filters.idDis.value;
      }
      if (event.filters.societe && event.filters.societe.value) {
        queryParms['societe'] = event.filters.societe.value;
      }
      if (event.filters.entity && event.filters.entity.value) {
        queryParms['entity'] = event.filters.entity.value;
      }
      if (event.filters.entity_key && event.filters.entity_key.value) {
        queryParms['entity_key'] = event.filters.entity_key.value;
      }
      if (event.filters.action && event.filters.action.value) {
        queryParms['action'] = event.filters.action.value;
      }
      if (this.booRangeFilter ) {
        queryParms['fromDate'] = this.datepipe.transform(this.fromDate, 'yyyy-MM-dd');
        queryParms['toDate'] = this.datepipe.transform(this.toDate, 'yyyy-MM-dd');
      }
    }
    this.loadPageSubject$.next(queryParms);
  }

  changeSetRangeFilter($event: any) {
    console.log('Range Filter is now:', $event);
    this.booRangeFilter = $event.checked;
    this.changeDateRangeFilter();
  }
  changeDateRangeFilter() {
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    console.log('Latest Query Parms', latestQueryParams);
    // we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (this.booRangeFilter ) {
      latestQueryParams['fromDate'] = this.datepipe.transform(this.fromDate, 'yyyy-MM-dd');
      latestQueryParams['toDate'] = this.datepipe.transform(this.toDate, 'yyyy-MM-dd');
    } else {
      if ( latestQueryParams.hasOwnProperty('fromDate')) {
        delete  latestQueryParams['fromDate'];
      }
      if ( latestQueryParams.hasOwnProperty('toDate')) {
        delete  latestQueryParams['toDate'];
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }
  labelForEntity(entity: string) {
    const indexLabel = this.entityOptions.findIndex(obj => obj.value === entity);
    if (indexLabel >= 0) {
      return this.entityOptions[indexLabel].label;
    }
    return entity; // should not happen if so we return the entity
  }

}

