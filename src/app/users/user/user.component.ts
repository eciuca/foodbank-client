import {Component, Input, OnInit} from '@angular/core';
import {UserEntityService} from '../services/user-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {User} from '../model/user';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    @Input() idUser$: Observable<string>;
  user$: Observable<User>;
  constructor(
      private usersService: UserEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
      if (!this.idUser$) {
          // we must come from the menu
          console.log('We initialize a new user object from the router!');
          this.idUser$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idUser'))
            );
      }

      this.user$ = this.idUser$
          .pipe(
              withLatestFrom(this.usersService.entities$),
              map(([idUser, users]) => users.find(user => user['idUser'] === idUser))
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
