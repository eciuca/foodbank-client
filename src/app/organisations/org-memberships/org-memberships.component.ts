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
import {enmYn} from '../../shared/enums';


@Component({
  selector: 'app-org-memberships',
  templateUrl: './org-memberships.component.html',
  styleUrls: ['./org-memberships.component.css']
})
export class OrgMembershipsComponent implements OnInit {

  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdDis$ = new BehaviorSubject(0);

  organisation: Organisation = null;
  organisations: Organisation[];
  displayDialog: boolean;
  totalRecords: number;
  YNOptions:  any[];
  loading: boolean;
  filterBase: any;
  bankName: string;
  lienBanque: number;
  first: number;
  constructor(private organisationService: OrganisationEntityService,
              private router: Router,
              private route: ActivatedRoute,
              private store: Store<AppState>
  ) {
    this.lienBanque = 0;
    this.bankName = '';
    this.first = 0;
    this.YNOptions = enmYn;
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

    if (event.filters) {
      if (event.filters.idDis && event.filters.idDis.value) {
        queryParms['idDis'] = event.filters.idDis.value;
      }
      if (event.filters.societe && event.filters.societe.value) {
        queryParms['societe'] = event.filters.societe.value;
      }
      if (event.filters.cotAnnuelle && event.filters.cotAnnuelle.value != null) {
        queryParms['cotAnnuelle'] = event.filters.cotAnnuelle.value;
      }
      if (event.filters.cotSup && event.filters.cotSup.value != null) {
        queryParms['cotSup'] = event.filters.cotSup.value;
      }

    }
    this.loadPageSubject$.next(queryParms);
  }
  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.banque) {
      this.lienBanque = authState.banque.bankId;
      this.filterBase = {'lienBanque': authState.banque.bankId, 'actif': '1'};
      this.bankName = authState.banque.bankName;
    }

  }
  getTitle(): string {
      return $localize`:@@BankOrgsTitleMembershipActive:Memberships of Active Organisations of bank ${this.bankName} `;
  }

}



