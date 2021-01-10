import { Component, OnInit } from '@angular/core';
import {concatMap, map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {User} from './model/user';
import {UserEntityService} from './services/user-entity.service';

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

  constructor(private userService: UserEntityService) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.users$  = this.userService.entities$
        .pipe(
            tap( (usersEntities) => {
              console.log('Users now loaded:', usersEntities); }),
        )
    ;
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
    this.displayDialog = true;
  }

  delete() {
    console.log( 'Delete Called with User:', this.user);
    this.userService.delete(this.user);
    this.user = null;
    this.displayDialog = false;
  }

  save() {
    console.log( 'Save Called with User:', this.user);
    this.userService.update(this.user);
    this.user = null;
    this.displayDialog = false;
  }
}
