import { Component, OnInit } from '@angular/core';
import {concatMap, map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {User} from './model/user';
import {UserEntityService} from './services/user-entity.service';
import {Router} from '@angular/router';
import {isLoggedOut, loggedInUser} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  user: User = null;
  users$: Observable<User[]>;
  cols: any[];
  displayDialog: boolean;

  constructor(private userService: UserEntityService,
              private router: Router,
              private store: Store<AppState>
  ) { }

  ngOnInit() {
        this.reload();
  }

  reload() {
    /* Does not work console log is never executed
    this.users$  = this.store
        .pipe(
            select(loggedInUser),
            map ( (user) => {
              console.log('Logged In User is :', user);
              this.userService.getWithQuery(user.idCompany);
            })
        );
*/
    this.users$  = this.userService.entities$;
    this.cols = [
      { field: 'idUser', header: 'Identifiant' },
      { field: 'userName', header: 'Nom Utilisateur' },
      { field: 'idCompany', header: 'Banque' },
      { field: 'idLanguage', header: 'Langue' },
      { field: 'email', header: 'E-mail' },
      { field: 'rights', header: 'Droits' }
    ];

  }
  handleSelect(user) {
    console.log( 'User was selected', user);
    this.user = {...user};
    this.router.navigateByUrl(`/users/${user.idUser}`);
    // this.displayDialog = true;
  }

}
