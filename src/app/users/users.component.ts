import { Component, OnInit } from '@angular/core';
import {filter, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {User} from './model/user';
import {UserEntityService} from './services/user-entity.service';
import {Router} from '@angular/router';
import {globalAuthState, isLoggedIn} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {enmUserRolesAsso, enmUserRolesBankAsso, enmLanguage } from '../shared/enums';
import {QueryParams} from '@ngrx/data';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdUser$ = new BehaviorSubject(null);
  users: User[];
  cols: any[];
  totalRecords: number;
  loading: boolean;
  filterBase: any;
  displayDialog: boolean;
  booCanCreate: boolean;
  rightOptions: any[];
  languageOptions: any[];
  filteredOrganisation: any;
  filteredOrganisations: any[];
  filteredOrganisationsPrepend: any[];
  bankid: number;
    bankName: string;
    orgName: string; // if logging in with asso role we need to display the organisation
    first: number;
  booShowOrganisations: boolean;
  constructor(private userService: UserEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private router: Router,
              private store: Store<AppState>
  ) {
      this.booCanCreate = false;
      this.rightOptions = enmUserRolesBankAsso;
      this.languageOptions = enmLanguage;
      this.bankid = 0;
      this.bankName = '';
      this.orgName = '';
      this.first = 0;
      this.booShowOrganisations = false;
      this.filteredOrganisationsPrepend = [
          {idDis: 0, societe: $localize`:@@bank:Bank` },
          {idDis: null, societe: $localize`:@@organisations:Organisations` },
      ];
      this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
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
                        if (authState.user.rights === 'Admin_Banq') {
                            this.booCanCreate = true;
                        }
                        break;
                    case 'Asso':
                    case 'Admin_Asso':
                        this.filterBase = {'idOrg': authState.organisation.idDis};
                        this.orgName = authState.organisation.societe;
                        this.rightOptions = enmUserRolesAsso;
                        if (authState.user.rights === 'Admin_Asso') {
                            this.booCanCreate = true;
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
    showDialogToAdd() {
        this.selectedIdUser$.next('new');
        this.displayDialog = true;
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
    handleUserCreate(createdUser: User) {
        this.users.push({...createdUser});
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
            }
            if (event.filters) {
                if (event.filters.idUser && event.filters.idUser.value) {
                    queryParms['idUser'] =  event.filters.idUser.value;
                }
                if (event.filters.membreNom && event.filters.membreNom.value) {
                    queryParms['membreNom'] = event.filters.membreNom.value;
                }
                if (event.filters.membrePrenom && event.filters.membrePrenom.value) {
                    queryParms['membrePrenom'] = event.filters.membrePrenom.value;
                }
                if (event.filters.membreLangue && event.filters.membreLangue.value) {
                        queryParms['membreLangue'] = event.filters.membreLangue.value;
                }
                if (event.filters.membreEmail && event.filters.membreEmail.value) {
                        queryParms['membreEmail'] = event.filters.membreEmail.value;
                }
                if (event.filters.rights && event.filters.rights.value) {
                        queryParms['rights'] = event.filters.rights.value;
                }
            }

            this.loadPageSubject$.next(queryParms)
        })
     ;
  }

    filterOrganisation(event ) {
        const  queryOrganisationParms: QueryParams = {};
        queryOrganisationParms['lienBanque'] = this.bankid.toString();
        queryOrganisationParms['societe'] = event.query.toLowerCase();
        this.orgsummaryService.getWithQuery(queryOrganisationParms)
            .subscribe(filteredOrganisations => {
                this.filteredOrganisations = this.filteredOrganisationsPrepend.concat(filteredOrganisations.map((organisation) =>
                    Object.assign({}, organisation, {fullname: organisation.societe})
                ));
            });
    }
    filterOrganisationUsers(idDis: number) {
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
        latestQueryParams['offset'] = '0';
        console.log('Latest Query Parms and new IdOrg', latestQueryParams, idDis);
        // when we switch from active to archived list and vice versa , we need to restart from first page
        if (idDis != null) {
            latestQueryParams['idOrg'] = idDis;
        } else {
            if (latestQueryParams.hasOwnProperty('idOrg')) {
                delete latestQueryParams['idOrg'];
            }
        }
        this.loadPageSubject$.next(latestQueryParams);
    }

    labelLanguage(membreLangue: number) {
            switch (membreLangue) {
                case 1:
                    return 'Fr';
                case 2:
                    return 'Nl';
                case 3:
                    return 'En';
                default:
                    return '?';
            }


        }
}
