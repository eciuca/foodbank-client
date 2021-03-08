import {Component, Input, OnInit} from '@angular/core';
import {UserEntityService} from '../services/user-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
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
      const StringIsNumber = value => isNaN(Number(value)) === false;
      // Note typescript needs filter to avoid reverse number to string entries when converting enum to object array
      this.languages =  Object.keys(enmLanguage).filter(StringIsNumber).map(key => ({ name: enmLanguage[key], code: key }));
      // no need to filter for rights since values are strings identical to keys
      this.rights =  Object.keys(enmUserRoles).map(key => ({ name:enmUserRoles[key], code: key }));
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
