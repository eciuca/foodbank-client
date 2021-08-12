import { Component, OnInit } from '@angular/core';
import {MembreMail} from '../membres/model/membreMail';
import {MembreMailEntityService} from '../membres/services/membreMail-entity.service';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {AuthState} from '../auth/reducers';
import {globalAuthState} from '../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {BehaviorSubject} from 'rxjs';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {MailingEntityService} from './services/mailing-entity.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DefaultMailing, Mailing} from './model/mailing';

@Component({
  selector: 'app-mailings',
  templateUrl: './mailings.component.html',
  styleUrls: ['./mailings.component.css']
})
export class MailingsComponent implements OnInit {

  loadMemberSubject$ = new BehaviorSubject(null);
  membres: MembreMail[];
  selectedMembres: MembreMail[];
  bankid: number;
  bankName: string;
  membreEmail: string;
  orgName: string;
  loading: boolean;
  totalRecords: number;
  first: number;
  filterBase: any;
  booShowOrganisations: boolean;
  filteredOrganisation: any;
  filteredOrganisations: any[];
  filteredOrganisationsPrepend: any[];
  mailing: Mailing;
  mailingSubject: string;
  mailingText: string;
  constructor(private membreMailService: MembreMailEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private mailingService: MailingEntityService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private router: Router,
              private store: Store<AppState>) {
    this.bankid = 0;
    this.booShowOrganisations = false;
    this.first = 0;
    this.bankName = '';
    this.orgName = '';
    this.membreEmail = '';
    this.filteredOrganisationsPrepend = [
      {idDis: 0, societe: $localize`:@@bank:Bank` },
      {idDis: null, societe: $localize`:@@organisations:Organisations` },
    ];
    this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
    this.mailingText = '';
    this.mailingSubject = '';
    this.mailing = new DefaultMailing();
  }

  ngOnInit(): void {
    this.loading = true;
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.initializeDependingOnUserRights(authState);
            })
        )
        .subscribe();
    this.loadMemberSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.membreMailService.getWithQuery(queryParams))
        )
        .subscribe(loadedMembres => {
          console.log('Nb of Loaded membres ' + loadedMembres.length);
          this.totalRecords = loadedMembres.length;
          this.membres  = loadedMembres;
          this.loading = false;
          this.membreMailService.setLoaded(true);
        });
    this.loadMembers();
  }
  loadMembers() {
    console.log('Entering loadmembers');
    this.loading = true;
    const queryParms = {...this.filterBase};

    if (this.booShowOrganisations && this.filteredOrganisation && this.filteredOrganisation.idDis != null) {
      queryParms['lienDis'] = this.filteredOrganisation.idDis;
    }
    this.loadMemberSubject$.next(queryParms);
  }
  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.banque) {
      this.bankid = authState.banque.bankId;
      this.bankName = authState.banque.bankName;
      this.membreEmail = authState.user.membreEmail;
      switch (authState.user.rights) {
        case 'Bank':
        case 'Admin_Banq':
          this.booShowOrganisations = true;
          this.filterBase = { 'lienBanque': authState.banque.bankId};
          break;
        case 'Asso':
        case 'Admin_Asso':
          this.filterBase = { 'lienDis': authState.organisation.idDis};
          this.orgName = authState.organisation.societe;
          break;
        default:
      }
    }
  }
  filterOrganisation(event ) {
    const  queryOrganisationParms: QueryParams = {};
    queryOrganisationParms['lienBanque'] = this.bankid.toString();
    queryOrganisationParms['societe'] = event.query.toLowerCase();
    this.orgsummaryService.getWithQuery(queryOrganisationParms)
        .subscribe(filteredOrganisations => {
          this.filteredOrganisations = this.filteredOrganisationsPrepend.concat(filteredOrganisations.map((organisation) =>
              Object.assign({}, organisation, {fullname: organisation.societe})
          ));
          console.log('Proposed Organisations', this.filteredOrganisations);
        });
  }

  filterOrganisationMembers(idDis: number) {
    // when we switch we need to restart from first page
    this.first = 0;
    const latestQueryParams = {...this.loadMemberSubject$.getValue()};
    latestQueryParams['offset'] = '0';
    if (idDis != null) {
      latestQueryParams['lienDis'] = idDis;
    } else {
      if (latestQueryParams.hasOwnProperty('lienDis')) {
        delete latestQueryParams['lienDis'];
      }
    }
    this.loadMemberSubject$.next(latestQueryParams);
  }

  sendmail(event: Event) {
    this.confirmationService.confirm({
      target: event.target,
      message: $localize`:@@confirmSendMessage:Do you want to send this message?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
       this.mailing.subject = this.mailingSubject;
       this.mailing.from = this.membreEmail;
       this.mailing.to = 'clairevdm@gmail.com';
       // this.mailing.bodyText = 'Hello World';
       this.mailing.bodyText = this.mailingText;
       this.mailingService.add(this.mailing)
            .subscribe((myMail: Mailing) => {
                  console.log('Returned mailing',  myMail);
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Creation',
                    detail: $localize`:@@messageSent:Message has been sent`
                  });
                 },
                (dataserviceerror: DataServiceError) => {
                  console.log('Error Sending Message', dataserviceerror);
                  const  errMessage = {severity: 'error', summary: 'Send',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageSendError:The message could not be sent: error: ${dataserviceerror.message}`,
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
}
