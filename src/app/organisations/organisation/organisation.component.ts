import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {OrganisationEntityService} from '../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable, combineLatest} from 'rxjs';
import {DefaultOrganisation, Organisation} from '../model/organisation';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmStatusCompany, enmGender, enmCountry} from '../../shared/enums';
import {NgForm} from '@angular/forms';
import {Cpas} from '../../cpass/model/cpas';
import {CpasEntityService} from '../../cpass/services/cpas-entity.service';
import {QueryParams} from '@ngrx/data';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';
import {DepotEntityService} from '../../depots/services/depot-entity.service';
import {Depot} from '../../depots/model/depot';

@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit {

  @Input() idDis$: Observable<number>;
    @Output() onOrganisationUpdate = new EventEmitter<Organisation>();
    @Output() onOrganisationDelete = new EventEmitter<Organisation>();
    @Output() onOrganisationQuit = new EventEmitter<Organisation>();
    booCalledFromTable: boolean;
    booCanSave: boolean;
    booCanDelete: boolean;
    booCanQuit: boolean;
  organisation: Organisation;
    selectedCpas: Cpas;
    filteredCpass: Cpas[];
    selectedDepot: Depot;
    filteredDepots: Depot[];
  genders: any[];
  statuts: any[];
  countries: any[];
  lienBanque: number;

  constructor(
      private organisationsService: OrganisationEntityService,
      private cpassService: CpasEntityService,
      private depotsService: DepotEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.statuts = enmStatusCompany;
      this.genders = enmGender;
      this.countries = enmCountry;
      this.booCalledFromTable = true;
      this.booCanDelete = false;
      this.booCanSave = false;
      this.booCanQuit = true;
      this.lienBanque = 0;
  }

  ngOnInit(): void {
// comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
      // or sometimes via a router link via the Main Menu
         if (!this.idDis$) {
          // we must come from the menu
          console.log('We initialize a new organisation object from the router!');
             this.booCalledFromTable = false;
             this.booCanQuit = false;
          this.idDis$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idDis')),
                  map(idDisString => Number(idDisString))
              );
      }
      const organisation$ = combineLatest([this.idDis$, this.organisationsService.entities$])
          .pipe(
              map(([idDis, organisations]) => organisations.find(organisation => idDis === organisation.idDis))
          );

      organisation$.subscribe(organisation => {
          if (organisation) {
              this.organisation = organisation;
              console.log('our organisation:',  this.organisation);
              this.cpassService.getByKey(organisation.lienCpas)
                  .subscribe(
                      cpas => {
                          if (cpas !== null) {
                              this.selectedCpas = {...cpas};
                              console.log('our organisation cpas:', this.selectedCpas);
                          } else {
                              console.log('There is no cpas for this organisation!');
                          }
                      });
              this.depotsService.getByKey(organisation.lienDepot)
                  .subscribe(
                      depot => {
                          if (depot !== null) {
                              this.selectedDepot = {...depot};
                              console.log('our organisation depot:', this.selectedDepot);
                          } else {
                              console.log('There is no depot for this organisation!');
                          }
                      });
          } else {
              this.organisation = new DefaultOrganisation();
              console.log('we have a new default organisation');
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
                              if (this.booCalledFromTable ) {
                                  this.booCanDelete = true;
                              }
                              break;
                          case 'Asso':
                              this.lienBanque = authState.banque.bankId;
                               break;
                          case 'Admin_Asso':
                              this.lienBanque = authState.banque.bankId;
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
  save(oldOrganisation: Organisation, organisationForm: Organisation) {
    const modifiedOrganisation = Object.assign({}, oldOrganisation, organisationForm);
      modifiedOrganisation.lienCpas = this.selectedCpas.cpasId;
      modifiedOrganisation.lienDepot = Number(this.selectedDepot.idDepot);
      if (modifiedOrganisation.hasOwnProperty('idDis')) {
          this.organisationsService.update(modifiedOrganisation)
              .subscribe( ()  => {
                  this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `Organisation ${modifiedOrganisation.societe} was updated`});
                  this.onOrganisationUpdate.emit(modifiedOrganisation);
              });
      } else {
          modifiedOrganisation.lienBanque = this.lienBanque;
          console.log('Creating Organisation with content:', modifiedOrganisation);
          this.organisationsService.add(modifiedOrganisation)
              .subscribe(() => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Creation',
                      detail: `Organisation ${modifiedOrganisation.societe} was created`
                  });
                  this.onOrganisationUpdate.emit(modifiedOrganisation);
              });
      }
  }
    delete(event: Event, organisation: Organisation) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `L' organisation ${organisation.societe} a été détruite`};
                this.organisationsService.delete(organisation)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onOrganisationDelete.emit();
                    });
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }
    quit(event: Event, oldOrganisation: Organisation, organisationForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: 'Your changes may be lost. Are you sure that you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    organisationForm.reset( oldOrganisation); // reset in-memory object for next open
                    console.log('We have reset the form to its original value');
                    this.onOrganisationQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onOrganisationQuit.emit();
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
    filterDepot(event ) {
        const  queryDepotParms: QueryParams = {};

        queryDepotParms['bankShortName'] = this.organisation.bankShortName;
        this.depotsService.getWithQuery(queryDepotParms)
            .subscribe(filteredDepots =>  this.filteredDepots = filteredDepots);
    }
}
