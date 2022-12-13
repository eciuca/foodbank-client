import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {AuthState} from '../auth/reducers';
import {AuthService} from '../auth/auth.service';
import {globalAuthState} from '../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {BehaviorSubject} from 'rxjs';
import {MailingEntityService} from './services/mailing-entity.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DefaultMailing, Mailing} from './model/mailing';
import {HttpClient} from '@angular/common/http';
import {FileUploadService} from './services/file-upload.service';
import {MailAddress} from './model/mailaddress';
import {MailadressEntityService} from './services/mailadress-entity.service';
import {RegionEntityService} from '../organisations/services/region-entity.service';
import {enmLanguage, enmMailGroupsBank, enmMailGroupsFBBA, enmMailGroupsOrg} from '../shared/enums';
import {FileUpload} from 'primeng/fileupload';
import {AuditChangeEntityService} from '../audits/services/auditChange-entity.service';
import {environment} from '../../environments/environment';


@Component({
  selector: 'app-mailings',
  templateUrl: './mailings.component.html',
  styleUrls: ['./mailings.component.css']
})
export class MailingsComponent implements OnInit {

  loadAddressSubject$ = new BehaviorSubject(null);
  loadOrganisationSubject$ = new BehaviorSubject(null);
  latestAddressQueryParams: any;
  latestOrgQueryParams: any;
  mailadresses: MailAddress[];
  selectedMailadresses: MailAddress[];
  bankid: number;
  bankName: string;
  userId: string;
  userName: string;
  senderFullEmail: string;
  orgId: number;
  orgName: string;
  loading: boolean;
  totalRecords: number;
  first: number;
  filterBase: any;
  selectedFilter: any;
  filterOptions: any[];
  filteredOrganisationsPrepend: any[];
  booOnlyAgreed: boolean;
  booOnlyFead: boolean;
  mailgroups: any[];
  regions: any[];
  languages: any[];
  regionSelected: number;
  languageSelected: string;
  mailgroupSelected: string;
  mailing: Mailing;
  mailingSubject: string;
  mailingText: string;
  mailingToList: string;
  // variables for file upload
  attachmentFileNames: string[];
  displayDialog: boolean;
  maxAttachmentFileSize: number;
  isAttachmentUploadOngoing: boolean;
  bccMode:boolean;
  isFBBA: boolean;

