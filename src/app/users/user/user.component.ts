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
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const idUser = this.route.snapshot.paramMap.get('idUser');

    this.user$ = this.usersService.entities$
        .pipe(
            map( users => users.find(user => idUser === user.idUser.toString()))
        );
     }
  delete(user: User) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `L'utilisateur ${user.userName} a été détruit`};
    this.usersService.delete(user)
        .subscribe( ()  => {
          this.messageService.add(myMessage);
          this.router.navigateByUrl('/users');
        });
  }

  save(oldUser: User, userForm: User) {
    const modifiedUser = Object.assign({}, oldUser, userForm);
    this.usersService.update(modifiedUser)
        .subscribe( ()  => {
            this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `L'utilisateur ${modifiedUser.userName} a été modifié`});
            this.router.navigateByUrl('/users');
        });


  }
  return() {
    this.router.navigateByUrl('/users');
  }
}
