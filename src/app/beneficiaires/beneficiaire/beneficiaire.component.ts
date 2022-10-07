import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {BeneficiaireEntityService} from '../services/beneficiaire-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {Beneficiaire, DefaultBeneficiaire} from '../model/beneficiaire';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmGender, enmCountry, enmStatutFead} from '../../shared/enums';
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

@Component({
  selector: 'app-beneficiaire',
  templateUrl: './beneficiaire.component.html',
  styleUrls: ['./beneficiaire.component.css']
})
export class BeneficiaireComponent implements OnInit {
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
    booCanDelete: boolean;
    booCanQuit: boolean;
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
  constructor(
      private beneficiairesService: BeneficiaireEntityService,
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
      this.booCanDelete = false;
      this.booCanSave = false;
      this.booCanQuit = true;
      this.lienDis = 0;
      this.lienBanque = 0;
      this.idCompany = '';
      this.booIsOrganisation = false;
      this.lienDepot = 0;
      this.depotName = '';
      this.title = '';
  }

  ngOnInit(): void {

      if (!this.idClient$) {
          // we must come from the menu
          console.log('We initialize a new beneficiaire object from the router!');
          this.booCalledFromTable = false;
          this.booCanQuit = false;
          this.idClient$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idClient')),
                  map(idClient => Number(idClient))
              );
      }
      const beneficiaire$ = combineLatest([this.idClient$, this.beneficiairesService.entities$])
          .pipe(
              map(([idClient, beneficiaires]) => beneficiaires.find(beneficiaire => beneficiaire['idClient'] === idClient))
          );
      beneficiaire$.subscribe(beneficiaire => {
          if (beneficiaire) {
              this.beneficiaire = beneficiaire;
              this.title = $localize`:@@OrgBeneficiaryExisting:Beneficiary for organisation ${beneficiaire.societe} Updated On ${ beneficiaire.dateUpd}`;
              console.log('our beneficiaire:',  this.beneficiaire);
              if (beneficiaire.lcpas && beneficiaire.lcpas !== 0) {
                  this.cpassService.getByKey(beneficiaire.lcpas)
                      .subscribe(
                          cpas => {
                              if (cpas !== null) {
                                  this.selectedCpas = {...cpas};
                                  console.log('our beneficiaire cpas:', this.selectedCpas);
                              } else {
                                  console.log('There is no cpas for this beneficiaire!');
                              }
                          },
                          (dataserviceerror: DataServiceError) => {
                              console.log('Could not retrieve Cpas with id:', beneficiaire.lcpas);
                          });
              }
          } else {
              this.beneficiaire = new DefaultBeneficiaire();
              this.beneficiaire.lbanque = this.lienBanque;
              if (this.lienDis > 0 && this.lienDepot === 0) {
                  // handle organisation beneficiaires
                  this.beneficiaire.lienDis = this.lienDis;
                  this.title = $localize`:@@OrgBeneficiaryNew1:New Beneficiary for organisation ${this.orgName} `;
              } else {
                  // tslint:disable-next-line:max-line-length
                  if (this.currentFilteredOrg != null && this.currentFilteredOrg.idDis != null && this.currentFilteredOrg.idDis > 0) {
                      // create beneficiaire from bank admin beneficiaire or depot admin beneficiaire
                      console.log ('Our CurrentFilteredOrg from Bank Or Depot:', this.currentFilteredOrg)
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
                                  if (this.booCalledFromTable && this.beneficiaire.hasOwnProperty('idClient')) {
                                      this.booCanDelete = true;
                                  }
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
                                  if (this.booCalledFromTable) {
                                      this.booCanDelete = true;
                                  }
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
                        (dataserviceerror: DataServiceError) => {
                            console.log('Error deleting beneficiary', dataserviceerror.message);
                            const  errMessage = {severity: 'error', summary: 'Delete',
                                // tslint:disable-next-line:max-line-length
                                detail: $localize`:@@messageBeneficiaryDeleteError:The beneficiary  ${beneficiaire.nom} ${beneficiaire.prenom} could not be deleted: error: ${dataserviceerror.message}`,
                                life: 6000 };
                            this.messageService.add(errMessage) ;
                        });
            },
            reject: () => {
                console.log('We do nothing');
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
            (dataserviceerror: DataServiceError) => {
                console.log('Error updating beneficiary', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageBeneficiaryUpdateError:The beneficiary  ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom} could not be updated: error: ${dataserviceerror.message}`,
                    life: 6000 };
                this.messageService.add(errMessage) ;
        });
      } else {
          console.log('Creating Beneficiaire with content:', modifiedBeneficiaire);
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
                  (dataserviceerror: DataServiceError) => {
                      console.log('Error updating beneficiary', dataserviceerror.message);
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
                    console.log('We have reset the beneficiaire form to its original value');
                    this.onBeneficiaireQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
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
}
