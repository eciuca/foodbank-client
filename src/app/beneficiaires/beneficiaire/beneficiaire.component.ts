import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-beneficiaire',
  templateUrl: './beneficiaire.component.html',
  styleUrls: ['./beneficiaire.component.css']
})
export class BeneficiaireComponent implements OnInit {
    @Input() idClient$: Observable<number>;
    @Input() currentFilteredOrgId: number;
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
    lienDis: number;
  constructor(
      private beneficiairesService: BeneficiaireEntityService,
      private cpassService: CpasEntityService,
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
      this.booIsOrganisation = false;
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
              console.log('we have a new default beneficiaire');
              if (this.booIsOrganisation === false) { // a bank can create beneficiaries of its own or beneficiaries for its organisations
                  if (this.currentFilteredOrgId != null && this.currentFilteredOrgId > 0) {
                      this.lienDis = this.currentFilteredOrgId;
                  } else {
                      this.lienDis = 0;
                  }
              }
          }
          });

      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  if (authState.user) {
                      switch (authState.user.rights) {
                          case 'Bank':
                              this.lienBanque = authState.banque.bankId;
                               break;
                          case 'Admin_Banq':
                              this.lienBanque = authState.banque.bankId;
                              this.booCanSave = true;
                              if (this.booCalledFromTable && this.beneficiaire.hasOwnProperty('idClient')) {
                                  this.booCanDelete = true;
                              }
                              break;
                          case 'Admin_Asso':
                          case 'Asso':
                              this.lienBanque = authState.banque.bankId;
                              this.lienDis = authState.user.idOrg;
                              this.booIsOrganisation = true;
                              if  (authState.user.rights === 'Admin_Asso') {
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
                const  myMessage = {severity: 'success', summary: 'Delete', detail: `The beneficiary ${beneficiaire.nom} ${beneficiaire.prenom} was deleted`};
                this.beneficiairesService.delete(beneficiaire)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onBeneficiaireDelete.emit(beneficiaire);
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
          this.messageService.add({severity: 'success', summary: 'Update', detail: `The beneficiary ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom}  was updated`});
            this.onBeneficiaireUpdate.emit(modifiedBeneficiaire);
        });
      } else {
          modifiedBeneficiaire.lbanque = this.lienBanque;
          modifiedBeneficiaire.lienDis = this.lienDis;
          console.log('Creating Beneficiaire with content:', modifiedBeneficiaire);
          this.beneficiairesService.add(modifiedBeneficiaire)
              .subscribe((newBeneficiaire) => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Creation',
                      detail: `The beneficiary ${newBeneficiaire.nom} ${newBeneficiaire.prenom}  was created`
                  });
                  this.onBeneficiaireCreate.emit(newBeneficiaire);
              });
      }

  }
    quit(event: Event, oldBeneficiaire: Beneficiaire, beneficiaireForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: 'Your changes may be lost. Are you sure that you want to proceed?',
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


}
