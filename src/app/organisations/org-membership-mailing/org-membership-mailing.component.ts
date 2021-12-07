import { Component, OnInit } from '@angular/core';
import {Organisation} from '../model/organisation';
import {OrganisationEntityService} from '../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {enmYn} from '../../shared/enums';
import { map} from 'rxjs/operators';
import {globalAuthState} from '../../auth/auth.selectors';
import {ConfirmationService, MessageService} from 'primeng/api';
import {OrgSummary} from '../model/orgsummary';
import {OrgSummaryEntityService} from '../services/orgsummary-entity.service';
import {DefaultMailing, Mailing} from '../../mailings/model/mailing';
import {DataServiceError} from '@ngrx/data';
import {MailingEntityService} from '../../mailings/services/mailing-entity.service';
import {FileUploadService} from '../../mailings/services/file-upload.service';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-org-membership-mailing',
  templateUrl: './org-membership-mailing.component.html',
  styleUrls: ['./org-membership-mailing.component.css']
})
export class OrgMembershipMailingComponent implements OnInit {

  organisation: Organisation = null;
  orgSummaries: OrgSummary[];
  orgSummaryIndex: number;
  totalOrgSummaries: number;
  YNOptions:  any[];
  loading: boolean;
  filterBase: any;
  bankName: string;
  bankMail: string;
  lienBanque: number;
    mailing: Mailing;
    mailingSubject: string;
    mailingText: string;
    // variables for file upload
    attachmentFileNames: string[];
    isYearlyMail: boolean;
    sendMailToOrgContact: boolean;
    sendMailToOrgTreasurer: boolean;
    typeMembership: string;
  constructor(private organisationService: OrganisationEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private mailingService: MailingEntityService,
              private uploadService: FileUploadService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private store: Store<AppState>
  ) {
    this.lienBanque = 0;
    this.bankName = '';
    this.bankMail = '';
    this.YNOptions = enmYn;
    this.totalOrgSummaries = 0;
    this.orgSummaryIndex = 0;
      this.mailingText = '';
      this.mailingSubject = 'Cotisation 2022 payable à la Banque Alimentaire - Note de débit';
      this.mailing = new DefaultMailing();
      this.attachmentFileNames = [];
      this.isYearlyMail = true;
      this.sendMailToOrgContact = true;
      this.sendMailToOrgTreasurer = true;
  }

  ngOnInit() {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.lienBanque = authState.banque.bankId;
              this.bankName = authState.banque.bankName;
              this.bankMail = authState.banque.bankMail;
              this.orgsummaryService.getWithQuery({'lienBanque': authState.banque.bankId.toString(), 'actif': '1', 'isDepot': '0', 'agreed': '1'})
                  .subscribe(loadedOrgSummaries => {
                    console.log('Loaded orgsummaries: ' + loadedOrgSummaries.length);
                    this.totalOrgSummaries = loadedOrgSummaries.length;
                    this.orgSummaries  = loadedOrgSummaries;
                    this.getOrganisation(0);

                  });
            })
        )
        .subscribe();

  }
  getOrganisation(summaryIndex: number) {
      this.organisationService.getByKey(this.orgSummaries[summaryIndex].idDis)
        .subscribe(organisation => {
            this.organisation = organisation;
            if (organisation.langue === 2 ) {
                this.mailingSubject = 'Bijdrage voor 2022 te betalen aan de Voedselbank';
                this.typeMembership = 'jaarlijkse ledenbijdrage';
                this.mailingText = `<Strong>DEBETNOTA<br>${this.organisation.societe}</strong><br>${this.organisation.adresse}<br>${this.organisation.cp}<br>${this.organisation.localite}<br><br>`;
                this.mailingText += `Geachte mevrouw/mijnheer,<br>Hierbij vindt u het verzoek tot betaling van de ${this.typeMembership}`;
            } else {
                this.mailingSubject = 'Cotisation 2022 payable à la Banque Alimentaire - Note de débit';
                this.typeMembership = 'cotisation annuelle';
                this.mailingText = `<Strong>NOTE DE DEBIT<br>${this.organisation.societe}</strong><br>${this.organisation.adresse}<br>${this.organisation.cp}<br>${this.organisation.localite}<br><br>`;
                this.mailingText += `Ce mail vous est adresse afin de vous demander de bien vouloir regler votre ${this.typeMembership}`;
            }
    });
  }

  getTitle(): string {
    return $localize`:@@BankOrgsTitleMembershipMailing:Membership Mailing to Organisation ${this.organisation.societe} `;
  }
    sendmail(event: Event) {
        const mailListArray = [];
        if (this.sendMailToOrgContact) {
            mailListArray.push( `${this.organisation.nom} ${this.organisation.prenom}<${this.organisation.email}>  ` );
        }
        if (this.sendMailToOrgTreasurer) {
            mailListArray.push( `${this.organisation.nomTres} ${this.organisation.prenomTres}<${this.organisation.emailTres}>  ` );
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
                this.mailing.from = this.bankMail;
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
}
