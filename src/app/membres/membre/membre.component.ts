import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {MembreEntityService} from '../services/membre-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {DefaultMembre, Membre} from '../model/membre';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmGender, enmLanguage} from '../../shared/enums';
import {NgForm} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {AppState} from '../../reducers';
import {DataServiceError} from '@ngrx/data';
import {Organisation} from '../../organisations/model/organisation';

@Component({
  selector: 'app-membre',
  templateUrl: './membre.component.html',
  styleUrls: ['./membre.component.css']
})
export class MembreComponent implements OnInit {
    @ViewChild('membreForm') myform: NgForm;
    @Input() batId$: Observable<number>;
    @Input() currentFilteredOrg: Organisation;
    @Output() onMembreUpdate = new EventEmitter<Membre>();
    @Output() onMembreCreate = new EventEmitter<Membre>();
    @Output() onMembreDelete = new EventEmitter<Membre>();
    @Output() onMembreQuit = new EventEmitter<Membre>();
    membre: Membre;
    booIsOrganisation: boolean;
    booCalledFromTable: boolean;
    booCanSave: boolean;
    booCanDelete: boolean;
    booCanQuit: boolean;
    genders: any[];
  languages: any[];
  lienBanque: number;
  lienDis: number;
    lienDepot: number;
    title: string;
    idCompany: string;
    orgName: string;
   constructor(
      private membresService: MembreEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.genders =  enmGender;
      this.languages =  enmLanguage;
      this.booCalledFromTable = true;
      this.booCanDelete = false;
      this.booCanSave = false;
      this.booCanQuit = true;
      this.lienBanque = 0 ;
      this.idCompany = '';
      this.lienDis = 0;
      this.lienDepot = 0;
      this.booIsOrganisation = false;
      this.title = '';
  }

