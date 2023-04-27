import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DefaultOrgcontact, Orgcontact} from '../../model/orgcontact';
import {OrgcontactEntityService} from '../../services/orgcontact-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmGender} from '../../../shared/enums';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-orgcontact',
  templateUrl: './orgcontact.component.html',
  styleUrls: ['./orgcontact.component.css']
})
export class OrgcontactComponent implements OnInit {
  @ViewChild('orgcontactForm') myform: NgForm;
  @Input() orgPersId$: Observable<number>;
  @Input() lienAsso$: Observable<number>;
  lienAsso: number;
  @Output() onOrgcontactUpdate = new EventEmitter<Orgcontact>();
  @Output() onOrgcontactCreate = new EventEmitter<Orgcontact>();
  @Output() onOrgcontactDelete = new EventEmitter<Orgcontact>();
  @Output() onOrgcontactQuit = new EventEmitter<Orgcontact>();
  orgcontact: Orgcontact;
  booCanSave: boolean;
  booCanDelete: boolean;
  booCanQuit: boolean;
  genders: any[];
  constructor(
      private orgcontactsService: OrgcontactEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.genders = enmGender;
    this.booCanDelete = false;
    this.booCanSave = false;
    this.booCanQuit = true;
    this.lienAsso = 0;
  }

  ngOnInit(): void {
    this.lienAsso$.subscribe(lienAsso => this.lienAsso = lienAsso);

    const orgcontact$ = combineLatest([this.orgPersId$, this.orgcontactsService.entities$])
        .pipe(
            map(([orgPersId, orgcontacts]) => orgcontacts.find(orgcontact => orgcontact['orgPersId'] === orgPersId))
        );
    orgcontact$.subscribe(orgcontact => {
      if (orgcontact) {
        this.orgcontact = orgcontact;
        } else {
        this.orgcontact = new DefaultOrgcontact();
          if (this.myform) {
              this.myform.reset(this.orgcontact);
          }
        }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                switch (authState.user.rights) {
                    case 'admin':
                    case 'Admin_Asso':
                    case 'Admin_Banq':
                        this.booCanSave = true;
                        this.booCanDelete = true;
                        break;
                  default:
                }
              }
            })
        )
        .subscribe();
  }

  delete(event: Event, orgcontact: Orgcontact) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Delete',
          detail: `The orgcontact ${orgcontact.nom} ${orgcontact.prenom} has been deleted`
        };
        this.orgcontactsService.delete(orgcontact)
            .subscribe(() => {
              this.messageService.add(myMessage);
              this.onOrgcontactDelete.emit(orgcontact);
            },
                ( dataserviceerror) => { 
                 
                 
                const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: `The contact  ${orgcontact.nom} ${orgcontact.prenom} could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
            });
      }
    });
  }

  save(oldOrgcontact: Orgcontact, orgcontactForm: Orgcontact) {
    const modifiedOrgcontact = Object.assign({}, oldOrgcontact, orgcontactForm);

    if (modifiedOrgcontact.hasOwnProperty('orgPersId')) {
      this.orgcontactsService.update(modifiedOrgcontact)
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Update',
              detail: `The contact ${modifiedOrgcontact.nom} ${modifiedOrgcontact.prenom}  was updated`
            });
            this.onOrgcontactUpdate.emit(modifiedOrgcontact);
          },
              ( dataserviceerror) => { 
                 
                 
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: `The contact  ${modifiedOrgcontact.nom} ${modifiedOrgcontact.prenom} could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {
      modifiedOrgcontact.lienAsso = this.lienAsso;
      this.orgcontactsService.add(modifiedOrgcontact)
          .subscribe((newOrgcontact) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Creation',
              detail: `The contact ${newOrgcontact.nom} ${newOrgcontact.prenom}  has been created`
            });
            this.onOrgcontactCreate.emit(newOrgcontact);
          },
              ( dataserviceerror) => { 
                 
                 
                const  errMessage = {severity: 'error', summary: 'Create',
                  detail: `The contact  ${modifiedOrgcontact.nom} ${modifiedOrgcontact.prenom} could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
          });
    }

  }

  quit(event: Event, oldOrgcontact: Orgcontact, orgcontactForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          orgcontactForm.reset(oldOrgcontact); // reset in-memory object for next open
           this.onOrgcontactQuit.emit();
        }
      });
    } else {
      this.onOrgcontactQuit.emit();
    }
  }
}


