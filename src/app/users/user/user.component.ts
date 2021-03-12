import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserEntityService} from '../services/user-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {User} from '../model/user';
import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';
import {enmLanguageLegacy, enmUserRoles} from '../../shared/enums';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @Input() user: User;
  @Output() onUserUpdate = new EventEmitter<User>();
  @Output() onUserDelete = new EventEmitter<User>();
  @Output() onUserQuit = new EventEmitter<User>();
  booCanDelete: boolean;
  languages: any[];
  rights: any[];
  constructor(
      private usersService: UserEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.languages = enmLanguageLegacy;
      this.rights = enmUserRoles;
      this.booCanDelete = true;
  }

  ngOnInit(): void {
      if (!this.user) {
          // we must come from the menu
          console.log('We initialize a new user object from the router!');
          this.booCanDelete = false;
          this.route.paramMap
            .pipe(
                map(paramMap => paramMap.get('idUser')),
                withLatestFrom(this.usersService.entities$),
                map(([idUser, users]) => users.find(user => user['idUser'] === idUser))
            )
            .subscribe(
                user => this.user = user);
            }
     }
  delete(event: Event, user: User) {
      this.confirmationService.confirm({
          target: event.target,
          message: 'Confirm Deletion?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              const  myMessage = {severity: 'success', summary: 'Destruction', detail: `L'utilisateur ${user.userName} a été détruit`};
              this.usersService.delete(user)
                  .subscribe( () => {
                      this.messageService.add(myMessage);
                      this.onUserDelete.emit();
                  });
          },
          reject: () => {
              console.log('We do nothing');
          }
      });
 }

  save(oldUser: User, userForm: User) {
    const modifiedUser = Object.assign({}, oldUser, userForm);
    this.usersService.update(modifiedUser)
        .subscribe(updatedUser  => {
            this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `L'utilisateur ${modifiedUser.userName} a été modifié`});
            this.onUserUpdate.emit(updatedUser);
        });


  }
    quit(event: Event, oldUser: User, userForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: 'Your changes may be lost. Are you sure that you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    userForm.reset(oldUser); // reset in-memory object for next open
                    console.log('We have reset the user form to its original value');
                    this.onUserQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onUserQuit.emit();
        }
    }
}