  ngOnInit(): void {
      // comment: this component is sometimes called from his parent Component with idDepot @Input Decorator,
      // or sometimes via a router link via the Main Menu
      if (!this.batId$) {
          // we must come from the menu
          console.log('We initialize a new membre object from the router!');
          this.booCalledFromTable = false;
          this.booCanQuit = false;
          this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('batId')),
                  map(batIdString => Number(batIdString)),
                  switchMap(batId => this.membresService.getByKey(batId))
              ).subscribe(membre => {
              console.log('Membre from Link : ', membre);
              this.membre = membre;
          });
      }  else {
         const membre$ = combineLatest([this.batId$, this.membresService.entities$])
              .pipe(
                  map(([batId, membres]) => membres.find(membre => membre['batId'] === batId))
              );

          membre$.subscribe(
              membre => {
                  if (membre) {
                      console.log('Existing Membre : ', membre);
                      this.membre = membre;
                      if (membre.societe) {
                          this.title = $localize`:@@OrgMemberExisting:Member for organisation ${membre.societe} Updated On ${ membre.lastVisit}`;
                      } else {

                          this.title = $localize`:@@BankMemberExisting:Member for bank ${this.idCompany} Updated On ${ membre.lastVisit}`;
                      }
                  } else {
                      this.membre = new DefaultMembre();
                      this.membre.lienBanque = this.lienBanque;
                      console.log('CurrentFilteredOrg', this.currentFilteredOrg);

                      if (this.lienDis > 0 && this.lienDepot === 0) {
                          // handle organisation membres
                          this.membre.lienDis = this.lienDis;
                          this.title = $localize`:@@OrgMemberNew1:New Member for organisation ${this.orgName} `;
                      } else {
                          if (this.currentFilteredOrg != null && this.currentFilteredOrg.idDis > 0) {
                              // create membre from bank admin membre or depot admin membre
                              this.membre.lienDis = this.currentFilteredOrg.idDis;
                              this.title = $localize`:@@OrgMemberNewA:New Member for organisation  ${this.currentFilteredOrg.societe}`;
                          }  else {
                              if (this.lienDepot > 0) {
                                  this.membre.lienDis = this.lienDepot;
                                  this.title =  $localize`:@@OrgMemberNewB:New Member for organisation  ${this.orgName}`;
                              } else {
                                  // must be bank
                                  this.title =  $localize`:@@BankMemberNew1:New Member for bank ${this.idCompany} `;
                              }
                          }
                      }
                      if (this.myform) {
                          this.myform.reset(this.membre);
                      }
                  }
              });
      }
    this.store
      .pipe(
          select(globalAuthState),
          map((authState) => {
              if (authState.user) {
                  switch (authState.user.rights) {
                      case 'Bank':
                      case 'Admin_Banq':
                          this.lienBanque = authState.banque.bankId;
                          this.idCompany = authState.banque.bankShortName;
                          if (authState.user.rights === 'Admin_Banq' ) {
                              this.booCanSave = true;
                              if (this.booCalledFromTable) {
                                  this.booCanDelete = true;
                              }
                          }
                          break;
                      case 'Asso':
                      case 'Admin_Asso':
                          this.lienBanque = authState.banque.bankId;
                          this.idCompany = authState.banque.bankShortName;
                          this.lienDis = authState.user.idOrg;
                          this.orgName = authState.organisation.societe;
                          if (authState.organisation.depyN === true) {
                              this.lienDepot = authState.organisation.idDis;
                          }
                          this.booIsOrganisation = true;
                         if  (authState.user.rights === 'Admin_Asso') {
                             this.booCanSave = true;
                             if (this.booCalledFromTable) {
                                 this.booCanDelete = true;
                             }
                         }
                          break;
                      default:
                  }
              }
             })
      )
      .subscribe();
  }
    delete(event: Event, membre: Membre) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Delete',
                    detail: $localize`:@@messageEmployeeDeleted:The employee ${membre.prenom} ${membre.nom} was deleted`};
                this.membresService.delete(membre)
                    .subscribe( () => {
                        console.log('successfully deleted employee');
                        this.messageService.add(myMessage);
                        this.onMembreDelete.emit(membre);
                    },
                        (dataserviceerror: DataServiceError) => {
                            console.log('Error deleting employee', dataserviceerror.message);
                            const  errMessage = {severity: 'error', summary: 'Delete',
                                // tslint:disable-next-line:max-line-length
                                detail: $localize`:@@messageEmployeeDeleteError:The employee ${membre.prenom} ${membre.nom} could not be deleted: error: ${dataserviceerror.message}`,
                                life: 6000 };
                                this.messageService.add(errMessage) ;
                        }
                    );
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }

  save(oldMembre: Membre, membreForm: Membre) {
    const modifiedMembre = Object.assign({}, oldMembre, membreForm);
      if (modifiedMembre.hasOwnProperty('batId')) {
          console.log('Updating Membre with content:', modifiedMembre);
          this.membresService.update(modifiedMembre)
              .subscribe(() => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Update',
                      detail: $localize`:@@messageEmployeeUpdated:The employee ${modifiedMembre.nom} ${modifiedMembre.prenom}  was updated`
                  });
                  this.onMembreUpdate.emit(modifiedMembre);
              },
                  (dataserviceerror: DataServiceError) => {
                      console.log('Error updating membre', dataserviceerror.message);
                      const  errMessage = {severity: 'error', summary: 'Update',
                          // tslint:disable-next-line:max-line-length
                          detail: $localize`:@@messageEmployeeUpdateError:The employee ${modifiedMembre.nom} ${modifiedMembre.prenom} could not be updated: error: ${dataserviceerror.message}`,
                          life: 6000 };
                      this.messageService.add(errMessage) ;
                  }
              );
      } else {
          console.log('Creating Membre with content:', modifiedMembre);
          this.membresService.add(modifiedMembre)
              .subscribe(() => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Creation',
                      detail: $localize`:@@messageEmployeeCreated:The employee ${modifiedMembre.nom} ${modifiedMembre.prenom}  was created`
                  });
                  this.onMembreCreate.emit(modifiedMembre);
              },
                  (dataserviceerror: DataServiceError) => {
                      console.log('Error creating membre', dataserviceerror.message);
                      const  errMessage = {severity: 'error', summary: 'Create',
                          // tslint:disable-next-line:max-line-length
                          detail: $localize`:@@messageEmployeeCreateError:The employee ${modifiedMembre.nom} ${modifiedMembre.prenom} could not be created: error: ${dataserviceerror.message}`,
                          life: 6000 };
                      this.messageService.add(errMessage) ;
                  }
              );
      }
  }

    quit(event: Event, oldMembre: Membre, membreForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?` ,
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    membreForm.reset(oldMembre); // reset in-memory object for next open
                    console.log('We have reset the membre form to its original value');
                    this.onMembreQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onMembreQuit.emit();
        }
    }

    getMemberTitle(): string {
        return this.title;
    }
}

