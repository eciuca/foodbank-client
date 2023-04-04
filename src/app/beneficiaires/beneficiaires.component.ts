import {Component, OnInit} from '@angular/core';
import {Beneficiaire} from './model/beneficiaire';
import {BeneficiaireEntityService} from './services/beneficiaire-entity.service';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {Router} from '@angular/router';
import {AuthState} from '../auth/reducers';
import {LazyLoadEvent, MessageService} from 'primeng/api';
import {QueryParams} from '@ngrx/data';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {enmStatutFead, enmYn} from '../shared/enums';
import {labelCoeff,getCoeffTooltip,generateTooltipOrganisation} from '../shared/functions';
import {AuthService} from '../auth/auth.service';
import {ExcelService} from '../services/excel.service';
import {BeneficiaireHttpService} from './services/beneficiaire-http.service';
import {formatDate} from '@angular/common';
import {labelCivilite} from '../shared/functions';
import {Organisation} from '../organisations/model/organisation';
import {OrganisationEntityService} from '../organisations/services/organisation-entity.service';
import {DefaultMailing, Mailing} from '../mailings/model/mailing';
import {MailingEntityService} from '../mailings/services/mailing-entity.service';


@Component({
  selector: 'app-beneficiaires',
  templateUrl: './beneficiaires.component.html',
  styleUrls: ['./beneficiaires.component.css']
})

