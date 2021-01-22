import { Component, OnInit } from '@angular/core';
import {UserEntityService} from '../services/user-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {User} from '../model/user';
import {MessageService} from 'primeng/api';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user$: Observable<User>;
  constructor(
      private usersService: UserEntityService,
      private route: ActivatedRoute,
      private router: Router
  ) {}

  ngOnInit(): void {
    const idUser = this.route.snapshot.paramMap.get('idUser');

    this.user$ = this.usersService.entities$
        .pipe(
            map( users => users.find(user => idUser === user.idUser.toString()))
        );
     }
  delete(user: User) {
    console.log( 'Delete Called with User:', user);
    this.usersService.delete(user)
        .subscribe( ()  => {
          console.log('User was deleted');
          this.router.navigateByUrl('/users');
        });
  }

  save(oldUser: User, userForm: User) {
    const newUser = Object.assign({}, oldUser, userForm);
    console.log( 'Save Called with User:', newUser);
    this.usersService.update(newUser)
        .subscribe( ()  => {
            console.log('User was updated');
            this.router.navigateByUrl('/users');
        });


  }
  return() {
    this.router.navigateByUrl('/users');
  }
}
