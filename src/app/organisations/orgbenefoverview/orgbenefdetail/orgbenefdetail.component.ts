import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {OrganisationEntityService} from '../../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable, combineLatest} from 'rxjs';
import {Organisation} from '../../model/organisation';
import {ConfirmationService, MessageService} from 'primeng/api';
import {NgForm} from '@angular/forms';

import {DataServiceError} from '@ngrx/data';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {globalAuthState} from '../../../auth/auth.selectors';

@Component({
  selector: 'app-orgbenefdetail',
  templateUrl: './orgbenefdetail.component.html',
  styleUrls: ['./orgbenefdetail.component.css']
})
export class OrgbenefdetailComponent implements OnInit {
  @ViewChild('orgForm') myform: NgForm;
  @Input() idDis$: Observable<number>;
  @Output() onOrganisationUpdate = new EventEmitter<Organisation>();

  @Output() onOrganisationQuit = new EventEmitter<Organisation>();

  booCanSave: boolean;
  organisation: Organisation;
  userName: string;

  constructor(
      private organisationsService: OrganisationEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.booCanSave = false;
    this.userName = '' ;
  }

  ngOnInit(): void {

    const organisation$ = combineLatest([this.idDis$, this.organisationsService.entities$])
        .pipe(
            map(([idDis, organisations]) => organisations.find(organisation => idDis === organisation.idDis))
        ).subscribe(organisation => {
          if (organisation) {
            this.organisation = organisation;
          }
        });
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                this.userName = authState.user.userName;
                   switch (authState.user.rights) {
                  case 'Admin_Banq':
                    this.booCanSave = true;
                    break;
                  case 'Admin_Asso':
                    this.booCanSave = true;
                    break;
                  default:
                }

              }
            })
        )
        .subscribe();

  }
  save(oldOrganisation: Organisation, orgForm: Organisation) {
    const modifiedOrganisation = Object.assign({}, oldOrganisation, orgForm);

    modifiedOrganisation.lupdUserName = this.userName;

    console.log('Modifying Organisation with content:', modifiedOrganisation);
    this.organisationsService.update(modifiedOrganisation)
        .subscribe( ()  => {
              this.messageService.add({
                severity: 'success',
                summary: 'Update',
                detail: $localize`:@@messageOrganisationUpdated:Organisation ${modifiedOrganisation.societe} was updated`
              });
              this.onOrganisationUpdate.emit(modifiedOrganisation);
            },
            (dataserviceerror: DataServiceError) => {
              console.log('Error updating organisation', dataserviceerror.message);
              const  errMessage = {severity: 'error', summary: 'Update',
                // tslint:disable-next-line:max-line-length
                detail: $localize`:@@messageOrganisationUpdateError:The organisation ${modifiedOrganisation.societe} could not be updated: error: ${dataserviceerror.message}`,
                life: 6000 };
              this.messageService.add(errMessage) ;
            });

  }

  quit(event: Event, oldOrganisation: Organisation, orgForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          orgForm.reset( oldOrganisation); // reset in-memory object for next open
          console.log('We have reset the form to its original value');
          this.onOrganisationQuit.emit();
        },
        reject: () => {
          console.log('We do nothing');
        }
      });
    } else {
      console.log('Form is not dirty, closing');
      this.onOrganisationQuit.emit();
    }
  }

}


