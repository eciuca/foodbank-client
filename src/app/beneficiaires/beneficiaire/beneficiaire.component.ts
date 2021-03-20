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
import {QueryParams} from '@ngrx/data';

@Component({
  selector: 'app-beneficiaire',
  templateUrl: './beneficiaire.component.html',
  styleUrls: ['./beneficiaire.component.css']
})
export class BeneficiaireComponent implements OnInit {
    @Input() idClient$: Observable<number>;
    @Output() onBeneficiaireUpdate = new EventEmitter<Beneficiaire>();
    @Output() onBeneficiaireDelete = new EventEmitter<Beneficiaire>();
    @Output() onBeneficiaireQuit = new EventEmitter<Beneficiaire>();
    beneficiaire: Beneficiaire;
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
              this.cpassService.getByKey(beneficiaire.lcpas)
                  .subscribe(
                      cpas => {
                          if (cpas !== null) {
                              this.selectedCpas = {...cpas};
                              console.log('our beneficiaire cpas:', this.selectedCpas);
                          } else {
                              console.log('There is no cpas for this beneficiaire!');
                          }
                      });
          } else {
              this.beneficiaire = new DefaultBeneficiaire();
              console.log('we have a new default beneficiaire');
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
                          case 'Asso':
                              this.lienBanque = authState.banque.bankId;
                              this.lienDis = authState.user.idOrg;
                              break;
                          case 'Admin_Asso':
                              this.lienBanque = authState.banque.bankId;
                              this.lienDis = authState.user.idOrg;
                              this.booCanSave = true;
                              if (this.booCalledFromTable) {
                                  this.booCanDelete = true;
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
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `Le bénéficiaire ${beneficiaire.nom} ${beneficiaire.prenom} a été détruit`};
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
      modifiedBeneficiaire.lcpas = this.selectedCpas.cpasId;
      if (modifiedBeneficiaire.hasOwnProperty('idClient')) {
    this.beneficiairesService.update(modifiedBeneficiaire)
        .subscribe( ()  => {
          this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `Le bénéficiaire ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom}  a été modifié`});
            this.onBeneficiaireUpdate.emit(modifiedBeneficiaire);
        });
      } else {
          modifiedBeneficiaire.lbanque = this.lienBanque;
          modifiedBeneficiaire.lienDis = this.lienDis;
          console.log('Creating Beneficiaire with content:', modifiedBeneficiaire);
          this.beneficiairesService.add(modifiedBeneficiaire)
              .subscribe(() => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Création',
                      detail: `Le beneficiaire ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom}  a été créé`
                  });
                  this.onBeneficiaireUpdate.emit(modifiedBeneficiaire);
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
