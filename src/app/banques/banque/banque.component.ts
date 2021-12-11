import {Component, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {BanqueEntityService} from '../services/banque-entity.service';
import {MembreEntityService} from '../../membres/services/membre-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {Banque, DefaultBanque} from '../model/banque';
import {ConfirmationService, MessageService} from 'primeng/api';
import { Input } from '@angular/core';
import {NgForm} from '@angular/forms';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {Membre} from '../../membres/model/membre';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {AppState} from '../../reducers';
import {BanqProg} from '../model/banqprog';
import {BanqProgEntityService} from '../services/banqprog-entity.service';



@Component({
  selector: 'app-banque',
  templateUrl: './banque.component.html',
  styleUrls: ['./banque.component.css']
})
export class BanqueComponent implements OnInit {
    @ViewChild('banqueForm') bankform: NgForm;
    @ViewChild('detailForm') detailform: NgForm;
    @Input() bankId$: Observable<number>;
    @Output() onBanqueCreate = new EventEmitter<Banque>();
    @Output() onBanqueUpdate = new EventEmitter<Banque>();
    @Output() onBanqueDelete = new EventEmitter<Banque>();
    @Output() onBanqueQuit = new EventEmitter<Banque>();
    booCalledFromTable: boolean;
    booCanSave: boolean;
    booCanDelete: boolean;
    booCanQuit: boolean;
    booIsCreate: boolean;
    banque: Banque;
    banqProg: BanqProg;
    selectedPresident: Membre;
    selectedVicePresident: Membre;
    selectedCEO: Membre;
    selectedSecretary: Membre;
    selectedTreasurer: Membre;
    selectedHR: Membre;
    selectedLogistics: Membre;
    selectedSecHygiene: Membre;
    selectedIT: Membre;
    selectedSupply: Membre;
    selectedPress: Membre;
    selectedAssocRel: Membre;
    selectedPubRel: Membre;
    selectedFEAD: Membre;
    selectedQuality: Membre;

    filteredMembres: Membre[];

  constructor(
      private banquesService: BanqueEntityService,
      private membresService: MembreEntityService,
      private banqProgService: BanqProgEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.booCalledFromTable = true;
      this.booCanDelete = false;
      this.booCanSave = false;
      this.booCanQuit = true;
      this.booIsCreate = false;
    }

  ngOnInit(): void {
      // comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
      // or sometimes via a router link via the Main Menu
      if (!this.bankId$) {
          // we must come from the menu
         // console.log('We initialize a new banque object from the router!');
          this.booCalledFromTable = false;
          this.booCanQuit = false;
          this.booIsCreate = false;
          this.bankId$ = this.route.paramMap
            .pipe(
              map(paramMap => paramMap.get('bankId')),
              map(bankIdString => Number(bankIdString))
            );
      }

      const bank$ = combineLatest([this.bankId$, this.banquesService.entities$])
        .pipe(
          map(([bankId, banques]) => banques.find(banque => bankId === banque.bankId))
        );

      bank$.subscribe(banque => {
          if (banque) {
              this.banque = banque;
              this.booIsCreate = false;
              this.banqProgService.getByKey(banque.bankId)
                  .subscribe(
                      banqProg => {
                          if (banqProg !== null) {
                              this.banqProg = banqProg;
                          }
                      });
              this.membresService.getByKey(banque.idMemberPres)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedPresident = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our president:', this.selectedPresident);
                          } else {
                              console.log('There is no president!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberVp)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedVicePresident = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  vice president:', this.selectedVicePresident);
                          } else {
                              console.log('There is no vice-president!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberCeo)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedCEO = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  CEO:', this.selectedCEO);
                          } else {
                              console.log('There is no CEO!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberSec)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedSecretary = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our secretary:', this.selectedSecretary);
                          } else {
                              console.log('There is no secretary!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberTres)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedTreasurer = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  Treasurer:', this.selectedTreasurer);
                          } else {
                              console.log('There is no Treasurer!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberRh)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedHR = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  HR:', this.selectedHR);
                          } else {
                              console.log('There is no HR!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberLog)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedLogistics = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our resp logistics:', this.selectedLogistics);
                          } else {
                              console.log('There is no resp logistics!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberSh)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedSecHygiene = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  Resp Sec&Hygiene:', this.selectedSecHygiene);
                          } else {
                              console.log('There is no Resp Sec&Hygiene!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberIt)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedIT = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  Resp IT:', this.selectedIT);
                          } else {
                              console.log('There is no Resp IT!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberAppro)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedSupply = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our resp Supply:', this.selectedSupply);
                          } else {
                              console.log('There is no resp Supply!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberPp)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedPress = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  Resp Press:', this.selectedPress);
                          } else {
                              console.log('There is no Resp Press!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberAsso)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedAssocRel = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  Resp Assoc Rel:', this.selectedAssocRel);
                          } else {
                              console.log('There is no Resp Assoc Rel!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberPubrel)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedPubRel = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  Resp PubRel:', this.selectedPubRel);
                          } else {
                              console.log('There is no Resp PubRel!');
                          }
                      });
              this.membresService.getByKey(banque.idMemberFead)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedFEAD = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  Resp FEAD:', this.selectedFEAD);
                          } else {
                              console.log('There is no Resp FEAD!');
                          }
                      });

              this.membresService.getByKey(banque.idMemberQual)
                  .subscribe(
                      membre => {
                          if (membre !== null) {
                              this.selectedQuality =  Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                              console.log('our  Resp Quality:', this.selectedQuality);
                          } else {
                              console.log('There is no Resp Quality!');
                          }
                      });

      } else {
          this.banque = new DefaultBanque();
          if (this.bankform) {
              this.bankform.reset(this.banque);
          }
          this.booIsCreate = true;
          console.log('we have a new default banque');
      }
      }); // End of Subscribe
      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  if (authState.user) {
                      switch (authState.user.rights) {
                        case 'admin':
                        case 'Admin_Banq':
                           this.booCanSave = true;
                          if (this.booCalledFromTable ) {
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

    filterMembre(event ) {
      const  queryMemberParms: QueryParams = {};
        const query = event.query;
        queryMemberParms['offset'] = '0';
        queryMemberParms['rows'] = '10';
        queryMemberParms['sortField'] = 'nom';
        queryMemberParms['sortOrder'] = '1';
        queryMemberParms['lienBanque'] = this.banque.bankId.toString();
        queryMemberParms['nom'] = query.toLowerCase();
        this.membresService.getWithQuery(queryMemberParms)
        .subscribe(filteredMembres => {
            this.filteredMembres = filteredMembres.map((membre) =>
                Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom})
            );
        });
    }

 save(oldBanque: Banque, banqueForm: Banque) {
      console.log('Banque Form value', banqueForm);
      const modifiedBanque = Object.assign({}, oldBanque, banqueForm);
      modifiedBanque.idMemberPres = this.selectedPresident.batId;
      modifiedBanque.idMemberVp = this.selectedVicePresident.batId;
      modifiedBanque.idMemberCeo = this.selectedCEO.batId;
      modifiedBanque.idMemberSec = this.selectedSecretary.batId;
      modifiedBanque.idMemberTres = this.selectedTreasurer.batId;
      modifiedBanque.idMemberRh = this.selectedHR.batId;
      modifiedBanque.idMemberLog = this.selectedLogistics.batId;
      modifiedBanque.idMemberSh = this.selectedSecHygiene.batId;
      modifiedBanque.idMemberIt = this.selectedIT.batId;
      modifiedBanque.idMemberAppro = this.selectedSupply.batId;
      modifiedBanque.idMemberPp = this.selectedPress.batId;
      modifiedBanque.idMemberAsso = this.selectedAssocRel.batId;
      modifiedBanque.idMemberPubrel = this.selectedPubRel.batId;
      modifiedBanque.idMemberFead = this.selectedFEAD.batId;
      modifiedBanque.idMemberQual = this.selectedQuality.batId;
     if (modifiedBanque.hasOwnProperty('bankId')) {
         this.banquesService.update(modifiedBanque)
             .subscribe(() => {
                 this.messageService.add({
                     severity: 'success',
                     summary: 'Update',
                     detail: $localize`:@@messageBankUpdated:Bank ${modifiedBanque.bankShortName} ${modifiedBanque.bankName}  was updated`
                 });
                 this.onBanqueUpdate.emit();
             },
                 (dataserviceerror: DataServiceError) => {
                     console.log('Error updating bank', dataserviceerror.message);
                     const  errMessage = {severity: 'error', summary: 'Update',
                         // tslint:disable-next-line:max-line-length
                         detail: $localize`:@@messageBankUpdateError:The bank ${modifiedBanque.bankShortName} ${modifiedBanque.bankName} could not be updated: error: ${dataserviceerror.message}`,
                         life: 6000 };
                     this.messageService.add(errMessage) ;
                 });
     } else {
         console.log('Creating Banque with content:', modifiedBanque);
         this.banquesService.add(modifiedBanque)
             .subscribe((newBanque) => {
                 this.messageService.add({
                     severity: 'success',
                     summary: 'Creation',
                     detail: $localize`:@@messageBankCreated:Bank ${newBanque.bankName} was created`
                 });
                 this.onBanqueCreate.emit(newBanque);
             },
                 (dataserviceerror: DataServiceError) => {
                     console.log('Error creating bank', dataserviceerror.message);
                     const  errMessage = {severity: 'error', summary: 'Create',
                         // tslint:disable-next-line:max-line-length
                         detail: $localize`:@@messageBankCreateError:The bank ${modifiedBanque.bankShortName} ${modifiedBanque.bankName} could not be created: error: ${dataserviceerror.message}`,
                         life: 6000 };
                     this.messageService.add(errMessage) ;
                 });
     }
  }
    delete(event: Event, banque: Banque) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {
                    severity: 'success',
                    summary: 'Delete',
                    detail: $localize`:@@messageBankDeleted:Bank ${banque.bankName} was deleted`
                };
                this.banquesService.delete(banque)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onBanqueDelete.emit();
                    },
                        (dataserviceerror: DataServiceError) => {
                            console.log('Error deleting bank', dataserviceerror.message);
                            const  errMessage = {severity: 'error', summary: 'Delete',
                                // tslint:disable-next-line:max-line-length
                                detail: $localize`:@@messageBankDeleteError:The bank ${banque.bankId} ${banque.bankShortName} ${banque.bankName} could not be deleted: error: ${dataserviceerror.message}`,
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
    quit(event: Event, oldBanque: Banque, banqueForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    banqueForm.reset( oldBanque); // reset in-memory object for next open
                    console.log('We have reset the form to its original value');
                    this.onBanqueQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onBanqueQuit.emit();
        }
    }
    saveDetails(oldBanqProg: BanqProg, banqProgForm: BanqProg) {
        console.log('Entering SaveDetails - BanqProg Form value', banqProgForm);
        const modifiedBanqProg = Object.assign({}, oldBanqProg, banqProgForm);
        console.log('Modified BanqProg', modifiedBanqProg);
        this.banqProgService.update(modifiedBanqProg)
            .subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Update',
                        detail: $localize`:@@messageBankDetailsUpdated:Bank  ${this.banque.bankShortName} ${this.banque.bankName}  details were updated`
                    });
                    this.onBanqueUpdate.emit();
                },
                (dataserviceerror: DataServiceError) => {
                    console.log('Error updating bank', dataserviceerror.message);
                    const  errMessage = {severity: 'error', summary: 'Update',
                        // tslint:disable-next-line:max-line-length
                        detail: $localize`:@@messageBankDetailsUpdateError:The bank  ${this.banque.bankShortName} ${this.banque.bankName} details could not be updated: error: ${dataserviceerror.message}`,
                        life: 6000 };
                    this.messageService.add(errMessage) ;
                });
    }
}

