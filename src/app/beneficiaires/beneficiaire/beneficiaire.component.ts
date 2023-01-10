import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BeneficiaireEntityService} from '../services/beneficiaire-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {Beneficiaire, DefaultBeneficiaire} from '../model/beneficiaire';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmCountry, enmGender, enmStatutFead, enmSupplyDay} from '../../shared/enums';
import {NgForm} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {combineLatest, Observable} from 'rxjs';
import {Cpas} from '../../cpass/model/cpas';
import {CpasEntityService} from '../../cpass/services/cpas-entity.service';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {Organisation} from '../../organisations/model/organisation';
import {AuditChangeEntityService} from '../../audits/services/auditChange-entity.service';
import {Dependent} from '../model/dependent';
import {DependentEntityService} from '../services/dependent-entity.service';
import * as moment from 'moment';

@Component({
  selector: 'app-beneficiaire',
  templateUrl: './beneficiaire.component.html',
  styleUrls: ['./beneficiaire.component.css']
})
export class BeneficiaireComponent implements OnInit {
    readonly povertyRevenueSingleBeneficiary = 1262;
    readonly povertyRevenueDependentAdult= 630;
    readonly povertyRevenueDependentChild = 379;
    readonly povertyRevenueIndexDate = '25/6/2021';
    @ViewChild('beneficiaireForm') myform: NgForm;
    @Input() idClient$: Observable<number>;
    @Input() currentFilteredOrg: Organisation;
    @Output() onBeneficiaireUpdate = new EventEmitter<Beneficiaire>();
    @Output() onBeneficiaireCreate = new EventEmitter<Beneficiaire>();
    @Output() onBeneficiaireDelete = new EventEmitter<Beneficiaire>();
    @Output() onBeneficiaireQuit = new EventEmitter<Beneficiaire>();
    beneficiaire: Beneficiaire;
    booIsOrganisation: boolean;
    selectedCpas: Cpas;
    filteredCpass: Cpas[];
    booCalledFromTable: boolean;
    booCanSave: boolean;
    civilites: any[];
    countries: any[];
    feadStatuses: any[];
    lienBanque: number;
    idCompany: string;
    lienDis: number;
    lienDepot: number;
    orgName: string;
    depotName: string;
    title: string;
    userId: string;
    userName: string;
    dependentQuery: any;
    dependents: Dependent[];
    nbAdults: number;
    nbChildren: number;
    povertyIndex: number;
  constructor(
      private beneficiairesService: BeneficiaireEntityService,
      private dependentService: DependentEntityService,
      private cpassService: CpasEntityService,
      private auditChangeEntityService: AuditChangeEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.civilites =  enmGender;
    this.countries = enmCountry;
    this.feadStatuses = enmStatutFead;
      this.booCalledFromTable = true;
      this.booCanSave = false;
      this.lienDis = 0;
      this.lienBanque = 0;
      this.idCompany = '';
      this.booIsOrganisation = false;
      this.lienDepot = 0;
      this.depotName = '';
      this.title = '';
      this.dependentQuery = {};
  }

