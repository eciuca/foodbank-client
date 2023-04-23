import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DefaultDependent, Dependent} from '../../model/dependent';
import {DependentEntityService} from '../../services/dependent-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmDepPercentages, enmDepTypes, enmGender} from '../../../shared/enums';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {NgForm} from '@angular/forms';
import {BeneficiaireEntityService} from '../../services/beneficiaire-entity.service';
import {Beneficiaire} from '../../model/beneficiaire';
import {DefaultMailing, Mailing} from '../../../mailings/model/mailing';
import {MailingEntityService} from '../../../mailings/services/mailing-entity.service';
import {ZipcodeEntityService} from '../../../cpass/zipcodes/services/zipcode-entity.service';
import {UserHttpService} from '../../../users/services/user-http.service';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-dependent',
  templateUrl: './dependent.component.html',
  styleUrls: ['./dependent.component.css']
})
export class DependentComponent implements OnInit {
  @ViewChild('dependentForm') myform: NgForm;
  @Input() idDep$: Observable<number>;
  @Input() masterId$: Observable<number>;
  masterId: number;
  @Output() onDependentUpdate = new EventEmitter<Dependent>();
  @Output() onDependentCreate = new EventEmitter<Dependent>();
  @Output() onDependentDelete = new EventEmitter<Dependent>();
  @Output() onDependentQuit = new EventEmitter<Dependent>();
    userEmail: string;
  dependent: Dependent;
  beneficiaire: Beneficiaire;
  booCanSave: boolean;
  booCanDelete: boolean;
  genders: any[];
  depTypes: any[];
  depPercentages: any[];
  lienBanque: number;
  lienDis: number;
  orgName: string;
  mailing: Mailing;
  isCPASHandlingFeadStatus: boolean;
  constructor(
      private dependentsService: DependentEntityService,
      private beneficiairesService: BeneficiaireEntityService,
      private userHttpService: UserHttpService,
      private authService: AuthService,
      private store: Store<AppState>,
      private mailingService: MailingEntityService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.genders = enmGender;
    this.depTypes = enmDepTypes;
    this.depPercentages = enmDepPercentages;
    this.booCanDelete = false;
    this.booCanSave = false;
    this.lienDis = 0;
    this.lienBanque = 0;
    this.mailing = new DefaultMailing();
    this.isCPASHandlingFeadStatus = false;
  }

