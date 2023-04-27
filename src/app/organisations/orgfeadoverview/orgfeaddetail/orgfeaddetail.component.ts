import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {OrganisationEntityService} from '../../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {Organisation} from '../../model/organisation';
import {ConfirmationService, MessageService} from 'primeng/api';
import {NgForm} from '@angular/forms';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {globalAuthState} from '../../../auth/auth.selectors';
import {OrgSummaryEntityService} from '../../services/orgsummary-entity.service';
import { generateTooltipSuggestions } from '../../../shared/functions';

@Component({
  selector: 'app-orgfeaddetail',
  templateUrl: './orgfeaddetail.component.html',
  styleUrls: ['./orgfeaddetail.component.css']
})
export class OrgfeaddetailComponent implements OnInit {
  @ViewChild('orgForm') myform: NgForm;
  @Input() idDis$: Observable<number>;
  @Output() onOrganisationUpdate = new EventEmitter<Organisation>();

  @Output() onOrganisationQuit = new EventEmitter<Organisation>();

  booCanSave: boolean;
  organisation: Organisation;
  userName: string;
  selectedAntenne: any;
  filteredOrganisations: any[];
  isAntenne: boolean;


  constructor(
      private organisationsService: OrganisationEntityService,
      private orgsummaryService: OrgSummaryEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.booCanSave = false;
    this.userName = '' ;
    this.isAntenne = false;
  }

  ngOnInit(): void {

    const organisation$ = combineLatest([this.idDis$, this.organisationsService.entities$])
        .pipe(
            map(([idDis, organisations]) => organisations.find(organisation => idDis === organisation.idDis))
        ).subscribe(organisation => {
          if (organisation) {
            this.organisation = organisation;
            this.isAntenne = false;
            if (organisation.birbCode == "1") {
              this.isAntenne = true;
              this.orgsummaryService.getByKey(organisation.antenne)
                  .subscribe(
                      antenne => {
                        if (antenne !== null) {
                          this.selectedAntenne = Object.assign({}, antenne, {fullname: antenne.idDis + ' ' + antenne.societe});
                        }
                      });
            }
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
                  case 'admin':
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
    if (this.selectedAntenne) {
      modifiedOrganisation.antenne = this.selectedAntenne.idDis;
    }
    else {
      modifiedOrganisation.antenne = 0;
    }
    this.organisationsService.update(modifiedOrganisation)
        .subscribe( ()  => {
              this.messageService.add({
                severity: 'success',
                summary: 'Update',
                detail: $localize`:@@messageOrganisationUpdated:Organisation ${modifiedOrganisation.idDis}  ${modifiedOrganisation.societe} was updated`
              });
              this.onOrganisationUpdate.emit(modifiedOrganisation);
            },
            ( dataserviceerror) => { 
                 
                 
                const  errMessage = {severity: 'error', summary: 'Update',
                // tslint:disable-next-line:max-line-length
                detail: $localize`:@@messageOrganisationUpdateError:The organisation ${modifiedOrganisation.idDis} ${modifiedOrganisation.societe} could not be updated: error: ${dataserviceerror.message}`,
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
          this.onOrganisationQuit.emit();
        }
      });
    } else {
      this.onOrganisationQuit.emit();
    }
  }

    handleAntenneStatusChange(e: any) {
        if (e.checked) {
            this.organisation.birbCode = "1";
            this.isAntenne = true;
        }
        else {
            this.organisation.birbCode = "0";
            this.isAntenne = false;
            this.organisation.antenne = 0;
            this.selectedAntenne = 0;
        }

    }
  generateTooltipAgreed() {
    return $localize`:@@OrgToolTipIsAgreed:Is Organisation Agreed?`;
  }

  generateTooltipFEADPersons() {
    return $localize`:@@OrgToolTipFEADPersons:Nb of Persons Agreed by FEAD`;
  }

  generateTooltipFEADFromUs() {
    return $localize`:@@OrgToolTipFEADFromUs:Is FEAD distributed by Food Banks ?`;
  }

  generateTooltipFEADCode() {
    return $localize`:@@OrgToolTipFEADCode:FEAD Code of the Organisation`;
  }

   generateTooltipIsAntenne() {
        return $localize`:@@OrgToolTipIsAntenne:Is this Organisation a Subsidiary of another Organisation?`;
    }

    generateTooltipAntenne() {
        return $localize`:@@OrgToolTipAntenne:Parent Organisation of this Subsidiary`;
    }
    generateTooltipSuggestions() {
        return generateTooltipSuggestions();
    }


}



