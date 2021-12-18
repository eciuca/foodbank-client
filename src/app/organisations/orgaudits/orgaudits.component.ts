import {Component,  OnInit} from '@angular/core';
import {Orgaudit} from '../model/orgaudit';
import {OrgauditEntityService} from '../services/orgaudit-entity.service';
import {BehaviorSubject} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {AuthState} from '../../auth/reducers';



@Component({
  selector: 'app-orgaudits',
  templateUrl: './orgaudits.component.html',
  styleUrls: ['./orgaudits.component.css']
})

export class OrgauditsComponent implements OnInit {
  lienBanque: number;
  loadPageSubject$ = new BehaviorSubject(null);
  selectedOrgAuditId$ = new BehaviorSubject(0);
  orgaudits: Orgaudit[];
  filterBase: any;
  displayDialog: boolean;
  loading: boolean;
  booCanCreate: boolean;
  booIsAdmin: boolean;
  first: number;
  totalRecords: number;
  constructor(private orgauditService: OrgauditEntityService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store
  ) {
    this.booCanCreate = false;
    this.booIsAdmin = false;
    this.first = 0;
    this.totalRecords = 0;
    this.filterBase = {};
    this.lienBanque = 0;
  }
  ngOnInit() {
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.orgauditService.getWithQuery(queryParams))
        )
        .subscribe(loadedOrgaudits => {
          console.log('Loaded orgaudits from nextpage: ' + loadedOrgaudits.length);
          if (loadedOrgaudits.length > 0) {
            this.totalRecords = loadedOrgaudits[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.orgaudits  = loadedOrgaudits;
          this.loading = false;
          this.orgauditService.setLoaded(true);
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
    if (authState.user) {
      this.lienBanque = authState.banque.bankId;
      this.filterBase = { 'lienBanque': authState.banque.bankId};
      if (authState.user.rights === 'Admin_Banq') {
        this.booIsAdmin = true;
      }
    }
  }
  handleSelect(orgaudit) {
    console.log( 'Orgaudit was selected', orgaudit);
    this.selectedOrgAuditId$.next(orgaudit.auditId);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedOrgAuditId$.next(0);
    this.displayDialog = true;
  }

  handleOrgauditQuit() {
    this.displayDialog = false;
  }

  handleOrgauditUpdate(updatedOrgaudit) {
    const index = this.orgaudits.findIndex(orgaudit => orgaudit.auditId === updatedOrgaudit.auditId);
    this.orgaudits[index] = updatedOrgaudit;
    this.displayDialog = false;
  }
  handleOrgauditCreate(createdOrgaudit: Orgaudit) {
    this.orgaudits.push({...createdOrgaudit});
    this.displayDialog = false;
  }

  handleOrgauditDeleted(deletedOrgaudit) {
    const index = this.orgaudits.findIndex(orgaudit => orgaudit.auditId === deletedOrgaudit.auditId);
    this.orgaudits.splice(index, 1);
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
      queryParms['sortField'] = 'lienDis';
    }
    this.loadPageSubject$.next(queryParms);
  }
}


