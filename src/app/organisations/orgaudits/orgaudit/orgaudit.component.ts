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
import {Membre} from '../../../membres/model/membre';
import {MembreEntityService} from '../../../membres/services/membre-entity.service';
import {OrgSummaryEntityService} from '../../services/orgsummary-entity.service';
import {OrgSummary} from '../../model/orgsummary';

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
  selectedAuditor: Membre;
  filteredMembres: Membre[];
  selectedOrganisation: OrgSummary;
  filteredOrganisations: OrgSummary[];
  filteredDepots: any[];
  selectedDepot: any;
  constructor(
      private orgauditsService: OrgauditEntityService,
      private membresService: MembreEntityService,
      private orgsummaryService: OrgSummaryEntityService,
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
        this.membresService.getByKey(orgaudit.auditorNr)
            .subscribe(
                membre => {
                  if (membre !== null) {
                    this.selectedAuditor = Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                    console.log('our auditor:', this.selectedAuditor);
                  } else {
                    console.log('There is no auditor!');
                  }
                });
        this.orgsummaryService.getByKey(orgaudit.lienDis)
            .subscribe(
                orgsummary => {
                  if (orgsummary !== null) {
                    this.selectedOrganisation = Object.assign({}, orgsummary, {fullname: orgsummary.idDis + ' ' + orgsummary.societe});
                    console.log('audited org:', this.selectedOrganisation);
                  } else {
                    console.log('There is no audited org!');
                  }
                });
        this.orgsummaryService.getByKey(orgaudit.lienDep)
            .subscribe(
                orgsummary => {
                  if (orgsummary !== null) {
                    this.selectedDepot = Object.assign({}, orgsummary, {fullname: orgsummary.idDis + ' ' + orgsummary.societe});
                    console.log('audited depot:', this.selectedDepot);
                  } else {
                    console.log('There is no audited depot!');
                  }
                });
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
                this.lienBanque = authState.banque.bankId;
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
  filterMembre(event ) {
    const  queryMemberParms: QueryParams = {};
    const query = event.query;
    queryMemberParms['offset'] = '0';
    queryMemberParms['rows'] = '10';
    queryMemberParms['sortField'] = 'nom';
    queryMemberParms['sortOrder'] = '1';
    queryMemberParms['lienBanque'] = this.lienBanque.toString();
    if (event.query.length > 0) {
      queryMemberParms['nom'] = query.toLowerCase();
    }
    this.membresService.getWithQuery(queryMemberParms)
        .subscribe(filteredMembres => {
          this.filteredMembres = filteredMembres.map((membre) =>
              Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom})
          );
        });
  }
  filterOrganisation(event ) {
    console.log('Filter Organisation', event);
    const  queryOrganisationParms: QueryParams = {};
    queryOrganisationParms['lienBanque'] = this.lienBanque.toString();
    if (event.query.length > 0) {
      queryOrganisationParms['societe'] = event.query.toLowerCase();
    }
    this.orgsummaryService.getWithQuery(queryOrganisationParms)
        .subscribe(filteredOrganisations => {
          this.filteredOrganisations = filteredOrganisations.map((orgsummary) =>
              Object.assign({}, orgsummary, {fullname: orgsummary.idDis + ' ' + orgsummary.societe})
          );
        });
  }
  filterDepot(event ) {
    const  queryDepotParms = {};
    const query = event.query;
    queryDepotParms['offset'] = '0';
    queryDepotParms['rows'] = '10';
    queryDepotParms['sortField'] = 'Societe';
    queryDepotParms['sortOrder'] = '1';
    queryDepotParms['lienBanque'] = this.lienBanque.toString();
    queryDepotParms['isDepot'] = true;
    queryDepotParms['societe'] = query.toLowerCase();
    this.orgsummaryService.getWithQuery(queryDepotParms)
        .subscribe(filteredDepots =>   {
          this.filteredDepots = filteredDepots.map((orgsummary) =>
              Object.assign({}, orgsummary, {fullname: orgsummary.idDis + ' ' + orgsummary.societe})
          );
        });
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
    modifiedOrgaudit.auditorNr = this.selectedAuditor.batId;
    modifiedOrgaudit.auditorName = this.selectedAuditor.nom + ' ' + this.selectedAuditor.prenom;
    modifiedOrgaudit.lienDis = this.selectedOrganisation.idDis;
    modifiedOrgaudit.societe = this.selectedOrganisation.societe;
    modifiedOrgaudit.lienDep = this.selectedDepot.idDis;
    modifiedOrgaudit.depotName = this.selectedDepot.societe;

    if (modifiedOrgaudit.hasOwnProperty('auditId')) {
      this.orgauditsService.update(modifiedOrgaudit)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update',
                  detail: `The audit for ${modifiedOrgaudit.societe}  was updated`
                });
                this.onOrgauditUpdate.emit(modifiedOrgaudit);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error updating audit', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: `The audit  for ${modifiedOrgaudit.societe} could not be updated: error: ${dataserviceerror.message}`,
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
                  detail: `The audit for ${newOrgaudit.societe}  has been created`
                });
                this.onOrgauditCreate.emit(newOrgaudit);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error creating audit', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: `The audit  for ${modifiedOrgaudit.societe} could not be created: error: ${dataserviceerror.message}`,
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