  ngOnInit(): void {


      const beneficiaire$ = combineLatest([this.idClient$, this.beneficiairesService.entities$])
          .pipe(
              map(([idClient, beneficiaires]) => beneficiaires.find(beneficiaire => beneficiaire['idClient'] === idClient))
          );
      beneficiaire$.subscribe(beneficiaire => {
          this.povertyIndex = 0;

          if (beneficiaire) {
              this.beneficiaire = beneficiaire;

              this.title = $localize`:@@OrgBeneficiaryExisting:Beneficiary for organisation ${beneficiaire.societe} Updated On ${ beneficiaire.dateUpd}`;
              if (beneficiaire.lcpas && beneficiaire.lcpas !== 0) {
                  this.cpassService.getByKey(beneficiaire.lcpas)
                      .subscribe(
                          cpas => {
                              if (cpas !== null) {
                                  this.selectedCpas = {...cpas};
                               }
                          });
              }
              this.dependentQuery['lienMast'] = this.beneficiaire.idClient;
              this.dependentQuery['actif'] = '1';
              this.dependentService.getWithQuery(this.dependentQuery)
                  .subscribe(loadedDependents => {
                      console.log('Initial Loaded dependents: ' + loadedDependents.length);
                      this.dependents = loadedDependents;
                      this.setPovertyIndex();

                  });
          } else {
              this.beneficiaire = new DefaultBeneficiaire();
              this.dependents = [];
              this.beneficiaire.lbanque = this.lienBanque;
              if (this.lienDis > 0 && this.lienDepot === 0) {
                  // handle organisation beneficiaires
                  this.beneficiaire.lienDis = this.lienDis;
                  this.title = $localize`:@@OrgBeneficiaryNew1:New Beneficiary for organisation ${this.orgName} `;
              } else {
                  // tslint:disable-next-line:max-line-length
                  if (this.currentFilteredOrg != null && this.currentFilteredOrg.idDis != null && this.currentFilteredOrg.idDis > 0) {
                      // create beneficiaire from bank admin beneficiaire or depot admin beneficiaire
                      this.beneficiaire.lienDis = this.currentFilteredOrg.idDis;
                      if (this.currentFilteredOrg.societe === 'Depot') {
                          this.title = $localize`:@@OrgBeneficiaryNewC:New Beneficiary for organisation  ${this.depotName}`;
                      } else {
                          // tslint:disable-next-line:max-line-length
                          this.title = $localize`:@@OrgBeneficiaryNewA:New Beneficiary for organisation  ${this.currentFilteredOrg.societe}`;
                      }
                  }  else {
                      if (this.lienDepot > 0) {
                          this.beneficiaire.lienDis = this.lienDepot;
                          this.title =  $localize`:@@OrgBeneficiaryNewB:New Beneficiary for organisation  ${this.depotName}`;
                      } else {
                          // must be bank
                          this.title =  $localize`:@@BankBeneficiaryNew1:New Beneficiary for bank ${this.idCompany} `;
                      }
                  }
              }
              if (this.myform) {
                  this.myform.reset(this.beneficiaire);
              }

          }
          });

      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  if (authState.user) {
                      this.userId= authState.user.idUser;
                      this.userName = authState.user.membreNom + ' ' + authState.user.membrePrenom;
                      switch (authState.user.rights) {
                          case 'Admin_Banq':
                          case 'Bank':
                              this.lienBanque = authState.banque.bankId;
                              this.idCompany = authState.banque.bankShortName;
                              if  ((authState.user.rights === 'Admin_Banq') || (( authState.user.rights === 'Bank') && (authState.user.gestBen))) {
                                  this.booCanSave = true;
                              }
                              break;
                          case 'Admin_Asso':
                          case 'Asso':
                              this.lienBanque = authState.banque.bankId;
                              this.lienDis = authState.user.idOrg;
                              this.orgName = authState.organisation.societe;
                              if (authState.organisation.depyN === true) {
                                  this.lienDepot = authState.organisation.idDis;
                                  this.depotName = authState.organisation.societe;
                              }
                              this.booIsOrganisation = true;
                              if  ((authState.user.rights === 'Admin_Asso') || (( authState.user.rights === 'Asso') && (authState.user.gestBen))) {
                                  this.booCanSave = true;
                              }
                              break;
                          default:
                      }
                  }
              })
          )
          .subscribe();
  }

    delete(event: Event, beneficiaire: Beneficiaire) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success',
                    summary: 'Delete',
                    detail: $localize`:@@messageBeneficiaryDeleted:The beneficiary ${beneficiaire.nom} ${beneficiaire.prenom} was deleted`
                };
                this.beneficiairesService.delete(beneficiaire)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onBeneficiaireDelete.emit(beneficiaire);
                            this.auditChangeEntityService.logDbChange(this.userId,this.userName,beneficiaire.lbanque,beneficiaire.lienDis,'Client',
                                beneficiaire.nom + ' ' + beneficiaire.prenom, 'Update' );
                    },
                        (dataserviceerrorFn: () => DataServiceError) => { 
                            const dataserviceerror = dataserviceerrorFn();
                            if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                            const  errMessage = {severity: 'error', summary: 'Delete',
                                // tslint:disable-next-line:max-line-length
                                detail: $localize`:@@messageBeneficiaryDeleteError:The beneficiary  ${beneficiaire.nom} ${beneficiaire.prenom} could not be deleted: error: ${dataserviceerror.message}`,
                                life: 6000 };
                            this.messageService.add(errMessage) ;
                        });
            }
        });
    }

  save(oldBeneficiaire: Beneficiaire, beneficiaireForm: Beneficiaire) {
    const modifiedBeneficiaire = Object.assign({}, oldBeneficiaire, beneficiaireForm);
      if (this.selectedCpas) {
          modifiedBeneficiaire.lcpas = this.selectedCpas.cpasId;
      }
      if (modifiedBeneficiaire.hasOwnProperty('idClient')) {
    this.beneficiairesService.update(modifiedBeneficiaire)
        .subscribe( ()  => {
          this.messageService.add({
              severity: 'success',
              summary: 'Update',
              detail: $localize`:@@messageBeneficiaryUpdated:The beneficiary ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom}  was updated`});
            this.onBeneficiaireUpdate.emit(modifiedBeneficiaire);
            this.auditChangeEntityService.logDbChange(this.userId,this.userName,modifiedBeneficiaire.lbanque,modifiedBeneficiaire.lienDis,'Client',
                    modifiedBeneficiaire.nom + ' ' + modifiedBeneficiaire.prenom, 'Update' );
        },
            (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
               const  errMessage = {severity: 'error', summary: 'Update',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageBeneficiaryUpdateError:The beneficiary  ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom} could not be updated: error: ${dataserviceerror.message}`,
                    life: 6000 };
                this.messageService.add(errMessage) ;
        });
      } else {
          this.beneficiairesService.add(modifiedBeneficiaire)
              .subscribe(() => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Creation',
                      detail: $localize`:@@messageBeneficiaryCreated:The beneficiary ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom}  was created`
                  });
                  this.onBeneficiaireCreate.emit(modifiedBeneficiaire);
                      this.auditChangeEntityService.logDbChange(this.userId,this.userName,modifiedBeneficiaire.lbanque,modifiedBeneficiaire.lienDis,'Client',
                          modifiedBeneficiaire.nom + ' ' + modifiedBeneficiaire.prenom, 'Create' );
              },
                  (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                     const  errMessage = {severity: 'error', summary: 'Create',
                          // tslint:disable-next-line:max-line-length
                          detail: $localize`:@@messageBeneficiaryCreateError:The beneficiary  ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom} could not be created: error: ${dataserviceerror.message}`,
                          life: 6000 };
                      this.messageService.add(errMessage) ;
                  });
      }

  }
    quit(event: Event, oldBeneficiaire: Beneficiaire, beneficiaireForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    beneficiaireForm.reset(oldBeneficiaire); // reset in-memory object for next open
                    this.onBeneficiaireQuit.emit();
                }
            });
        } else {
            this.onBeneficiaireQuit.emit();
        }
    }
    filterCpas(event ) {
        const  queryCpasParms: QueryParams = {};
        const query = event.query;
        queryCpasParms['offset'] = '0';
        queryCpasParms['rows'] = '10';
        queryCpasParms['sortField'] = 'cpasName';
        queryCpasParms['sortOrder'] = '1';
        queryCpasParms['searchField'] = 'cpasName';
        queryCpasParms['searchValue'] = query.toLowerCase();
        this.cpassService.getWithQuery(queryCpasParms)
            .subscribe(filteredCpass =>  this.filteredCpass = filteredCpass);
        }


    getBeneficiaryTitle(): string {
        return this.title;
    }
    generateTooltipRightsBankUsers() {
           return $localize`:@@BenefRightsBankUsers:Bank Users can only modify Beneficiary Suspician Coefficient and delete Duplicates who have a suspicion coefficient > 1`;
    }
    setPovertyIndex() {
      this.povertyIndex = this.povertyRevenueSingleBeneficiary;
        this.nbAdults = 0;
      if (this.beneficiaire.nomconj) {
            this.nbAdults = 1;
      }
        this.nbChildren = 0;
        this.dependents.forEach( (dependent) => {
            const dayDifference = - moment(dependent.datenais, 'DD/MM/YYYY').diff(moment(),'days');
            console.log('dayDifference', dayDifference);
            if (dayDifference < 6205) { // 6205 days = 17 years old
                this.nbChildren++;
                this.povertyIndex += this.povertyRevenueDependentChild;
            }
            else {
                this.nbAdults++;
                this.povertyIndex += this.povertyRevenueDependentAdult;
            }
        });

    }
    getPovertyIndex() {
        return $localize`:@@povertyIndex:Poverty Index: ${this.povertyIndex}`;
    }

    getPovertyIndexTooltip(): string {
        return $localize`:@@povertyIndexTooltip:Poverty Index is calculated for ${this.nbAdults} Adult Dependents and ${this.nbChildren} Children based on the rates updated on 25/06/2021`;

    }
}
