import {combineLatest, Observable} from 'rxjs';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {Component, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {DefaultOrgaudit, Orgaudit} from '../../model/orgaudit';
import {OrgauditEntityService} from '../../services/orgaudit-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-orgaudit',
  templateUrl: './orgaudit.component.html',
  styleUrls: ['./orgaudit.component.css']
})
export class OrgauditComponent implements OnInit {
  @ViewChild('orgauditForm') myform: NgForm;
  @Input() auditId$: Observable<number>;
  lienBanque: number;
  lienDep: number;
  @Output() onOrgauditUpdate = new EventEmitter<Orgaudit>();
  @Output() onOrgauditCreate = new EventEmitter<Orgaudit>();
  @Output() onOrgauditDelete = new EventEmitter<Orgaudit>();
  @Output() onOrgauditQuit = new EventEmitter<Orgaudit>();
  orgaudit: Orgaudit;
  booCanSave: boolean;
  booCanDelete: boolean;
  booCanQuit: boolean;
  constructor(
      private orgauditsService: OrgauditEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.booCanDelete = false;
    this.booCanSave = false;
    this.booCanQuit = true;
    this.lienBanque = 0;
    this.lienDep = 0;
  }

  ngOnInit(): void {

    const orgaudit$ = combineLatest([this.auditId$, this.orgauditsService.entities$])
        .pipe(
            map(([auditId, orgaudits]) => orgaudits.find(orgaudit => orgaudit['auditId'] === auditId))
        );
    orgaudit$.subscribe(orgaudit => {
      if (orgaudit) {
        this.orgaudit = orgaudit;
        console.log('our orgaudit:', this.orgaudit);
      } else {
        this.orgaudit = new DefaultOrgaudit();
        if (this.myform) {
          this.myform.reset(this.orgaudit);
        }
        console.log('we have a new default orgaudit');
      }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                switch (authState.user.rights) {
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

  delete(event: Event, orgaudit: Orgaudit) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Delete',
          detail: `The audit ${orgaudit.auditId} for ${orgaudit.societe} has been deleted`
        };
        this.orgauditsService.delete(orgaudit)
            .subscribe(() => {
                  this.messageService.add(myMessage);
                  this.onOrgauditDelete.emit(orgaudit);
                },
                (dataserviceerror: DataServiceError) => {
                  console.log('Error deleting audit', dataserviceerror.message);
                  const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: `The audit  ${orgaudit.auditId} for ${orgaudit.societe} could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                });
      },
      reject: () => {
        console.log('We do nothing');
      }
    });
  }

  save(oldOrgaudit: Orgaudit, orgauditForm: Orgaudit) {
    const modifiedOrgaudit = Object.assign({}, oldOrgaudit, orgauditForm);

    if (modifiedOrgaudit.hasOwnProperty('auditId')) {
      this.orgauditsService.update(modifiedOrgaudit)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update',
                  detail: `The audit ${modifiedOrgaudit.auditId} for ${modifiedOrgaudit.societe}  was updated`
                });
                this.onOrgauditUpdate.emit(modifiedOrgaudit);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error updating audit', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: `The audit   ${modifiedOrgaudit.auditId} for ${modifiedOrgaudit.societe} could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {
      modifiedOrgaudit.lienBanque = this.lienBanque;
      console.log('Creating Orgaudit with content:', modifiedOrgaudit);
      this.orgauditsService.add(modifiedOrgaudit)
          .subscribe((newOrgaudit) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: `The audit ${newOrgaudit.auditId} ${newOrgaudit.societe}  has been created`
                });
                this.onOrgauditCreate.emit(newOrgaudit);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error creating audit', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: `The audit   ${modifiedOrgaudit.auditId} ${modifiedOrgaudit.societe} could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    }

  }

  quit(event: Event, oldOrgaudit: Orgaudit, orgauditForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          orgauditForm.reset(oldOrgaudit); // reset in-memory object for next open
          console.log('We have reset the audit form to its original value');
          this.onOrgauditQuit.emit();
        },
        reject: () => {
          console.log('We do nothing');
        }
      });
    } else {
      console.log('Form is not dirty, closing');
      this.onOrgauditQuit.emit();
    }
  }
}