  ngOnInit(): void {
    this.masterId$.subscribe(
        masterId  => {
            this.masterId = masterId;
            this.beneficiairesService.getByKey(masterId).subscribe(
                beneficiaire => this.beneficiaire = beneficiaire )
        });

    const dependent$ = combineLatest([this.idDep$, this.dependentsService.entities$])
        .pipe(
            map(([idDep, dependents]) => dependents.find(dependent => dependent['idDep'] === idDep))
        );
    dependent$.subscribe(dependent => {
      if (dependent) {
        this.dependent = dependent;
      } else {
        this.dependent = new DefaultDependent();
        this.dependent.lienBanque = this.lienBanque;
        this.dependent.lienDis = this.lienDis;
        this.dependent.lienMast = this.masterId;
        if (this.myform) {
          this.myform.reset(this.dependent);
        }
      }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                  this.userEmail= authState.user.email;
                switch (authState.user.rights) {
                  case 'Bank':
                  case 'Admin_Banq':
                    this.lienBanque = authState.banque.bankId;
                      // only organisations can modify dependents
                    break;
                    case 'Admin_CPAS':
                        this.lienBanque = authState.banque.bankId;
                        this.booCanSave = true;
                        break;
                  case 'Asso':
                  case 'Admin_Asso':
                    this.lienBanque = authState.banque.bankId;
                    this.lienDis = authState.user.idOrg;
                      this.orgName = authState.organisation.societe;
                      this.isCPASHandlingFeadStatus = authState.organisation.birbyN;
                      if  ((authState.user.rights === 'Admin_Asso') || (( authState.user.rights === 'Asso') && (authState.user.gestBen))) {
                          this.booCanSave = true;
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

  delete(event: Event, dependent: Dependent) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Delete',
          detail: $localize`:@@messageDependentDeleted:The dependent ${dependent.nom} ${dependent.prenom} has been deleted`
        };
        this.dependentsService.delete(dependent)
            .subscribe(() => {
              this.messageService.add(myMessage);
              this.onDependentDelete.emit(dependent);
            },
                (dataserviceerrorFn: () => DataServiceError) => { 
                    const dataserviceerror = dataserviceerrorFn();
                    if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                    const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageDependentDeleteError:The dependent  ${dependent.nom} ${dependent.prenom} could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                });
      }
    });
  }
    private notifyCPAS (modifiedDependent: Dependent,mailCPASAdmin: string) {
        this.mailing.subject = $localize`:@@DependentNotificationCreation: A New Dependent was Registered`;
        this.mailing.from = this.userEmail;
        this.mailing.to = mailCPASAdmin;
        this.mailing.bccMode = false;
        console.log('mailcpasadmin',mailCPASAdmin);
        this.mailing.bodyText = $localize`:@@DependentNotificationCreationText: A new dependent ${modifiedDependent.nom} ${modifiedDependent.prenom} was registered for beneficiary ${this.beneficiaire.nom} ${this.beneficiaire.prenom} in organisation ${this.orgName}.<br>Please review its FEAD status`;
        console.log('Notification mail',this.mailing);
        this.mailingService.add(this.mailing)
            .subscribe((myMail: Mailing) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Creation',
                    detail: $localize`:@@CPASNotified:The CPAS Administrator ${mailCPASAdmin} has been notified.`
                });
            });

    }
  save(oldDependent: Dependent, dependentForm: Dependent) {
      const modifiedDependent = Object.assign({}, oldDependent, dependentForm);
      let mailCPASAdmin: string = "";
      const queryParams = {'rights':'Admin_CPAS','lienCpas': this.beneficiaire.lcpas.toString()};
      let params = new URLSearchParams();
      for(let key in queryParams){
          params.set(key, queryParams[key])
      }
      this.userHttpService.getUserReport(this.authService.accessToken, params.toString())
          .subscribe(
              myUsers => {
                  if (myUsers.length > 0) {
                      mailCPASAdmin = myUsers[0].email;
                  }
                  this.updateDependent(modifiedDependent,mailCPASAdmin);
              });



  }
    private updateDependent(modifiedDependent: Dependent, mailCPASAdmin: string) {
    if (modifiedDependent.hasOwnProperty('idDep')) {
      this.dependentsService.update(modifiedDependent)
          .subscribe((savedDependent) => {
            console.log('SavedDependent',savedDependent);
            this.messageService.add({
              severity: 'success',
              summary: 'Update',
              detail: $localize`:@@messageDependentUpdated:The dependent ${modifiedDependent.nom} ${modifiedDependent.prenom}  was updated`
            });
            this.onDependentUpdate.emit(modifiedDependent);
          },
              (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageDependentUpdateError:The dependent  ${modifiedDependent.nom} ${modifiedDependent.prenom} could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
          });
    } else {
       this.dependentsService.add(modifiedDependent)
          .subscribe((newDependent) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Creation',
              detail: $localize`:@@messageDependentCreated:The dependent ${newDependent.nom} ${newDependent.prenom}  has been created`
            });
            this.onDependentCreate.emit(newDependent);
                  if (this.isCPASHandlingFeadStatus && (mailCPASAdmin != "")) {
                      this.notifyCPAS(modifiedDependent,mailCPASAdmin);
                  }
          },
              (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageDependentCreateError:The dependent  ${modifiedDependent.nom} ${modifiedDependent.prenom} could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    }

  }

  quit(event: Event, oldDependent: Dependent, dependentForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          dependentForm.reset(oldDependent); // reset in-memory object for next open
          this.onDependentQuit.emit();
        }
      });
    } else {
        this.onDependentQuit.emit();
    }
  }
}
