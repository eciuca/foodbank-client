import { Component, OnInit } from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {User} from './model/user';
import {UserEntityService} from './services/user-entity.service';
import {Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
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
  title: string;

  constructor(private userService: UserEntityService,
              private router: Router,
              private store: Store<AppState>
  ) { }

  ngOnInit() {
        this.reload();
  }

  reload() {
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