export class BeneficiairesComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdClient$ = new BehaviorSubject(0);
  loggedInUserId: string;
  loggedInUserName: string;
  loggedInUserRights: string;
  beneficiaires: Beneficiaire[];
  beneficiaire: Beneficiaire = null;
  displayDialog: boolean;
  totalRecords: number;
  loading: boolean;
  filterBase: any;
  booCanCreate: boolean;
  booShowArchived: boolean;
  currentOrganisation: Organisation;
  filteredOrganisation: any;
  filteredOrganisations: any[];
  filteredOrganisationsPrepend: any[];
  booShowOrganisations: boolean;
  first: number;
  bankid: number;
  bankName: string;
  bankShortName: string;
  idOrg: number;
  lienCpas: number;
  orgName: string; // if logging in with asso role we need to display the organisation
  YNOptions:  any[];
  duplicatesOptions: any[];
  duplicateFilter: any;
  summaryMessage: string;
  feadStatuses: any[];
  isValidConfig: boolean;
  mailing: Mailing;


  constructor(private beneficiaireService: BeneficiaireEntityService,
              private organisationsService: OrganisationEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private authService: AuthService,
              private messageService: MessageService,
              private mailingService: MailingEntityService,
              private excelService: ExcelService,
              private beneficiaireHttpService: BeneficiaireHttpService,
              private router: Router,
              private store: Store
  ) {
    this.loggedInUserId ="";
    this.loggedInUserName ="";
    this.loggedInUserRights ="";
    this.booCanCreate = false;
    this.booShowArchived = false;
    this.bankid = 0;
    this.booShowOrganisations = false;
    this.first = 0;
    this.bankName = '';
    this.bankShortName = '';
    this.idOrg = 0;
    this.orgName = '';
    this.lienCpas = 0;
    this.filteredOrganisationsPrepend = [
          {idDis: null, fullname: $localize`:@@organisations:Organisations` },
    ];
    this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
    this.YNOptions = enmYn;
    this.feadStatuses = enmStatutFead;
    this.duplicatesOptions = [
      {label: ' ', value: null },
      {label: $localize`:@@ClientDuplicateNames:Beneficiaries with Duplicate Names`, value: 'name'},
      {label: $localize`:@@ClientDuplicateBirthDates:Beneficiaries with Duplicate BirthDates`, value: 'birthDate'},
    ];
    this.isValidConfig = false;
    this.mailing = new DefaultMailing();
  }

  ngOnInit() {
    this.reload();
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.beneficiaireService.getWithQuery(queryParams))
        )
        .subscribe(loadedBeneficiaires => {
          console.log('Loaded beneficiaires from nextpage: ' + loadedBeneficiaires.length);
          if (loadedBeneficiaires.length > 0) {
            this.totalRecords = loadedBeneficiaires[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.beneficiaires  = loadedBeneficiaires;
          this.loading = false;
          this.beneficiaireService.setLoaded(true);
        });
  }

  reload() {
    this.loading = true;
    this.totalRecords = 0;
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.initializeDependingOnUserRights(authState);
            })
        )
        .subscribe();



  }
  handleSelect(beneficiaire) {
    this.selectedIdClient$.next(beneficiaire.idClient);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedIdClient$.next(0);
    this.displayDialog = true;
  }

  handleBeneficiaireQuit() {
    this.displayDialog = false;
  }

  handleBeneficiaireUpdate(updatedBeneficiaire) {
    const index = this.beneficiaires.findIndex(beneficiaire => beneficiaire.idClient === updatedBeneficiaire.idClient);
    this.beneficiaires[index] = updatedBeneficiaire;
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }
  handleBeneficiaireCreate(createdBeneficiaire: Beneficiaire) {
    this.beneficiaires.push({...createdBeneficiaire});
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

  handleBeneficiaireDeleted(deletedBeneficiaire) {
    const index = this.beneficiaires.findIndex(beneficiaire => beneficiaire.idClient === deletedBeneficiaire.idClient);
    this.beneficiaires.splice(index, 1);
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

  nextPage(event: LazyLoadEvent) {
    if (this.isValidConfig) {
      this.loading = true;
      if (event.sortField == null) {
        setTimeout(() => {
          console.log('waiting first 250ms for reset to take place');
        }, 250);
      }
      const queryParms = {...this.filterBase};
      queryParms['offset'] = event.first.toString();
      queryParms['rows'] = event.rows.toString();
      queryParms['sortOrder'] = event.sortOrder.toString();
      if (event.sortField) {
        queryParms['sortField'] = event.sortField.toString();
      } else {
        queryParms['sortField'] = 'nom';
      }
      if (this.booShowArchived) {
        queryParms['actif'] = '0';
      } else {
        queryParms['actif'] = '1';
      }
      if (this.duplicateFilter) {
        queryParms['duplicate'] = this.duplicateFilter;
      }
      if (this.booShowOrganisations && this.filteredOrganisation && this.filteredOrganisation.idDis != null) {
        queryParms['lienDis'] = this.filteredOrganisation.idDis;
      }
      if (event.filters) {
        if (event.filters.nom && event.filters.nom.value) {
          queryParms['nom'] = event.filters.nom.value;
        }
        if (event.filters.adresse && event.filters.adresse.value) {
          queryParms['adresse'] = event.filters.adresse.value;
        }
        if (event.filters.cp && event.filters.cp.value) {
          queryParms['cp'] = event.filters.cp.value;
        }
        if (event.filters.localite && event.filters.localite.value) {
          queryParms['localite'] = event.filters.localite.value;
        }
        if (event.filters.daten && event.filters.daten.value) {
          queryParms['daten'] = event.filters.daten.value;
        }
        if (event.filters.birb && event.filters.birb.value !== null) {
          queryParms['birb'] = event.filters.birb.value;
        }
        if (event.filters.coeff && event.filters.coeff.value !== null) {
          queryParms['coeff'] = event.filters.coeff.value;
        }
      }
      this.loadPageSubject$.next(queryParms);
    }
    else {

      const  myMessage = {
        severity: 'error',
        summary: 'Configuration',
        detail: $localize`:@@messageConfigurationError: Your login ${this.loggedInUserId} ${this.loggedInUserName}  with Org Id ${this.idOrg} has an invalid right ${this.loggedInUserRights} to access beneficiaries.`
      };
      this.messageService.add(myMessage);
      this.mailing.subject = 'Foodbanks - Configuration Error';
      this.mailing.from = 'contact@foodbanksit.be';
      this.mailing.to = 'alain.vandermeersch@gmail.com';
      this.mailing.bodyText = `login ${this.loggedInUserId} ${this.loggedInUserName}  was denied access to beneficiaries due to an invalid right ${this.loggedInUserRights}`
      this.mailingService.add(this.mailing)
          .subscribe((myMail: Mailing) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Creation',
              detail: $localize`:@@HelpDeskNotified:The Help Desk has been notified of the error.`
            });
            });
    }
  }
  changeDuplicatesFilter(value: any) {
    this.duplicateFilter = value;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
     // when we switch filter , we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (this.duplicateFilter ) {
      latestQueryParams['duplicate'] = this.duplicateFilter;
    } else {
      if (latestQueryParams.hasOwnProperty('duplicate')) {
        delete latestQueryParams['duplicate'];
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }
  private initializeDependingOnUserRights(authState: AuthState) {
    if (authState.user) {
      this.bankid = authState.banque.bankId;
      this.bankName = authState.banque.bankName;
      this.bankShortName = authState.banque.bankShortName;
      this.loggedInUserName = authState.user.userName;
      this.loggedInUserId = authState.user.idUser;
      this.loggedInUserRights = authState.user.rights

      switch (authState.user.rights) {
        case 'Bank':
        case 'Admin_Banq':
          this.booShowOrganisations = true;
          this.filterBase = { 'lienBanque': authState.banque.bankId};
          this.isValidConfig = true;
          // Only organisations can create beneficiaries
         // if  ((authState.user.rights === 'Admin_Banq') || (( authState.user.rights === 'Bank') && (authState.user.gestBen)))
          // { this.booCanCreate = true; }
          break;
        case 'Asso':
        case 'Admin_Asso':
          this.isValidConfig = true;
          this.filterBase = { 'lienDis': authState.organisation.idDis};
          this.idOrg = authState.organisation.idDis;
          if (!this.idOrg || this.idOrg === 0) {
            this.isValidConfig = false;
          }
          this.orgName = authState.organisation.idDis + ' ' + authState.organisation.societe;
          if  ((authState.user.rights === 'Admin_Asso') || (( authState.user.rights === 'Asso') && (authState.user.gestBen)))
          {
            this.booCanCreate = true;
          }
          this.organisationsService.getByKey(this.idOrg).subscribe(
              (org: Organisation) => {
                if (org) {
                  this.currentOrganisation = org;
                  this.summaryMessage = this.createSummaryText(false); // no need to show parents male or female
                }
              });
          break;
        case 'Admin_CPAS':
          this.isValidConfig = true;
          this.filterBase = { 'lienCpas': authState.user.lienCpas};
          this.lienCpas = authState.user.lienCpas;
          this.booShowOrganisations = true;
          break;
        default:
          this.filterBase = { 'lienBanque': 999};
      }
      if (this.loggedInUserId === 'avdmless') {
        this.isValidConfig = false;
        this.filterBase = { 'lienBanque': 999};
      }
    }
  }
  filterOrganisation(event ) {
    const  queryOrganisationParms: QueryParams = {};
    queryOrganisationParms['lienBanque'] = this.bankid.toString();
    if (this.lienCpas >0) {
        queryOrganisationParms['lienCpas'] = this.lienCpas.toString();
    }
    if (event.query.length > 0) {
      queryOrganisationParms['societeOrIdDis'] = event.query.toLowerCase();
    }
    this.orgsummaryService.getWithQuery(queryOrganisationParms)
        .subscribe(filteredOrganisations => {
          this.filteredOrganisations = this.filteredOrganisationsPrepend.concat(filteredOrganisations.map((organisation) =>
              Object.assign({}, organisation, {fullname: organisation.idDis + ' ' + organisation.societe})
          ));
        });
  }
  filterOrganisationBeneficiaries(idDis: number) {
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    latestQueryParams['offset'] = '0';
    // when we switch from active to archived list and vice versa , we need to restart from first page
    if (idDis != null) {
      latestQueryParams['lienDis'] = idDis;
    } else {
      if (latestQueryParams.hasOwnProperty('lienDis')) {
        delete latestQueryParams['lienDis'];
      }
    }
    this.loadPageSubject$.next(latestQueryParams);
  }
  changeArchiveFilter($event) {
    this.booShowArchived = $event.checked;
    this.first = 0;
    const latestQueryParams = {...this.loadPageSubject$.getValue()};
    // when we switch from active to archived list and vice versa , we need to restart from first page
    latestQueryParams['offset'] = '0';
    if (this.booShowArchived ) {
      latestQueryParams['actif'] = '0';
    } else {
      latestQueryParams['actif'] = '1';
    }
    this.loadPageSubject$.next(latestQueryParams);
  }


  exportAsXLSX(onlySelection:boolean): void {
    let excelQueryParams = {...this.loadPageSubject$.getValue()};
    let label ="";
    if (onlySelection) {
      delete excelQueryParams['rows'];
      delete excelQueryParams['offset'];
      delete excelQueryParams['sortOrder'];
      delete excelQueryParams['sortField'];
      label = "filtered.";

    }
    else {
      excelQueryParams = { 'actif':'1'};

      if(this.idOrg > 0) {
        excelQueryParams['lienDis'] = this.idOrg;
      }
      if(this.bankid > 0) {
        excelQueryParams['lienBanque'] = this.bankid;
      }
      if (this.lienCpas >0) {
        excelQueryParams['lienCpas'] = this.lienCpas.toString();
      }
    }
    let params = new URLSearchParams();
    for(let key in excelQueryParams){
      params.set(key, excelQueryParams[key])
    }
    this.beneficiaireHttpService.getBeneficiaireReport(this.authService.accessToken,  params.toString()).subscribe(
        (beneficiaires: any[] ) => {
          const cleanedList = [];
          let totalParents = 0;
          let totalDep = 0;
          let totalFamily = 0;
          let totalParentsMale = 0;
          let totalParentsFemale = 0;
          beneficiaires.map((item) => {
            let nbParents = 1;

            if (item.civilite === 1) {
                totalParentsMale++;
            }
            else {
                totalParentsFemale++;
            }
            if (item.nomconj) {
              nbParents =2;
              if (item.civiliteconj === 1) {
                totalParentsMale++;
              }
              else {
                totalParentsFemale++;
              }
            }
            totalParents += nbParents;
            totalDep += item.nbDep;
            totalFamily+= (item.nbDep +1);

            const cleanedItem = {};
            cleanedItem[$localize`:@@InternalId:Internal ID`] = item.idInt;
            cleanedItem[$localize`:@@Gender:Gender`] = labelCivilite(item.civilite);
            cleanedItem[$localize`:@@Name:Name`] = item.nom;
            cleanedItem[$localize`:@@FirstName:First Name`] = item.prenom;
            cleanedItem[$localize`:@@NamePartner:Name Partner`] = item.nomconj;
            cleanedItem[$localize`:@@FirstNamePartner:First Name Partner`] = item.prenomconj;
            cleanedItem[$localize`:@@Address:Address`] = item.adresse;
            cleanedItem[$localize`:@@ZipCode:Zip Code`] =item.cp;
            cleanedItem[$localize`:@@City:City`] =item.localite;
            cleanedItem[$localize`:@@Organisation:Organisation`] =item.societe;
            cleanedItem[$localize`:@@BirthDate:Birth Date`] =item.daten;
            cleanedItem[$localize`:@@Phone:Telephone`] =item.tel;
            cleanedItem[$localize`:@@Gsm:Gsm`] =item.gsm;
            cleanedItem[$localize`:@@Email:E-mail`] =item.email;
            if (this.idOrg === 0) {
              cleanedItem[$localize`:@@Coeff:Coeff`] = this.labelCoeff(item.coeff);
            }
            cleanedItem[$localize`:@@Parents:Parents`] =nbParents;
            cleanedItem[$localize`:@@Dependents:Dependents`] =item.nbDep;
            cleanedItem[$localize`:@@Family:Family`] =(item.nbDep + 1)
            cleanedList.push( cleanedItem);
          });
            cleanedList.push({}); // add empty line
            cleanedList.push( {[$localize`:@@Parents:Parents`]: totalParents, [$localize`:@@Dependents:Dependents`]: totalDep, [$localize`:@@Families:Families`]: totalFamily});

         if (this.currentOrganisation) {
          const summaryText = this.createSummaryText(true, totalParentsMale, totalParentsFemale);
           cleanedList.push({}); // add empty line
           cleanedList.push({[$localize`:@@InternalId:Internal ID`] : summaryText});
         }
          if (this.idOrg > 0) {
            this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.idOrg + '.beneficiaries.'  + label + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
          }
          else {
            this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.beneficiaries.'  + label + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
          }

          });
  }
  createSummaryText(booForExcel: boolean,totalParentsMale: number = 0, totalParentsFemale: number = 0): string
  { let summaryText = '';
   const labelFamilies = $localize`:@@Family:Family`;
   const labelBeneficiaries = $localize`:@@Beneficiaries:Beneficiaries`;
    const labelInfants = $localize`:@@Infants:Infants`;
    const labelBabies = $localize`:@@Babies:Babies`;
    const labelChildren = $localize`:@@Children:Children`;
    const labelTeenAgers = $localize`:@@TeenAgers:TeenAgers`;
    const labelYoungAdults = $localize`:@@YoungAdults:YoungAdults`;
    const labelAdults = $localize`:@@Adults:Adults`;
    const labelSeniors = $localize`:@@Seniors:Seniors`;
    const labelEquivalents = $localize`:@@Equivalents:Equivalents`;
    const nbOfAdtults = this.currentOrganisation.nPers - this.currentOrganisation.nNour - this.currentOrganisation.nBebe
        - this.currentOrganisation.nEnf - this.currentOrganisation.nAdo - this.currentOrganisation.n1824
        - this.currentOrganisation.nSen;
    summaryText = `${labelFamilies} : ${this.currentOrganisation.nFam} `
        + `${labelBeneficiaries} : ${this.currentOrganisation.nPers} `
    if (booForExcel) {
      const parentsLabelMale = $localize`:@@ParentsMale:Parents Male`;
      const parentsLabelFemale = $localize`:@@ParentsFemale:Parents Female`;
      summaryText += `${parentsLabelMale}: ${totalParentsMale}, ${parentsLabelFemale}: ${totalParentsFemale} `;
    }
    summaryText += `${labelInfants} : ${this.currentOrganisation.nNour} `
          + `${labelBabies} : ${this.currentOrganisation.nBebe} `
          + `${labelChildren} : ${this.currentOrganisation.nEnf} `
          + `${labelTeenAgers} : ${this.currentOrganisation.nAdo} `
          + `${labelYoungAdults} : ${this.currentOrganisation.n1824} `
          + `${labelAdults} : ${nbOfAdtults} `
          + `${labelSeniors} : ${this.currentOrganisation.nSen} `
          + `${labelEquivalents} : ${this.currentOrganisation.nEq}`
      ;

    return summaryText;
  }

  labelBirb(birb: number) {
    let birbLabel = "?"

    const indexItem = enmStatutFead.map(e => e.value).indexOf(birb);
    if (indexItem > -1) {
      birbLabel = enmStatutFead[indexItem ].label;
    }
    return birbLabel;
  }

  getFamilySize(beneficiaire: Beneficiaire) {
    return beneficiaire.nbDep + 1;
  }

  getDependentsTooltip() {
    return $localize`:@@BenefDependentsTooltip:This includes the beneficiary himself, eventually his partner, and his children`;
  }



  findDuplicatesTooltip() {
    return $localize`:@@BenefDuplicatesTooltip:try to find duplicate beneficiaries in the database`;
  }

  getCoeffTooltip() {
    return getCoeffTooltip();
  }

  labelCoeff(coeff: number) {
    return labelCoeff(coeff);
  }
  generateTooltipOrganisation() {
    return generateTooltipOrganisation();
  }
}
