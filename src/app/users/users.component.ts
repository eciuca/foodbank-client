import {Component, OnInit} from '@angular/core';
import {filter, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {User} from './model/user';
import {UserEntityService} from './services/user-entity.service';
import {Router} from '@angular/router';
import {globalAuthState, isLoggedIn} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {enmLanguage, enmLanguageLegacy, enmUserRoles, enmUserRolesAsso, enmUserRolesBankAsso, enmYn} from '../shared/enums';
import {QueryParams} from '@ngrx/data';
import {OrgSummaryEntityService} from '../organisations/services/orgsummary-entity.service';
import {BanqueEntityService} from '../banques/services/banque-entity.service';
import {ExcelService} from '../services/excel.service';
import {AuthService} from '../auth/auth.service';
import {UserHttpService} from './services/user-http.service';
import {formatDate} from '@angular/common';
import {labelActive, labelRights,generateTooltipOrganisation} from '../shared/functions';
import {MembreEntityService} from '../membres/services/membre-entity.service';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedIdUser$ = new BehaviorSubject(null);
  users: User[];
  totalRecords: number;
  loading: boolean;
  filterBase: any;
  booShowArchived: boolean;
  anomaliesOptions: any[];
  displayDialog: boolean;
  booCanCreate: boolean;
  rightOptions: any[];
  languageOptions: any[];
  filteredOrganisation: any;
  filteredOrganisations: any[];
  filteredOrganisationsPrepend: any[];
  bankid: number;
  bankName: string;
  bankShortName: string;
  filteredBankId: number;
  filteredBankShortName: string;
  first: number;
  booShowOrganisations: boolean;
  booIsAdmin: boolean;
    depotIdDis: number;
    depotName: string;
    bankOptions: any[];
    YNOptions:  any[];
    idOrg: number;
    orgName: string;
    anomalyFilter: any;
    organisationFilterId: any; // default null

  constructor(private userService: UserEntityService,
              private membreService: MembreEntityService,
              private banqueService: BanqueEntityService,
              private orgsummaryService: OrgSummaryEntityService,
              private authService: AuthService,
              private excelService: ExcelService,
              private router: Router,
              private store: Store<AppState>,
              private userHttpService: UserHttpService
  ) {
      this.booCanCreate = false;
      this.booShowArchived = false;
      this.anomaliesOptions = [
          {label: ' ', value: null },
          {label: $localize`:@@UserAnomalyNoMember:User is not associated with a Member`, value: '1'},
          {label: $localize`:@@UserAnomalyWrongUserName:User Name differs from Member Name`, value: '2'},
          {label: $localize`:@@UserAnomalyWrongUserEmail:User Email differs from Member Email`, value: '3'},
          {label: $localize`:@@UserAnomalyDifferentBank:User Bank differs from Member Bank`, value: '4'}
      ];
      this.rightOptions = enmUserRolesBankAsso;
      this.languageOptions = enmLanguageLegacy;
      this.bankid = 0;
      this.bankName = '';
      this.bankShortName = '';
      this.depotIdDis = 0;
      this.depotName = '';
      this.first = 0;
      this.booShowOrganisations = false;
      this.booIsAdmin = false;
      this.orgName = '';
      this.idOrg = 0;
      this.YNOptions = enmYn;
      this.organisationFilterId = null;
  }

  ngOnInit() {
      this.reload();

      this.loadPageSubject$
        .pipe(
          filter(queryParams => !!queryParams),
          mergeMap(queryParams => this.userService.getWithQuery(queryParams))
          )
        .subscribe(loadedUsers => {
          console.log('Loaded users from nextpage: ' + loadedUsers.length);
          if (loadedUsers.length > 0) {
               this.totalRecords = loadedUsers[0].totalRecords;
           }  else {
              this.totalRecords = 0;
          }
          this.users  = loadedUsers;
          this.loading = false;
          this.userService.setLoaded(true);
        });
  }

  reload() {
      this.loading = true;
      this.totalRecords = 0;

      this.store
        .pipe(
            select(globalAuthState),
            filter(authState => authState.isLoggedIn)
        ).subscribe((authState) => {
           if (authState.banque && authState.user.rights !== 'admin' && authState.user.rights !== 'Admin_FEAD'
              && authState.user.rights !== 'Admin_FBBA' && authState.user.rights !== 'Bank_FBBA' ) {
              this.bankid = authState.banque.bankId;
              this.bankName = authState.banque.bankName;
              this.bankShortName = authState.banque.bankShortName;
          }

                switch (authState.user.rights) {
                    case 'Bank':
                    case 'Admin_Banq':
                        this.booShowOrganisations = true;
                        this.filterBase = {'idCompany': authState.banque.bankShortName};
                        this.rightOptions = enmUserRolesBankAsso;
                        if (authState.user.rights === 'Admin_Banq') {
                            this.booCanCreate = true;
                        }
                        this.filteredOrganisationsPrepend = [
                            {idDis: null, fullname: $localize`:@@All:All` },
                            {idDis: 0, fullname: $localize`:@@bank:Bank` },
                            {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
                        ];
                        this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
                        break;
                    case 'Asso':
                    case 'Admin_Asso':
                        if (authState.organisation && authState.organisation.depyN === true) {
                            this.booShowOrganisations = true;
                            this.depotIdDis = authState.organisation.idDis;
                            this.depotName = authState.organisation.societe;
                            this.filteredOrganisationsPrepend = [
                                {idDis: null, fullname: 'Depot' },
                                {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
                            ];
                            this.filteredOrganisation = this.filteredOrganisationsPrepend[0];
                        } else {
                            this.filterBase = {'idOrg': authState.organisation.idDis};
                            this.orgName = authState.organisation.societe;
                            this.idOrg = authState.organisation.idDis;
                        }
                        this.rightOptions = enmUserRolesAsso;
                        if (authState.user.rights === 'Admin_Asso') {
                            this.booCanCreate = true;
                        }
                        break;
                    case 'admin':
                    case 'Admin_FBBA':
                    case 'Bank_FBBA':
                        if (authState.user.rights != 'Bank_FBBA' ) {
                            this.booIsAdmin = true;
                        }
                        this.booShowOrganisations = true;
                        this.rightOptions = enmUserRoles;
                        this.filteredOrganisationsPrepend = [
                            {idDis: null, fullname: $localize`:@@All:All` },
                            {idDis: 0, fullname: $localize`:@@banks:Banks` },
                            {idDis: 999, fullname: $localize`:@@organisations:Organisations` },
                        ];
                        if (authState.user.rights === 'admin') {
                            this.filterBase = { };
                            this.banqueService.getAll()
                                .subscribe( banquesEntities => {
                                    const bankOptionsPrepend = [{'label': '???', 'value': 999}];
                                    this.bankOptions = bankOptionsPrepend.concat(banquesEntities.map(({
                                                                                                          bankShortName,
                                                                                                          bankId
                                                                                                      }) => ({
                                        'label': bankShortName,
                                        'value': bankId
                                    })));
                                });
                        }
                        else {
                            this.filterBase = { 'classicBanks': '1'};
                            const classicBanks = { 'classicBanks': '1' };
                            this.banqueService.getWithQuery(classicBanks).subscribe(
                                banquesEntities => {
                                    this.bankOptions  = banquesEntities.map(({bankShortName, bankId}) => ({
                                        'label': bankShortName,
                                        'value': bankId
                                    }));
                                });

                        }
                        break;
                    default:
                        console.log('Entering Users component with unsupported user rights, see complete authstate:', authState);
                        this.filterBase = {'lienBanque': 999};
                }

        });

  }
  handleSelect(user) {
      this.displayDialog = true;
      this.selectedIdUser$.next(user.idUser);
  }
    showDialogToAdd() {
        this.selectedIdUser$.next('new');
        this.displayDialog = true;
    }
  handleUserQuit() {
    this.displayDialog = false;
  }

  handleUserUpdate(updatedUser) {
    const index = this.users.findIndex(user => user.idUser === updatedUser.idUser);
    this.users[index] = updatedUser;
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }
    handleUserCreate(createdUser: User) {
        this.users.push({...createdUser});
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

  handleUserDeleted(deletedUser) {
    const index = this.users.findIndex(user => user.idUser === deletedUser.idUser);
    this.users.splice(index, 1);
    const latestQueryParams = this.loadPageSubject$.getValue();
    this.loadPageSubject$.next(latestQueryParams);
    this.displayDialog = false;
  }

 nextPage(event: LazyLoadEvent) {
      this.store
        .pipe(
            select(isLoggedIn),
            filter(isLoggedIn => isLoggedIn))
        .subscribe(_ => {
            this.loading = true;
            const queryParms = {...this.filterBase};
            queryParms['offset'] = event.first.toString();
            queryParms['rows'] = event.rows.toString();
            queryParms['sortOrder'] = event.sortOrder.toString();
            if (event.sortField) {
                queryParms['sortField'] = event.sortField.toString();
            } else {
                queryParms['sortField'] =  'idUser';
            }
            if (this.booShowOrganisations) {
                if (this.depotIdDis != 0) {
                    // we are logged in as a user of a depot
                    switch (this.organisationFilterId) {
                        case 999: // members of all organisations depending of depot
                            queryParms['lienDepot'] = this.depotIdDis;
                            break;
                        case null: // members of depot
                            queryParms['idOrg'] = this.depotIdDis;
                            break;
                        default:    // members of a specific organisation
                            queryParms['idOrg'] = this.organisationFilterId;
                    }
                } else {
                    // we are logged in as a user of a bank
                    switch (this.organisationFilterId) {
                        case 999: // members of all organisations depending of bank
                            queryParms['idOrg'] = 999;
                            break;
                        case null: // all members of bank
                            break;
                        default:    // members of a specific organisation
                            queryParms['idOrg'] = this.organisationFilterId;
                    }
                }
            }
            if (this.booShowArchived ) {
                queryParms['actif'] = '0';
            }  else {
                queryParms['actif'] = '1';
            }
            if (this.anomalyFilter ) {
                queryParms['hasAnomalies'] = this.anomalyFilter;
            }
            if (event.filters) {
                if (event.filters.idUser && event.filters.idUser.value) {
                    queryParms['idUser'] =  event.filters.idUser.value;
                }
                if (event.filters.userName && event.filters.userName.value) {
                    queryParms['userName'] = event.filters.userName.value;
                }
                if (event.filters.idLanguage && event.filters.idLanguage.value) {
                        queryParms['idLanguage'] = event.filters.idLanguage.value;
                }
                if (event.filters.email && event.filters.email.value) {
                        queryParms['email'] = event.filters.email.value;
                }
                if (event.filters.rights && event.filters.rights.value) {
                        queryParms['rights'] = event.filters.rights.value;
                }
                if (event.filters.hasLogins && event.filters.hasLogins.value !== null ) {
                    queryParms['hasLogins'] = event.filters.hasLogins.value;
                }
                if (event.filters.bankId && event.filters.bankId.value) {
                    this.filteredBankId= event.filters.bankId.value;
                    this.filteredBankShortName = this.bankOptions.find(obj => obj.value === this.filteredBankId).label;
                    queryParms['idCompany'] =this.filteredBankShortName
                 } else {
                    this.filteredBankId = null;
                    this.filteredBankShortName = null;
                }
            }

            this.loadPageSubject$.next(queryParms);
        })
     ;
  }

    filterOrganisation(event ) {
        const  queryOrganisationParms: QueryParams = {};
        queryOrganisationParms['actif'] = '1';
        if (this.bankOptions) {
            if (this.filteredBankId) {
                queryOrganisationParms['lienBanque'] = this.filteredBankId.toString();
            } else {
                if (queryOrganisationParms.hasOwnProperty('lienBanque')) {
                    delete queryOrganisationParms['lienBanque'];
                }
            }
        }
        else {
        if (this.depotIdDis === 0) {
                queryOrganisationParms['lienBanque'] = this.bankid.toString();
            }  else {
                queryOrganisationParms['lienDepot'] = this.depotIdDis.toString();
            }
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
    setOrganisationFilters(idDis: number,latestQueryParams: any) {
        this.organisationFilterId =idDis;
        let newQueryParams = {...latestQueryParams};
        if (this.depotIdDis != 0) {
            // we are logged in as a user of a depot
            switch(idDis) {
                case 999: // members of all organisations depending of depot
                    newQueryParams['lienDepot'] = this.depotIdDis;
                    if (newQueryParams.hasOwnProperty('idOrg')) {
                        delete newQueryParams['idOrg'];
                    }
                    break;
                case null: // members of depot
                    newQueryParams['idOrg'] = this.depotIdDis;
                    if (newQueryParams.hasOwnProperty('lienDepot')) {
                        delete newQueryParams['lienDepot'];
                    }
                    break;
                default:    // members of a specific organisation
                    newQueryParams['idOrg'] = idDis;
                    if (newQueryParams.hasOwnProperty('lienDepot')) {
                        delete newQueryParams['lienDepot'];
                    }
            }
        }
        else {
            // we are logged in as a user of a bank
            switch(idDis) {
                case 999: // members of all organisations depending of bank
                    newQueryParams['idOrg'] = 999;
                    break;
                case null: // all members of bank
                    if (newQueryParams.hasOwnProperty('idOrg')) {
                        delete newQueryParams['idOrg'];
                    }
                    break;
                default:    // members of a specific organisation
                    newQueryParams['idOrg'] = idDis;
            }
        }
        return newQueryParams;
    }
    filterOrganisationUsers(idDis: number) {
        this.first = 0;
        const latestQueryParams = this.setOrganisationFilters(idDis,{...this.loadPageSubject$.getValue()});
        latestQueryParams['offset'] = '0';

        this.loadPageSubject$.next(latestQueryParams);
    }

    labelRights(rights: string) {
        return labelRights(rights);

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
    changeAnomaliesFilter(value: any) {
       this.anomalyFilter = value;
        this.first = 0;
        const latestQueryParams = {...this.loadPageSubject$.getValue()};
       // when we switch from active to archived list and vice versa , we need to restart from first page
        latestQueryParams['offset'] = '0';
        if (this.anomalyFilter ) {
            latestQueryParams['hasAnomalies'] = this.anomalyFilter;
        } else {
            if (latestQueryParams.hasOwnProperty('hasAnomalies')) {
                delete latestQueryParams['hasAnomalies'];
            }
        }
        this.loadPageSubject$.next(latestQueryParams);
    }
    getTitle(): string {
        if ( this.depotName) {
            if (this.booShowArchived) {
                return $localize`:@@DepotUsersTitleArchive:Archived Users of depot ${this.depotName} `;
            } else {
                return $localize`:@@DepotUsersTitleActive:Active Users of depot ${this.depotName} `;
            }
        } else if ( this.orgName) {
            if (this.booShowArchived) {
                return $localize`:@@OrgUsersTitleArchive:Archived Users of organisation ${this.orgName} `;
            } else {
                return $localize`:@@OrgUsersTitleActive:Active Users of organisation ${this.orgName} `;
            }
        } else if ( this.bankName) {
            if (this.booShowArchived) {
                return $localize`:@@BankUsersTitleArchive:Archived Users of bank ${this.bankName} `;
            } else {
                return $localize`:@@BankUsersTitleActive:Active Users of bank ${this.bankName} `;
            }
        } else {
            if (this.booShowArchived) {
                return $localize`:@@AllUsersTitleArchive:Archived Users `;
            } else {
                return $localize`:@@AllUsersTitleActive:Active Users  `;
            }
        }
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
            if (!this.bankOptions) {
                excelQueryParams['lienBanque'] = this.bankid;
            }
            if(this.idOrg > 0) {
                excelQueryParams['lienDis'] = this.idOrg;
            }
            if(this.depotIdDis > 0) {
                excelQueryParams['lienDepot'] = this.depotIdDis;
            }

        }
        let params = new URLSearchParams();
        for(let key in excelQueryParams){
            params.set(key, excelQueryParams[key])
        }
        this.userHttpService.getUserReport(this.authService.accessToken,  params.toString()).subscribe(
        (users: any[]) => {
            const cleanedList = [];
            users.map((item) => {
                const cleanedItem = {};
                if (this.bankOptions) {
                    cleanedItem[$localize`:@@Bank:Bank`] =item.idCompany;
                }
                cleanedItem['idUser'] =item.idUser;
                cleanedItem[$localize`:@@Name:Name`] =item.userName;
                cleanedItem[$localize`:@@Organisation:Organisation`] =item.societe;
                cleanedItem[$localize`:@@Language:Language`] =item.idLanguage;
                cleanedItem[$localize`:@@Rights:Rights`] = labelRights(item.rights);
                cleanedItem['email'] =item.email;
                cleanedList.push( cleanedItem);
            });
            if (this.idOrg > 0) {
                this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.idOrg + '.users.' + label + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
            }
            else {
                if (!this.bankOptions) {
                    this.excelService.exportAsExcelFile(cleanedList, 'foodit.' + this.bankShortName + '.users.' + label + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
                } else {
                    this.excelService.exportAsExcelFile(cleanedList, 'foodit.users.' + label + formatDate(new Date(), 'ddMMyyyy.HHmm', 'en-US') + '.xlsx');
                }
            }
        });
    }

    generateToolTipMessageForUserAnomalies (user:User) {
      let message:string = '';

      if (!user.membreNom) {
          message = $localize`:@@ToolTipUserAnomalyMissingMember:No Member Assigned to User`;
          return message;
      }
        const memberFullname = (user.membreNom + ' ' + user.membrePrenom).trim().replace( /[^0-9a-z]/gi , '');
        const userName = user.userName.trim().replace(/[^0-9a-z]/gi , '');
        if (user.userName != (user.membreNom + ' ' + user.membrePrenom)) {
            if (userName != memberFullname) {
                message += $localize`:@@ToolTipUserAnomalyDifferentMemberName:User Name '${user.userName}' differs from Member Name '${user.membreNom} ${user.membrePrenom}'. `;
            }
            else {
                message += $localize`:@@ToolTipUserAnomalyDifferentMemberNameLight:User Name '${user.userName}' differs from Member Name '${user.membreNom} ${user.membrePrenom}' only by blanks or special characters. `;
            }
        }
        if (user.email != user.membreEmail) {
            message += $localize`:@@ToolTipUserAnomalyDifferentMemberEmail:User Email '${user.email}' differs from Member Email '${user.membreEmail}'`;
        }
        if (user.actif == true && user.membreActif == false) {
             message += $localize`:@@ToolTipUserAnomalyDifferentMemberActif:User points to Archived Member !!!'`;
        }
        if (user.idCompany != user.membreBankShortname) {
            message += $localize`:@@ToolTipUserAnomalyDifferentMemberBank:User Bank '${user.idCompany}' differs from Member Bank '${user.membreBankShortname}'`;
        }
        const userLanguageObj  = enmLanguageLegacy.find(obj => obj.value === user.idLanguage);
        const userLanguage = userLanguageObj ? userLanguageObj.label : 'unknown';
        const memberLanguageObj  = enmLanguage.find(obj => obj.value === user.membreLangue);
        const memberLanguage = memberLanguageObj ? memberLanguageObj.label : 'unknown';
        if (userLanguage != memberLanguage ) {
            message += $localize`:@@ToolTipUserAnomalyDifferentLanguage:User Language '${userLanguage}' differs from Member Language '${memberLanguage}'`;

        }
        if (this.bankOptions) {
            const bankOptionForLienBanque = this.bankOptions.find(obj => obj.value === user.lienBanque);
            const idCompanyFromLienBanque = bankOptionForLienBanque ? bankOptionForLienBanque.label : 'unknown';
            if (idCompanyFromLienBanque != user.idCompany) {
                message += $localize`:@@ToolTipUserAnomalyDifferentLienBanque:lien_banque field in t_user table '${user.lienBanque}' meaning bank ${idCompanyFromLienBanque} differs from User Bank '${user.idCompany}'`;

            }
        }
        if (message ==='') {
            message = $localize`:@@ToolTipUserOK:Click here to view or change user details.`;
        }
      return message;
    }
    hasUserAnomalies(user:User) {
        if (!user.membreNom) return true;
        if (user.userName != (user.membreNom + ' ' + user.membrePrenom)) return true;
        if (user.email != user.membreEmail) return true;
        if (user.actif != user.membreActif) return true;
        if (user.idCompany != user.membreBankShortname) return true;
        if (this.bankOptions) {
            const bankOptionForLienBanque = this.bankOptions.find(obj => obj.value === user.lienBanque);
            const idCompanyFromLienBanque = bankOptionForLienBanque ? bankOptionForLienBanque.label : 'unknown';
            if (idCompanyFromLienBanque != user.idCompany) return true;
        }
        const userLanguageObj  = enmLanguageLegacy.find(obj => obj.value === user.idLanguage);
        const userLanguage = userLanguageObj ? userLanguageObj.label : 'unknown';
        const memberLanguageObj  = enmLanguage.find(obj => obj.value === user.membreLangue);
        const memberLanguage = memberLanguageObj ? memberLanguageObj.label : 'unknown';
        return userLanguage != memberLanguage;
    }
    generateLoginTooltip() {
        return $localize`:@@ToolTipNbLogins:Nb Of Logins since 2021`;
    }
    generateTooltipOrganisation() {
        return generateTooltipOrganisation();
    }
}
