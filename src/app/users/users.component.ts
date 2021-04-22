import { Component, OnInit } from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {User} from './model/user';
import {UserEntityService} from './services/user-entity.service';
import {Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {enmUserRolesAsso, enmUserRolesBankAsso, enmLanguageLegacy } from '../shared/enums';
import {OrganisationEntityService} from '../organisations/services/organisation-entity.service';
import {QueryParams} from '@ngrx/data';
import {Organisation} from '../organisations/model/organisation';


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
  filteredOrganisations: Organisation[];
  bankid: number;

  constructor(private userService: UserEntityService,
              private organisationService: OrganisationEntityService,
              private router: Router,
              private store: Store<AppState>
  ) {
      this.booCanCreate = false;
      this.rightOptions = enmUserRolesBankAsso;
      this.languageOptions = enmLanguageLegacy;
      this.bankid = 0;
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
            map((authState) => {
              if (authState.banque) {
                  this.bankid = authState.banque.bankId;
                  switch (authState.user.rights) {
                      case 'Bank':
                      case 'Admin_Banq':
                          this.filterBase = {'lienBanque': authState.banque.bankId};
                          this.rightOptions = enmUserRolesBankAsso;
                          if (authState.user.rights === 'Admin_Banq') {
                              this.booCanCreate = true;
                          }
                          break;
                      case 'Asso':
                      case 'Admin_Asso':
                          this.filterBase = {'idOrg': authState.organisation.idDis};
                          this.rightOptions = enmUserRolesAsso;
                          if (authState.user.rights === 'Admin_Asso') {
                              this.booCanCreate = true;
                          }
                          break;
                      default:
                  }
              }
             })
    ).subscribe();
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
     console.log('Lazy Loaded Event', event, 'FilterBase:', this.filterBase);
      this.loading = true;
      const queryParms = {...this.filterBase};
      queryParms['offset'] = event.first.toString();
      queryParms['rows'] = event.rows.toString();
      queryParms['sortOrder'] = event.sortOrder.toString();
      if (event.filters) {
          if (event.filters.idUser && event.filters.idUser.value) {
              queryParms['sortField'] = 'idUser';
              queryParms['searchField'] = 'idUser';
              queryParms['searchValue'] = event.filters.idUser.value;
          } else if (event.filters.userName && event.filters.userName.value) {
              queryParms['sortField'] = 'userName';
              queryParms['searchField'] = 'userName';
              queryParms['searchValue'] = event.filters.userName.value;
          } else if (event.filters.idOrg && event.filters.idOrg.value) {
              queryParms['sortField'] = 'userName';
              queryParms['idOrg'] = event.filters.idOrg.value;
          } else if (event.filters.idLanguage && event.filters.idLanguage.value) {
              queryParms['sortField'] = 'idLanguage';
              queryParms['searchField'] = 'idLanguage';
              queryParms['searchValue'] = event.filters.idLanguage.value;
          } else if (event.filters.email && event.filters.email.value) {
              queryParms['sortField'] = 'email';
              queryParms['searchField'] = 'email';
              queryParms['searchValue'] = event.filters.email.value;
          } else if (event.filters.rights && event.filters.rights.value) {
              queryParms['sortField'] = 'rights';
              queryParms['searchField'] = 'rights';
              queryParms['searchValue'] = event.filters.rights.value;
          }
      }
     if (!queryParms.hasOwnProperty('sortField')) {
         if (event.sortField) {
             queryParms['sortField'] = event.sortField;
         } else {
             queryParms['sortField'] = 'userName';
         }
     }
     this.loadPageSubject$.next(queryParms);
  }

    filterOrganisation(event ) {
      console.log('Got Query with value:', event, 'bankid:', this.bankid);
        const  queryOrganisationParms: QueryParams = {};
        queryOrganisationParms['offset'] = '0';
        queryOrganisationParms['rows'] = '10';
        queryOrganisationParms['sortField'] = 'societe';
        queryOrganisationParms['sortOrder'] = '1';
        queryOrganisationParms['lienBanque'] = this.bankid.toString();
        queryOrganisationParms['searchField'] = 'societe';
        queryOrganisationParms['searchValue'] = event.query.toLowerCase();
        this.organisationService.getWithQuery(queryOrganisationParms)
            .subscribe(filteredOrganisations => {
                this.filteredOrganisations = filteredOrganisations.map((organisation) =>
                    Object.assign({}, organisation, {fullname: organisation.societe})
                );
            });
    }
}
