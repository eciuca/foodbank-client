import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserEntityService} from '../services/user-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {DefaultUser, User} from '../model/user';
import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';
import {enmLanguageLegacy, enmUserRoles} from '../../shared/enums';
import {NgForm} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {AppState} from '../../reducers';
import {MembreEntityService} from '../../membres/services/membre-entity.service';
import {Membre} from '../../membres/model/membre';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {Observable, combineLatest} from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    @Input() idUser$: Observable<string>;
    user: User;
    selectedMembre: Membre;
    filteredMembres: Membre[];
    @Output() onUserUpdate = new EventEmitter<User>();
    @Output() onUserDelete = new EventEmitter<User>();
    @Output() onUserCreate = new EventEmitter<User>();
    @Output() onUserQuit = new EventEmitter<User>();
    booCalledFromTable: boolean;
    booCanSave: boolean;
    booCanDelete: boolean;
    booCanQuit: boolean;
    lienBanque: number;
    idOrg: number;
    idCompany: string;
  languages: any[];
  rights: any[];
    filterMemberBase: any;
  constructor(
      private usersService: UserEntityService,
      private membresService: MembreEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.languages = enmLanguageLegacy;
      this.rights = enmUserRoles;
      this.booCalledFromTable = true;
      this.booCanDelete = false;
      this.booCanSave = false;
      this.booCanQuit = true;
      this.lienBanque = 0;
      this.idOrg = 0;
      this.idCompany = '';
  }

  ngOnInit(): void {
      if (!this.idUser$) {
          // we must come from the menu
          console.log('We initialize a new user object from the router!');
          this.booCalledFromTable = false;
          this.booCanQuit = false;
          this.idUser$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idUser'))
              );
      }
      const user$ = combineLatest([this.idUser$, this.usersService.entities$])
          .pipe(
              map(([idUser, users]) => users.find(user => idUser === user.idUser))
          );

      user$.subscribe(
            user => {
                if (user) {
                    this.user = user;
                    this.membresService.getByKey(user.lienBat)
                        .subscribe(
                            membre => {
                                if (membre !== null) {
                                    this.selectedMembre = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                                    console.log('our users membre:', this.selectedMembre);
                                } else {
                                    console.log('There is no membre for this user!');
                                }
                            });
                } else {
                    this.user = new DefaultUser();
                    console.log('we have a new default user');
                }
            });

      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  if (authState.user) {
                      this.lienBanque = authState.banque.bankId;
                      this.idCompany = authState.banque.bankShortName;
                      switch (authState.user.rights) {
                          case 'Bank':
                              this.filterMemberBase = { 'lienBanque': authState.banque.bankId};
                              break;
                          case 'Admin_Banq':
                              this.filterMemberBase = { 'lienBanque': authState.banque.bankId};
                              this.booCanSave = true;
                              if (this.booCalledFromTable) {
                                  this.booCanDelete = true;
                              }
                              break;
                          case 'Asso':
                              this.idOrg = authState.organisation.idDis;
                              this.filterMemberBase = { 'lienDis': authState.organisation.idDis};
                              break;
                          case 'Admin_Asso':
                              this.idOrg = authState.organisation.idDis;
                              this.filterMemberBase = { 'lienDis': authState.organisation.idDis};
                              this.booCanSave = true;
                              if (this.booCalledFromTable) {
                                  this.booCanDelete = true;
                              }
                              break;
                          default:
                      }
                  }
              })
          )
          .subscribe();
     }
  delete(event: Event, user: User) {
      this.confirmationService.confirm({
          target: event.target,
          message: 'Confirm Deletion?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              const  myMessage = {severity: 'success', summary: 'Delete', detail: `The user ${user.idUser} ${user.userName}  was deleted`};
              this.usersService.delete(user)
                  .subscribe( () => {
                      this.messageService.add(myMessage);
                      this.onUserDelete.emit(user);
                  });
          },
          reject: () => {
              console.log('We do nothing');
          }
      });
 }

  save(oldUser: User, userForm: User) {
    const modifiedUser = Object.assign({}, oldUser, userForm);
      modifiedUser.lienBat = this.selectedMembre.batId;
      if (!modifiedUser.hasOwnProperty('isNew')) {
          console.log('Updating User with content:', modifiedUser);
          this.usersService.update(modifiedUser)
        .subscribe(updatedUser  => {
            this.messageService.add({severity: 'success', summary: 'Update', detail: `User  ${modifiedUser.idUser} ${modifiedUser.userName} was updated`});
            this.onUserUpdate.emit(updatedUser);
        } ,
            (dataserviceerror: DataServiceError) => {
                console.log('Error updating user', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                    // tslint:disable-next-line:max-line-length
                    detail: `The member ${modifiedUser.idUser} ${modifiedUser.userName} could not be updated: error: ${dataserviceerror.message}`,
                    life: 6000 };
                this.messageService.add(errMessage) ;
            }
        );
      } else {
          modifiedUser.lienBanque = this.lienBanque;
          modifiedUser.idOrg = this.idOrg;
          modifiedUser.idCompany = this.idCompany;
          console.log('Creating User with content:', modifiedUser);
          this.usersService.add(modifiedUser)
              .subscribe((newUser) => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Creation',
                      detail: `User  ${newUser.idUser} ${newUser.userName} has been created`
                  });
                  this.onUserCreate.emit(newUser);
              },
                  (dataserviceerror: DataServiceError) => {
                      console.log('Error creating user', dataserviceerror.message);
                      const  errMessage = {severity: 'error', summary: 'Create',
                          // tslint:disable-next-line:max-line-length
                          detail: `The userer ${modifiedUser.idUser} ${modifiedUser.userName} could not be created: error: ${dataserviceerror.message}`,
                          life: 6000 };
                      this.messageService.add(errMessage) ;
                  }
              );
      }

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
    filterMembre(event ) {
        const  queryMemberParms = {...this.filterMemberBase};
        const query = event.query;
        queryMemberParms['offset'] = '0';
        queryMemberParms['rows'] = '10';
        queryMemberParms['sortField'] = 'nom';
        queryMemberParms['sortOrder'] = '1';
        queryMemberParms['searchField'] = 'nom';
        queryMemberParms['searchValue'] = query.toLowerCase();
        this.membresService.getWithQuery(queryMemberParms)
            .subscribe(filteredMembres => {
                this.filteredMembres = filteredMembres.map((membre) =>
                    Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom})
                );
            });
    }
}
