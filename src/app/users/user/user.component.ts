import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
  @Input() user: User;
  @Output() onUserUpdate = new EventEmitter<User>();
  @Output() onUserDelete = new EventEmitter<User>();
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
      if (!this.user) {
          // we must come from the menu
          console.log('We initialize a new user object from the router!');
          this.route.paramMap
            .pipe(
                map(paramMap => paramMap.get('idUser')),
                withLatestFrom(this.usersService.entities$),
                map(([idUser, users]) => users.find(user => user['idUser'] === idUser))
            )
            .subscribe(user => this.user = user);
      }
     }
  delete(user: User) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `L'utilisateur ${user.userName} a été détruit`};
    this.usersService.delete(user)
        .subscribe( () => {
          this.messageService.add(myMessage);
          this.onUserDelete.emit();
        });
  }

  save(oldUser: User, userForm: User) {
    const modifiedUser = Object.assign({}, oldUser, userForm);
    this.usersService.update(modifiedUser)
        .subscribe(updatedUser  => {
            this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `L'utilisateur ${modifiedUser.userName} a été modifié`});
            this.onUserUpdate.emit(updatedUser);
        });


  }

}