  constructor(private orgsummaryService: OrgSummaryEntityService,
              private regionService: RegionEntityService,
              private mailAddressService: MailadressEntityService,
              private mailingService: MailingEntityService,
              private auditChangeEntityService: AuditChangeEntityService,
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
    this.orgId = 0;
    this.senderFullEmail = '';
    this.mailingText = '';
    this.mailingSubject = '';
    this.mailing = new DefaultMailing();
    this.attachmentFileNames = [];
    this.languages = enmLanguage;
    this.booOnlyAgreed = false;
    this.booOnlyFead = false;
    this.filteredOrganisationsPrepend = [
      {idDis: null, fullname: $localize`:@@All:All`},
    ];
    this.mailgroupSelected = '0';
    this.maxAttachmentFileSize = 5000000; // max 5 MB file size
    this.isAttachmentUploadOngoing = false;
    this.bccMode = true;
    this.isFBBA = false;
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
    this.loadOrganisationSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.orgsummaryService.getWithQuery(queryParams))
        )
        .subscribe(loadedOrgSummaries => {
          console.log('Nb of Loaded organisations ' + loadedOrgSummaries.length);
          this.filterOptions = this.filteredOrganisationsPrepend.concat(loadedOrgSummaries.map((organisation) =>
              Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
              ));
          this.selectedFilter = this.filterOptions[0];
        });
    this.loadAddressSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.mailAddressService.getWithQuery(queryParams))
        )
        .subscribe(loadedMailadresses => {
          console.log('Nb of Loaded adresses ' + loadedMailadresses.length);
          this.totalRecords = loadedMailadresses.length;
          this.mailadresses = loadedMailadresses;
          this.selectedMailadresses = [];
          this.displayDialog = false;
          this.loading = false;
          this.mailingService.setLoaded(true);
        });
    this.loadAddresses();
    this.loadOrganisations();

  }
  private loadOrganisations() {
    this.latestOrgQueryParams = {...this.filterBase};
    this.loadOrganisationSubject$.next(this.latestOrgQueryParams);
  }

  loadAddresses() {
    this.loading = true;
    this.latestAddressQueryParams = {...this.filterBase};
    this.latestAddressQueryParams['mailGroup'] = '0';

    if (this.selectedFilter && this.selectedFilter.idDis != null) {
      this.latestAddressQueryParams['lienDis'] = this.selectedFilter.idDis;
    }
    this.loadAddressSubject$.next(this.latestAddressQueryParams);
  }

  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.banque) {
      this.bankid = authState.banque.bankId;
      this.bankName = authState.banque.bankName;
      this.userId= authState.user.idUser;
      this.userName = authState.user.membreNom + ' ' + authState.user.membrePrenom;
      this.senderFullEmail = `${authState.user.membrePrenom} ${authState.user.membreNom}<${authState.user.membreEmail}>` ;
      this.filterBase = {'actif': '1', isDepot: '0'};
      switch (authState.user.rights) {
        case 'Admin_FBBA':
        case 'admin':
          this.mailgroups = enmMailGroupsFBBA;
          this.isFBBA = true;
          break;
        case 'Admin_Banq':
          this.filterBase['lienBanque'] = authState.banque.bankId
          this.mailgroups = enmMailGroupsBank;
          break;
        case 'Admin_Asso':
          this.filterBase['lienBanque'] = authState.banque.bankId;
          this.orgId = authState.organisation.idDis;
          this.orgName = authState.organisation.societe;
          this.mailgroups = enmMailGroupsOrg;
          this.selectedFilter = this.filteredOrganisationsPrepend[0];
          break;
        default:

      }
      this.regionService.getWithQuery({'lienBanque': this.bankid.toString()})
          .subscribe(regions => {
            this.regions = [{ value: null, label: ''}];
            regions.map((region) =>
                this.regions.push({value: region.regId, label: region.regName})
            );
          });
    }
  }

  addOrganisationsToFilterOptions(event) {
    this.latestOrgQueryParams = {...this.loadOrganisationSubject$.getValue()};
    if (event.query.length > 0) {
      this.latestOrgQueryParams['societe'] = event.query.toLowerCase();
    }
    else {
      if (this.latestOrgQueryParams.hasOwnProperty('societe')) {
        delete this.latestOrgQueryParams['societe'];
      }
    }
    this.loadOrganisationSubject$.next(this.latestOrgQueryParams);

  }


  filterAddresses(idDis: number) {
    // when we switch we need to restart from first page
    this.first = 0;
    this.latestAddressQueryParams = {...this.loadAddressSubject$.getValue()};
    if (idDis != null) {
      this.latestAddressQueryParams['lienDis'] = idDis;
    } else {
      if (this.latestAddressQueryParams.hasOwnProperty('lienDis')) {
        delete this.latestAddressQueryParams['lienDis'];
      }
    }
    this.setAgreedFilter();
    this.setFeadFilter();
    this.setRegionFilter();
    this.setMailGroupFilter();
    this.setLanguageFilter();
    this.loadAddressSubject$.next(this.latestAddressQueryParams);
  }

  sendmail(event: Event) {
    if(environment.apiUrl.includes('localhost') || environment.apiUrl.includes('dev.')) {
      const errMessage = {
        severity: 'error', summary: 'Send',
        detail: $localize`:@@MailingNotAllowed:Mailing is disabled for test environments`,
        life: 6000
      };
      this.messageService.add(errMessage);
      return;
    }
    let mailListArray = [];
    if ( this.mailingToList) {
      mailListArray = this.mailingToList.split('\n');
    }

    if ( mailListArray.length > 80) {
      const errMessage = {
        severity: 'error', summary: 'Send',
        detail: $localize`:@@messageSendMaxListError:You have specified ${mailListArray.length} recipients. The maximum is 80. This mailing system is intended for intercommunication in our community, mot for mass-mailing`,
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
        this.mailing.from = this.senderFullEmail;
        this.mailing.to = mailListArray.join(',');
        // this.mailing.bodyText = 'Hello World';
        this.mailing.bodyText = this.mailingText;
        this.mailing.attachmentFileNames = this.attachmentFileNames.toString();
        this.mailing.bccMode = this.bccMode;
        this.mailingService.add(this.mailing)
            .subscribe((myMail: Mailing) => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Creation',
                    detail: $localize`:@@messageSent:Message has been sent`
                  });
                  let mailGroupLabel = "?"
                  // to retrieve mailGroupLabel, use enmMailGroupsBank because it contains all possible options
                  const indexItem = enmMailGroupsBank.map(e => e.value).indexOf(Number(this.mailgroupSelected));
                  if (indexItem > -1) {
                    mailGroupLabel = enmMailGroupsBank[indexItem ].label;
                  }

                  this.auditChangeEntityService.logDbChange(this.userId,this.userName,this.bankid, this.orgId,'Email',
                      mailGroupLabel + "("+ mailListArray.length + " dest)", 'Create' );
                },
                (error: Error) => {
                  const errMessage = {
                    severity: 'error', summary: 'Send',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageSendError:The message could not be sent: error: ${error.message}`,
                    life: 6000
                  };
                  this.messageService.add(errMessage);
                }
            );
      }
    });
  }

  storeMailAttachment(event: any,uploader: FileUpload) {
    const newFiles : File[] = event.files.filter(item => !this.attachmentFileNames.includes( item.name));
    if (newFiles.length > 0) {
      const file = newFiles[0];
      const i = event.files.findIndex(x => x.name === file.name);
      console.log(`loading file ${file.name} with size ${file.size}. index is ${i}` );
      if (file.size > this.maxAttachmentFileSize) {
        uploader.remove(event, i);
        this.messageService.add({
          severity: 'error',
          summary: $localize`:@@fileUploadError:Upload Mail Attachment Failed`,
          detail: $localize`:@@fileUploadErrorDetailSize:Could not upload file ${file.name}. Size ${file.size} is too big for our internal mailing system(maximum is ${this.maxAttachmentFileSize} bytes) `,
          life: 6000
        });
      }
      else {
        this.isAttachmentUploadOngoing = true;
        this.uploadService.upload(file, this.authService.accessToken).subscribe(
            (response: any) => {
              console.log(response);
              this.isAttachmentUploadOngoing = false;
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
              this.isAttachmentUploadOngoing = false;
              uploader.remove(event, i);
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
  }

  removeMailAttachment(event: any) {
    const file: File | null = event.file;
    this.attachmentFileNames = this.attachmentFileNames.filter(item => item !== file.name);
  }

  loadTextAreaWidget() {
    this.mailingToList = Array.prototype.map.call(this.selectedMailadresses, function (item) {
      if (item.email && item.email.length > 0) {
        return item.nom + ' ' + item.prenom + '<' + item.email + '>';
      } else {
        return '';
      }
    }).join('\n');
  }

  showDialogToAdd() {
      this.displayDialog = true;
    }

  handleMailAddressQuit() {
    this.displayDialog = false;
  }

  handleMailAddressCreate(newMailAdress: MailAddress) {
    this.mailadresses.unshift({ 'societe': $localize`:@@MailAddedManually:Added Manually`,'nom': newMailAdress.nom,'prenom':  newMailAdress.prenom, 'email': newMailAdress.email });
    this.displayDialog = false;
  }

  filterLanguage(language) {
    this.languageSelected = language;
    this.latestAddressQueryParams = {...this.loadAddressSubject$.getValue()};

    // when we switch, we need to restart from first page
    this.first = 0;
    this.setLanguageFilter();

    this.loadAddressSubject$.next(this.latestAddressQueryParams);
  }
  setLanguageFilter() {
    if (this.languageSelected) {
      this.latestAddressQueryParams['langue'] = this.languageSelected;
    } else {
      if (this.latestAddressQueryParams.hasOwnProperty('langue')) {
        delete this.latestAddressQueryParams['langue'];
      }
    }
  }
  filterRegion(regId) {
    this.regionSelected = regId;
    this.latestAddressQueryParams = {...this.loadAddressSubject$.getValue()};
    this.latestOrgQueryParams = {...this.loadOrganisationSubject$.getValue()};
    // when we switch , we need to restart from first page
    this.first = 0;
    this.setRegionFilter();
    this.loadAddressSubject$.next(this.latestAddressQueryParams);
    this.loadOrganisationSubject$.next( this.latestOrgQueryParams);
  }
  setRegionFilter() {
    if (this.regionSelected) {
      this.latestAddressQueryParams['regId'] = this.regionSelected;
      this.latestOrgQueryParams['regId'] =this.regionSelected;
    } else {
      // delete regId entry
      if (this.latestAddressQueryParams.hasOwnProperty('regId')) {
        delete this.latestAddressQueryParams['regId'];
      }
      if ( this.latestOrgQueryParams.hasOwnProperty('regId')) {
        delete  this.latestOrgQueryParams['regId'];
      }
    }
  }

  filterAgreed(agreed) {
    this.booOnlyAgreed = agreed.checked;
    this.latestAddressQueryParams = {...this.loadAddressSubject$.getValue()};
    this.latestOrgQueryParams = {...this.loadOrganisationSubject$.getValue()};
    // when we switch , we need to restart from first page
    this.first = 0;
   this.setAgreedFilter();
    this.loadAddressSubject$.next(this.latestAddressQueryParams);
    this.loadOrganisationSubject$.next(this.latestOrgQueryParams);
  }
  setAgreedFilter() {
    if (this.booOnlyAgreed) {
      this.latestAddressQueryParams['agreed'] = '1';
      this.latestOrgQueryParams['agreed'] = '1';
    } else {
      // delete agreed entry
      if (this.latestAddressQueryParams.hasOwnProperty('agreed')) {
        delete this.latestAddressQueryParams['agreed'];
      }
      if ( this.latestOrgQueryParams.hasOwnProperty('agreed')) {
        delete  this.latestOrgQueryParams['agreed'];
      }
    }
  }

  filterFead(feadN) {
    this.booOnlyFead = feadN.checked;
    this.latestAddressQueryParams = {...this.loadAddressSubject$.getValue()};
    this.latestOrgQueryParams = {...this.loadOrganisationSubject$.getValue()};
    // when we switch , we need to restart from first page
    this.first = 0;
    this.setFeadFilter();
    this.loadAddressSubject$.next(this.latestAddressQueryParams);
    this.loadOrganisationSubject$.next( this.latestOrgQueryParams);

  }
  setFeadFilter() {
    if (this.booOnlyFead) {
      this.latestAddressQueryParams['feadN'] = '1';
      this.latestOrgQueryParams['feadN'] = '1';
    } else {
      // delete feadN entry
      if (this.latestAddressQueryParams.hasOwnProperty('feadN')) {
        delete this.latestAddressQueryParams['feadN'];
      }
      if ( this.latestOrgQueryParams.hasOwnProperty('feadN')) {
        delete  this.latestOrgQueryParams['feadN'];
      }
    }
  }

  filterMailGroup(mailgroup) {
    this.mailgroupSelected = mailgroup;
    this.latestAddressQueryParams = {...this.loadAddressSubject$.getValue()};
    // when we switch filters , we need to restart from first page
    this.first = 0;
    if (this.orgId == 0) { // admin or admin_bank or FBBA functionality
      this.booOnlyAgreed = false;
      this.booOnlyFead = false;
      this.regionSelected = null;
      if (this.latestAddressQueryParams.hasOwnProperty('lienDis')) {
        delete this.latestAddressQueryParams['lienDis'];
      }
      this.setFeadFilter();
      this.setAgreedFilter();
      this.setRegionFilter();
      this.setLanguageFilter();
      this.setMailGroupFilter();
    }
    else {  // functionality for organisations
      if (this.mailgroupSelected == '0') {
        if (this.latestAddressQueryParams.hasOwnProperty('lienDis')) {
          delete this.latestAddressQueryParams['lienDis'];
        }
      }
      else {
        this.latestAddressQueryParams['lienDis'] = this.orgId;
      }
    }
    this.latestAddressQueryParams['mailGroup'] = this.mailgroupSelected;
    this.loadAddressSubject$.next(this.latestAddressQueryParams);
    this.loadOrganisationSubject$.next( this.latestOrgQueryParams);
  }
  setMailGroupFilter() {
    this.latestAddressQueryParams['mailGroup'] = this.mailgroupSelected;
    if (this.isFBBA ) {
      if (Number(this.mailgroupSelected) > 4) { // mail adressees of fbaa limited to Fbba bank for those groups
        this.latestAddressQueryParams['lienBanque'] = this.bankid
      } else {
        if (this.latestAddressQueryParams.hasOwnProperty('lienBanque')) {
          delete this.latestAddressQueryParams['lienBanque'];
        }
      }
    }
  }

  saveSelection() {
    this.mailadresses = this.selectedMailadresses;
  }

  generateTooltipBccMode() {
    return $localize`:@@ToolTipMailingBccMode:Unless your mailing list is small, blind copy mode is recommended to hide the e-mails of your adressees to protect their privacy`;
  }
}

