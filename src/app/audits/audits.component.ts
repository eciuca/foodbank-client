import {Component,  OnInit} from '@angular/core';
import {Audit} from './model/audit';
import {AuditEntityService} from './services/audit-entity.service';
import {BehaviorSubject} from 'rxjs';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {LazyLoadEvent} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {enmUserRoles} from '../shared/enums';

@Component({
  selector: 'app-audits',
  templateUrl: './audits.component.html',
  styleUrls: ['./audits.component.css']
})

export class AuditsComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  audits: Audit[];
  audit: Audit = null;
  loading: boolean;
  first: number;
  totalRecords: number;
  fromDate: any;
  booRangeFilter: boolean;
  toDate: Date;
  bankOptions: any[];
  rightOptions: any[];
  constructor(
      private auditService: AuditEntityService,
      private banqueService: BanqueEntityService,
      public datepipe: DatePipe
  ) {
    this.first = 0;
    this.totalRecords = 0;
    this.rightOptions = enmUserRoles;
  }
  ngOnInit() {
    this.loading = true;
    this.totalRecords = 0;
    this.fromDate = new Date();
    this.fromDate.setDate(this.fromDate.getDate() - 30);
    this.toDate = new Date();
    this.banqueService.getAll()
        .pipe(
            tap( (banquesEntities) => {
              console.log('Banques now loaded:', banquesEntities);
              this.bankOptions = banquesEntities.map(({bankShortName}) => ({ 'label': bankShortName, 'value': bankShortName}));
            })
          ).subscribe();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.auditService.getWithQuery(queryParams))
        )
        .subscribe(loadedAudits => {
          console.log('Loaded audits from nextpage: ' + loadedAudits.length);
          if (loadedAudits.length > 0) {
            this.totalRecords = loadedAudits[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.audits  = loadedAudits;
          this.loading = false;
          this.auditService.setLoaded(true);
        });
  }

  nextPage(event: LazyLoadEvent) {
    console.log('Lazy Loaded Event', event);
    this.loading = true;
    const queryParms = {};
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
      if (event.filters.shortBankName && event.filters.shortBankName.value) {
        queryParms['shortBankName'] = event.filters.shortBankName.value;
      }
      if (event.filters.idDis && event.filters.idDis.value) {
        queryParms['idDis'] = event.filters.idDis.value;
      }
      if (event.filters.societe && event.filters.societe.value) {
        queryParms['societe'] = event.filters.societe.value;
      }
      if (event.filters.rights && event.filters.rights.value) {
        queryParms['rights'] = event.filters.rights.value;
      }
      if (this.booRangeFilter ) {
        queryParms['fromDate'] = this.datepipe.transform(this.fromDate, 'yyyy-MM-dd');
        queryParms['toDate'] = this.datepipe.transform(this.toDate, 'yyyy-MM-dd');
      }
    }
    this.loadPageSubject$.next(queryParms);
  }

  changeDateRangeFilter($event: any) {
    console.log('Range Filter is now:', $event);
    this.booRangeFilter = $event.checked;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    console.log('Latest Query Parms', latestQueryParams);
    // when we switch from active to archived list and vice versa , we need to restart from first page
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
}
