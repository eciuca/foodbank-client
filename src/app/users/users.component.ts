import { Component, OnInit } from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
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
  // tslint:disable-next-line:component-selector
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  user: User = null;
  users: User[];
  cols: any[];
  title: string;
  totalRecords: number;
  loading: boolean;
  filterBase: any;
  matchModes: SelectItem[];

  constructor(private userService: UserEntityService,
              private router: Router,
              private store: Store<AppState>
  ) { }

  ngOnInit() {
        this.reload();
  }

  reload() {
      this.loading = true;
      this.totalRecords = 0;
      this.matchModes =  [
          { label: 'Contains', value: FilterMatchMode.CONTAINS }
      ];
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
      { field: 'userName', header: 'Nom Utilisateur' },
      { field: 'idLanguage', header: 'Langue' },
      { field: 'email', header: 'E-mail' },
      { field: 'rights', header: 'Droits' }
    ];

  }
  handleSelect(user) {
    console.log( 'User was selected', user);
    this.user = {...user};
    this.router.navigateByUrl(`/users/${user.idUser}`);
  }
 nextPage(event: LazyLoadEvent) {
     console.log('Lazy Loaded Event', event);
      this.loading = true;
      const queryParms = {...this.filterBase};
      queryParms['offset'] = event.first.toString();
      queryParms['rows'] = event.rows.toString();
      queryParms['sortOrder'] = event.sortOrder.toString();
      if (event.filters) {
          if (event.filters.userName && event.filters.userName.value) {
              queryParms['sortField'] = 'userName';
              queryParms['searchField'] = 'userName';
              queryParms['searchValue'] = event.filters.userName.value;
          } else if (event.filters.idLanguage && event.filters.idLanguage.value) {
              queryParms['sortField'] = 'idLanguage';
              queryParms['searchField'] = 'idLanguage';
              queryParms['searchValue'] = event.filters.idLanguage.value;
          }
      }
      if (!queryParms.hasOwnProperty('sortField')) {
          if (event.sortField) {
              queryParms['sortField'] = event.sortField;
          } else {
              queryParms['sortField'] = 'userName';
          }
      }
        this.userService.getWithQuery(queryParms)
         .subscribe(loadedUsers => {
           console.log('Loaded users from nextpage: ' + loadedUsers.length);
           if (loadedUsers.length > 0) {
                this.totalRecords = loadedUsers[0].totalRecords;
            }
           this.users  = loadedUsers;
           this.loading = false;
           this.userService.setLoaded(true);
         });
  }

}
