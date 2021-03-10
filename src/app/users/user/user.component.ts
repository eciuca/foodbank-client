import {Component, Input, OnInit} from '@angular/core';
import {UserEntityService} from '../services/user-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {User} from '../model/user';
import {MessageService} from 'primeng/api';
import {enmLanguage, enmUserRoles} from '../../shared/enums';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    @Input() idUser$: Observable<string>;
  user$: Observable<User>;
  languages: any[];
  rights: any[];
  constructor(
      private usersService: UserEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {
      this.languages = enmLanguage;
      this.rights = enmUserRoles;
  }

  ngOnInit(): void {
      if (!this.idUser$) {
          // we must come from the menu
          console.log('We initialize a new user object from the router!');
          this.idUser$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idUser'))
            );
      }

      this.user$ = combineLatest([this.idUser$, this.usersService.entities$])
          .pipe(
              map(([idUser, users]) => users.find(user => user['idUser'] === idUser))
          );
     }
  delete(user: User) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `L'utilisateur ${user.userName} a été détruit`};
    this.usersService.delete(user)
        .subscribe( ()  => {
          this.messageService.add(myMessage);
        });
  }

  save(oldUser: User, userForm: User) {
    const modifiedUser = Object.assign({}, oldUser, userForm);
    this.usersService.update(modifiedUser)
        .subscribe( ()  => {
            this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `L'utilisateur ${modifiedUser.userName} a été modifié`});
        });


  }

}
