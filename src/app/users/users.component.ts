import { Component, OnInit } from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {User} from './model/user';
import {UserEntityService} from './services/user-entity.service';
import {Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {FilterMatchMode, LazyLoadEvent, SelectItem} from 'primeng/api';
import {QueryParams} from '@ngrx/data';
import {AuthState} from '../auth/reducers';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  userUpdateSubject$ = new Subject<User>();
  user: User = null;
  users: User[];
  cols: any[];
  title: string;
  totalRecords: number;
  loading: boolean;
  filterBase: any;
    displayDialog: boolean;

  constructor(private userService: UserEntityService,
              private router: Router,
              private store: Store<AppState>
  ) { }

  ngOnInit() {
      this.reload();

      // this.userUpdateSubject$
      //   .subscribe(updatedUser => {
      //     const index = this.users.findIndex(user => user.idUser === updatedUser.idUser);
      //     this.users[index] = updatedUser;
      //   })

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
                switch (authState.user.rights) {
                  case 'Bank':
                  case 'Admin_Banq':
                    this.title = 'Utilisateurs de la ' + authState.banque.bankName;
                    break;
                  case 'Asso':
                  case 'Admin_Asso':
                    this.title = `Utilisateurs de la Banque ${authState.banque.bankName} ${authState.organisation.societe}` ;
                    break;
                  default:
                    this.title = 'Utilisateurs de toutes les banques';
                }

              } else {
                this.title = 'Utilisateurs de toutes les banques';
              }
            })
        )
        .subscribe();


    this.cols = [
      { field: 'idUser', header: 'Login' },
      { field: 'userName', header: 'Nom Utilisateur' },
      { field: 'idLanguage', header: 'Langue' },
      { field: 'email', header: 'E-mail' },
      { field: 'rights', header: 'Droits' }
    ];

  }
  handleSelect(user) {
    console.log( 'User was selected', user);
    this.displayDialog = true;
    this.user = user;
  }

  handleUserUpdate(updatedUser) {
    const index = this.users.findIndex(user => user.idUser === updatedUser.idUser);
    this.users[index] = updatedUser;
    this.displayDialog = false;
  }

  handleUserDeleted() {
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

 nextPage(event: LazyLoadEvent) {
     console.log('Lazy Loaded Event', event);
      this.loading = true;
     if (event.sortField == null) {
         setTimeout(() => {
             console.log('waiting first 250ms for reset to take place');
         }, 250);
     }
      const queryParms = {...this.filterBase};
      queryParms['offset'] = event.first.toString();
      queryParms['rows'] = event.rows.toString();
      queryParms['sortOrder'] = event.sortOrder.toString();
      if (event.filters) {
          if (event.filters.idUser && event.filters.idUser.value) {
              queryParms['sortField'] = 'idUser';
              queryParms['searchField'] = 'idUser';
              queryParms['searchValue'] = event.filters.idUser.value;
          }
          if (event.filters.userName && event.filters.userName.value) {
              queryParms['sortField'] = 'userName';
              queryParms['searchField'] = 'userName';
              queryParms['searchValue'] = event.filters.userName.value;
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

}
