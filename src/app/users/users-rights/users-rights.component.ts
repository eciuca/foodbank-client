import { Component, OnInit } from '@angular/core';
import {filter, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {User} from '../model/user';
import {UserEntityService} from '../services/user-entity.service';
import {Router} from '@angular/router';
import {globalAuthState, isLoggedIn} from '../../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {enmUserRolesAsso, enmUserRolesBankAsso, enmLanguage, enmYn } from '../../shared/enums';
import {QueryParams} from '@ngrx/data';
import {OrgSummaryEntityService} from '../../organisations/services/orgsummary-entity.service';
import {labelRights} from '../../shared/functions';


@Component({
  selector: 'app-users-rights',
  templateUrl: './users-rights.component.html',
  styleUrls: ['./users-rights.component.css']
})
export class UsersRightsComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdUser$ = new BehaviorSubject(null);
  users: User[];
  cols: any[];
  totalRecords: number;
  loading: boolean;
  filterBase: any;
  displayDialog: boolean;
  rightOptions: any[];
  languageOptions: any[];
  filteredOrganisation: any;
  filteredOrganisations: any[];
  filteredOrganisationsPrepend: any[];
  bankid: number;
  bankName: string;
  first: number;
  booShowOrganisations: boolean;
  booIsorganisation: boolean;
  lienDepot: number;
  depotName: string;
  isUserAdmin: boolean;
  YNOptions:  any[];
  constructor(private userService: UserEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private router: Router,
              private store: Store<AppState>
  ) {
    this.rightOptions = enmUserRolesBankAsso;
    this.languageOptions = enmLanguage;
    this.bankid = 0;
    this.bankName = '';
    this.lienDepot = 0;
    this.depotName = '';
    this.first = 0;
    this.isUserAdmin = false;
    this.booIsorganisation = false;
    this.booShowOrganisations = false;
    this.YNOptions = enmYn;
  }

  ngOnInit() {
    this.reload();

    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.userService.getWithQuery(queryParams))
        )
        .subscribe(loadedUsers => {
          console.log('Loaded users from nextpage: ' + loadedUsers.length);
          if (loadedUsers.length > 0) {
            this.totalRecords = loadedUsers[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.users  = loadedUsers;
          this.loading = false;
          this.userService.setLoaded(true);
        });
  }

  reload() {
    this.loading = true;
    this.totalRecords = 0;

    this.store
        .pipe(
            select(globalAuthState),
            filter(authState => authState.isLoggedIn)
        ).subscribe((authState) => {
      console.log('Entering Users component with authState:', authState);
      if (authState.banque) {
        this.bankid = authState.banque.bankId;
        this.bankName = authState.banque.bankName;
        switch (authState.user.rights) {
          case 'Bank':
          case 'Admin_Banq':
            this.booShowOrganisations = true;
            this.filterBase = {'lienBanque': authState.banque.bankId};
            this.rightOptions = enmUserRolesBankAsso;
            if (authState.user.rights === 'Admin_Banq' || authState.user.gestMemb === true) {
              this.isUserAdmin = true;
            }
            this.filteredOrganisationsPrepend = [
              {idDis: null, fullname: $localize`:@@All:All` },
              {idDis: 0, fullname: $localize`:@@bank:Bank` },
              {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
            ];
            this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
            break;
          case 'Asso':
          case 'Admin_Asso':
            this.booIsorganisation = true;
            if (authState.organisation && authState.organisation.depyN === true) {
              this.booShowOrganisations = true;
              this.lienDepot = authState.organisation.idDis;
              this.depotName = authState.organisation.societe;
              this.filteredOrganisationsPrepend = [
                {idDis: null, fullname: 'Depot' },
                {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
              ];
              this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
            } else {
              this.filterBase = {'idOrg': authState.organisation.idDis};
            }
            this.rightOptions = enmUserRolesAsso;
            if (authState.user.rights === 'Admin_Asso' || authState.user.gestMemb === true) {
              this.isUserAdmin = true;
            }
            break;
          default:
            console.log('Entering Users component with unsupported user rights, see complete authstate:', authState);
        }
      }
      console.log('Users FilterBase is: ', this.filterBase);
    });
  }
  handleSelect(user) {
    console.log( 'User was selected', user);
    this.displayDialog = true;
    this.selectedIdUser$.next(user.idUser);
  }

  handleUserQuit() {
    this.displayDialog = false;
  }

  handleUserUpdate(updatedUser) {
    const index = this.users.findIndex(user => user.idUser === updatedUser.idUser);
    this.users[index] = updatedUser;
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }


  handleUserDeleted(deletedUser) {
    const index = this.users.findIndex(user => user.idUser === deletedUser.idUser);
    this.users.splice(index, 1);
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

  nextPage(event: LazyLoadEvent) {
    this.store
        .pipe(
            select(isLoggedIn),
            filter(isLoggedIn => isLoggedIn))
        .subscribe(_ => {
          console.log('Lazy Loaded Event', event, 'FilterBase:', this.filterBase);
          this.loading = true;
          const queryParms = {...this.filterBase};
          queryParms['offset'] = event.first.toString();
          queryParms['rows'] = event.rows.toString();
          queryParms['sortOrder'] = event.sortOrder.toString();
          if (event.sortField) {
            queryParms['sortField'] = event.sortField.toString();
          } else {
            queryParms['sortField'] =  'idUser';
          }
          if (this.booShowOrganisations && this.filteredOrganisation && this.filteredOrganisation.idDis != null) {
            queryParms['idOrg'] = this.filteredOrganisation.idDis;
          } else {
            if ( this.lienDepot !== 0) {
              queryParms['idOrg'] = this.lienDepot;
            }
          }
          queryParms['actif'] = '1';
          if (event.filters) {
            if (event.filters.idUser && event.filters.idUser.value) {
              queryParms['idUser'] =  event.filters.idUser.value;
            }
            if (event.filters.membreNom && event.filters.membreNom.value) {
              queryParms['membreNom'] = event.filters.membreNom.value;
            }
            if (event.filters.rights && event.filters.rights.value) {
              queryParms['rights'] = event.filters.rights.value;
            }
            if (event.filters.gestMemb && event.filters.gestMemb.value) {
              queryParms['gestMemb'] = event.filters.gestMemb.value;
            }
            if (event.filters.gestBen && event.filters.gestBen.value) {
              queryParms['gestBen'] = event.filters.gestBen.value;
            }
            if (event.filters.gestFead && event.filters.gestFead.value) {
              queryParms['gestFead'] = event.filters.gestFead.value;
            }
            if (event.filters.gestDon && event.filters.gestDon.value) {
              queryParms['gestDon'] = event.filters.gestDon.value;
            }
          }

          this.loadPageSubject$.next(queryParms);
        })
    ;
  }

  filterOrganisation(event ) {
    const  queryOrganisationParms: QueryParams = {};
    queryOrganisationParms['lienBanque'] = this.bankid.toString();
    if (this.lienDepot === 0) {
      queryOrganisationParms['lienBanque'] = this.bankid.toString();
    }  else {
      queryOrganisationParms['lienDepot'] = this.lienDepot.toString();
    }
    if (event.query.length > 0) {
      queryOrganisationParms['societe'] = event.query.toLowerCase();
    }
    this.orgsummaryService.getWithQuery(queryOrganisationParms)
        .subscribe(filteredOrganisations => {
          this.filteredOrganisations = this.filteredOrganisationsPrepend.concat(filteredOrganisations.map((organisation) =>
              Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
          ));
        });
  }
  filterOrganisationUsers(idDis: number) {
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    latestQueryParams['offset'] = '0';
    if (idDis === 999) {

      if (this.lienDepot != 0) {
        latestQueryParams['lienDepot'] = this.lienDepot;
        if (latestQueryParams.hasOwnProperty('idOrg')) {
          delete latestQueryParams['idOrg'];
        }
      }
      else {
        latestQueryParams['idOrg'] = 999;
      }

    }
    else if (idDis != null) {
      latestQueryParams['idOrg'] = idDis;
      if (latestQueryParams.hasOwnProperty('lienDepot')) {
        delete latestQueryParams['lienDepot'];
      }
    }
    else {
      if (this.lienDepot != 0) {
        latestQueryParams['idOrg'] = this.lienDepot;
        if (latestQueryParams.hasOwnProperty('lienDepot')) {
          delete latestQueryParams['lienDepot'];
        }
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }

  labelRights(rights: string) {
    return labelRights(rights);

  }
  getTitle(): string {
    if ( this.depotName) {
        return $localize`:@@DepotUserRightsTitle:Rights of Users of depot ${this.depotName} `;
      } else {
        return $localize`:@@BankUsersRightsTitle:Rights of Users of bank ${this.bankName} `;
    }
  }
}

