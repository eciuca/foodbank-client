import { Component, OnInit } from '@angular/core';
import {UserEntityService} from '../services/user-entity.service';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {User} from '../model/user';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user$: Observable<User>;
  myuser: User;
  constructor(
      private usersService: UserEntityService,
      private route: ActivatedRoute) {}

  ngOnInit(): void {
    const idUser = this.route.snapshot.paramMap.get('idUser');

    this.user$ = this.usersService.entities$
        .pipe(
            map( users => users.find(user => idUser === user.idUser.toString()))
        );
     }
  delete(user: User) {
    console.log( 'Delete Called with User:', user);
    this.usersService.delete(user);

  }

  save(user: User) {
    console.log( 'Save Called with User:', user);
    this.usersService.update(user);

  }
}
