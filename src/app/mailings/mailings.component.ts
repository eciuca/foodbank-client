import { Component, OnInit } from '@angular/core';
import {MembreMail} from '../membres/model/membreMail';
import {MembreMailEntityService} from '../membres/services/membreMail-entity.service';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {AuthState} from '../auth/reducers';
import { AuthService } from '../auth/auth.service';
import {globalAuthState} from '../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {BehaviorSubject} from 'rxjs';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {MailingEntityService} from './services/mailing-entity.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DefaultMailing, Mailing} from './model/mailing';
import {HttpClient} from '@angular/common/http';
import {FileUploadService} from './services/file-upload.service';



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
  membreFullEmail: string;
  orgName: string;
  loading: boolean;
  totalRecords: number;
  first: number;
  filterBase: any;
  filteredOrganisation: any;
  filteredOrganisations: any[];
  filteredOrganisationsPrepend: any[];
  mailing: Mailing;
  mailingSubject: string;
  mailingText: string;
  mailingToList: string;
  // variables for file upload
  attachmentFileNames: string[];

  constructor(private membreMailService: MembreMailEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private mailingService: MailingEntityService,
              private uploadService: FileUploadService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private router: Router,
              private authService: AuthService,
              private http: HttpClient,
              private store: Store<AppState>) {
    this.bankid = 0;
    this.first = 0;
    this.bankName = '';
    this.orgName = '';
    this.membreEmail = '';
    this.membreFullEmail = '';
    this.mailingText = '';
    this.mailingSubject = '';
    this.mailing = new DefaultMailing();
    this.attachmentFileNames = [];

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
          this.membres = loadedMembres;
          this.loading = false;
          this.membreMailService.setLoaded(true);
        });
    this.loadMembers();

  }

  loadMembers() {
    console.log('Entering loadmembers');
    this.loading = true;
    const queryParms = {...this.filterBase};

    if (this.filteredOrganisation && this.filteredOrganisation.idDis != null) {
      queryParms['lienDis'] = this.filteredOrganisation.idDis;
    }
    this.loadMemberSubject$.next(queryParms);
  }

  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.banque) {
      this.bankid = authState.banque.bankId;
      this.bankName = authState.banque.bankName;
      this.membreEmail = authState.user.membreEmail;
      this.membreFullEmail = `${authState.user.membrePrenom} ${authState.user.membreNom}<${authState.user.membreEmail}>` ;
      this.filterBase = {'lienBanque': authState.banque.bankId};
      switch (authState.user.rights) {
        case 'Bank':
        case 'Admin_Banq':
          this.filteredOrganisationsPrepend = [
            {idDis: 0, societe: $localize`:@@bank:Bank`},
            {idDis: null, societe: $localize`:@@organisations:Organisations`},
          ];
          this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
          break;
        case 'Asso':
        case 'Admin_Asso':
          this.orgName = authState.organisation.societe;
          this.filteredOrganisationsPrepend = [
            {idDis: authState.organisation.idDis, societe: $localize`:@@organisationMine:My Organisation`},
            {idDis: 0, societe: $localize`:@@bank:Bank`},
            {idDis: null, societe: $localize`:@@organisations:Organisations`},
          ];
          this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
          break;
        default:
      }
    }
  }

  filterOrganisation(event) {
    const queryOrganisationParms: QueryParams = {};
    queryOrganisationParms['lienBanque'] = this.bankid.toString();
    if (event.query.length > 0) {
      queryOrganisationParms['societe'] = event.query.toLowerCase();
    }
    this.orgsummaryService.getWithQuery(queryOrganisationParms)
        .subscribe(filteredOrganisations => {
          this.filteredOrganisations = this.filteredOrganisationsPrepend.concat(filteredOrganisations.map((organisation) =>
              Object.assign({}, organisation, {fullname: organisation.societe})
          ));
        });
  }

  filterOrganisationMembers(idDis: number) {
    // when we switch we need to restart from first page
    this.first = 0;
    const latestQueryParams = {...this.loadMemberSubject$.getValue()};
    if (idDis != null) {
      latestQueryParams['lienDis'] = idDis;
    } else {
      if (latestQueryParams.hasOwnProperty('lienDis')) {
        delete latestQueryParams['lienDis'];
      }
    }
    // console.log('IdDis:', idDis, 'My latest Query parms are:', latestQueryParams);
    this.loadMemberSubject$.next(latestQueryParams);
  }

  sendmail(event: Event) {
    let mailListArray = [];
    if ( this.mailingToList) {
      mailListArray = this.mailingToList.split('\n');
    }
    console.log('mailListArray', mailListArray);
    if ( mailListArray.length > 3) {
      const errMessage = {
        severity: 'error', summary: 'Send',
        detail: $localize`:@@messageSendMaxListError:You have ${mailListArray.length} recipients. The maximum is 3.`,
        life: 6000
      };
      this.messageService.add(errMessage);
      return;
    }
    if (mailListArray.length === 0 || (mailListArray.length === 1 && mailListArray[0].trim() === '' ) ) {
      const errMessage = {
        severity: 'error', summary: 'Send',
        detail: $localize`:@@messageSendNoListError:You have no recipients. Please select the recipients for your email.`,
        life: 6000
      };
      this.messageService.add(errMessage);
      return;
    }
    this.confirmationService.confirm({
      target: event.target,
      message: $localize`:@@confirmSendMessage:Do you want to send this message?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.mailing.subject = this.mailingSubject;
        this.mailing.from = this.membreFullEmail;
        this.mailing.to = mailListArray.join(',');
        // this.mailing.bodyText = 'Hello World';
        this.mailing.bodyText = this.mailingText;
        this.mailing.attachmentFileNames = this.attachmentFileNames.toString();
        this.mailingService.add(this.mailing)
            .subscribe((myMail: Mailing) => {
                  console.log('Returned mailing', myMail);
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Creation',
                    detail: $localize`:@@messageSent:Message has been sent`
                  });
                },
                (dataserviceerror: DataServiceError) => {
                  console.log('Error Sending Message', dataserviceerror);
                  const errMessage = {
                    severity: 'error', summary: 'Send',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageSendError:The message could not be sent: error: ${dataserviceerror.message}`,
                    life: 6000
                  };
                  this.messageService.add(errMessage);
                }
            );
      },
      reject: () => {
        console.log('We do nothing');
      }
    });
  }

  storeMailAttachment(event: any) {
   // console.log('Entering storeMailAttachment', event );
   // console.log('Current Files Selection', this.attachmentFileNames);
    const file: File | null = event.files[0];

      if (file) {
        this.uploadService.upload(file, this.authService.accessToken).subscribe(
            (response: any) => {
              console.log(response);
              this.attachmentFileNames = this.attachmentFileNames.filter(item => item !== file.name);
              this.attachmentFileNames.push(file.name);
              this.messageService.add({
                  severity: 'success',
                  summary: $localize`:@@fileUploadSuccess:Upload Mail Attachment Succeeded`,
                  detail: $localize`:@@fileUploadSuccessDetail:File ${file.name} was uploaded`,
                  life: 6000
                });
            },
            (err: any) => {
              console.log(err);
              let errorMsg = '';
              if (err.error && err.error.message) {
                errorMsg = err.error.message;
              }
              this.messageService.add({
                severity: 'error',
                summary: $localize`:@@fileUploadError:Upload Mail Attachment Failed`,
                detail: $localize`:@@fileUploadErrorDetail:Could not upload file ${file.name}. ${errorMsg} `,
                life: 6000
              });
            });

      }
  }

  removeMailAttachment(event: any) {
    console.log('Entering removeMailAttachment', event );
    const file: File | null = event.file;
    this.attachmentFileNames = this.attachmentFileNames.filter(item => item !== file.name);
  }

  loadTextAreaWidget(event: any) {
    // console.log('Select mail event', event, this.selectedMembres);
    // tslint:disable-next-line:max-line-length
    this.mailingToList = Array.prototype.map.call(this.selectedMembres, function (item) {
      if (item.batmail && item.batmail.length > 0) {
        return item.nom + ' ' + item.prenom + '<' + item.batmail + '>';
      } else {
        return '';
      }
    }).join('\n');
  }

}

