import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {combineLatest, Observable} from 'rxjs';
import {Organisation} from '../../model/organisation';
import {OrganisationEntityService} from '../../services/organisation-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {DataServiceError} from '@ngrx/data';

@Component({
  selector: 'app-org-membership',
  templateUrl: './org-membership.component.html',
  styleUrls: ['./org-membership.component.css']
})
export class OrgMembershipComponent implements OnInit {
  @ViewChild('orgMembershipForm') myform: NgForm;
  @Input() idDis$: Observable<number>;
  @Output() onOrganisationUpdate = new EventEmitter<Organisation>();
  @Output() onOrganisationQuit = new EventEmitter<Organisation>();
  organisation: Organisation;
  lienBanque: number;
  userName: string;
  constructor(
        private organisationsService: OrganisationEntityService,
        private store: Store<AppState>,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
  ) {
    this.lienBanque = 0;
    this.userName = '' ;
  }

  ngOnInit(): void {
    let organisation$: Observable<Organisation>;
       organisation$ =  combineLatest([this.idDis$, this.organisationsService.entities$])
        .pipe(
            map(([idDis, organisations]) => organisations.find(organisation => idDis === organisation.idDis))
        );
    organisation$.subscribe(organisation => {
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
                this.lienBanque = authState.banque.bankId;
              }
            })
        );
  }
  save(oldOrganisation: Organisation, organisationForm: Organisation) {
    const modifiedOrganisation = Object.assign({}, oldOrganisation, organisationForm);
    modifiedOrganisation.lupdUserName = this.userName;
    this.organisationsService.update(modifiedOrganisation)
        .subscribe( ()  => {
              this.messageService.add({
                severity: 'success',
                summary: 'Update',
                  detail: $localize`:@@messageOrganisationUpdated:Organisation ${modifiedOrganisation.idDis}  ${modifiedOrganisation.societe} was updated`
              });
              this.onOrganisationUpdate.emit(modifiedOrganisation);
            },
            (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                const  errMessage = {severity: 'error', summary: 'Update',
                    detail: $localize`:@@messageOrganisationUpdateError:The organisation ${modifiedOrganisation.idDis} ${modifiedOrganisation.societe} could not be updated: error: ${dataserviceerror.message}`,
                    life: 6000 };
              this.messageService.add(errMessage) ;
            });
  }
    quit(event: Event, oldOrganisation: Organisation, organisationForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    organisationForm.reset( oldOrganisation); // reset in-memory object for next open
                    this.onOrganisationQuit.emit();
                }
            });
        } else {
            this.onOrganisationQuit.emit();
        }
    }

}
