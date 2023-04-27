import {Component, OnInit} from '@angular/core';
import {AuditUser} from './model/auditUser';
import {AuditUserEntityService} from './services/audit-user-entity.service';
import {BehaviorSubject} from 'rxjs';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {LazyLoadEvent} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {enmApp,  enmUserRoles} from '../shared/enums';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {AuthState} from '../auth/reducers';

@Component({
    selector: 'app-audit-users',
    templateUrl: './audit-users.component.html',
    styleUrls: ['./audit-users.component.css']
})

export class AuditUsersComponent implements OnInit {
    loadPageSubject$ = new BehaviorSubject(null);
    auditUsers: AuditUser[];
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
    actionOptions: any;
    entityOptions: any;
    constructor(
        private auditUserService: AuditUserEntityService,
        private banqueService: BanqueEntityService,
        private store: Store,
        public datepipe: DatePipe
    ) {
        this.first = 0;
        this.totalRecords = 0;
        this.rightOptions = enmUserRoles;
        this.appOptions = enmApp;
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
                mergeMap(queryParams => this.auditUserService.getWithQuery(queryParams))
            )
            .subscribe(loadedAuditUsers => {
                console.log('Loaded auditUsers from nextpage: ' + loadedAuditUsers.length);
                if (loadedAuditUsers.length > 0) {
                    this.totalRecords = loadedAuditUsers[0].totalRecords;
                }  else {
                    this.totalRecords = 0;
                }
                this.auditUsers  = loadedAuditUsers;
                this.loading = false;
                this.auditUserService.setLoaded(true);
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
        }

        if (authState.user.rights === 'admin') {
            this.lienBanque = 0;
            this.filterBase = {};
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
            queryParms['sortField'] =  'user';
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
                queryParms['societe'] = event.filters.societe.value;            }

            if (this.booRangeFilter ) {
                queryParms['fromDate'] = this.datepipe.transform(this.fromDate, 'yyyy-MM-dd');
                queryParms['toDate'] = this.datepipe.transform(this.toDate, 'yyyy-MM-dd');
            }
        }
        this.loadPageSubject$.next(queryParms);
    }

    userSetRangeFilter($event: any) {
        console.log('Range Filter is now:', $event);
        this.booRangeFilter = $event.checked;
        this.userDateRangeFilter();
    }
    userDateRangeFilter() {
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


}

