import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {OrganisationEntityService} from '../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap} from 'rxjs/operators';
import {Observable, combineLatest} from 'rxjs';
import {DefaultOrganisation, Organisation} from '../model/organisation';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmStatusCompany, enmGender, enmCountry, enmOrgActivities} from '../../shared/enums';
import {NgForm} from '@angular/forms';
import {Cpas} from '../../cpass/model/cpas';
import {CpasEntityService} from '../../cpass/services/cpas-entity.service';
import {DataServiceError, QueryParams} from '@ngrx/data';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {globalAuthState} from '../../auth/auth.selectors';

@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit {
    @ViewChild('organisationForm') myform: NgForm;
  @Input() idDis$: Observable<number>;
    @Output() onOrganisationUpdate = new EventEmitter<Organisation>();
    @Output() onOrganisationCreate = new EventEmitter<Organisation>();
    @Output() onOrganisationDelete = new EventEmitter<Organisation>();
    @Output() onOrganisationQuit = new EventEmitter<Organisation>();
    booCalledFromTable: boolean;
    booCanSave: boolean;
    booCanDelete: boolean;
    booCanQuit: boolean;
  organisation: Organisation;
    selectedCpas: Cpas;
    filteredCpass: Cpas[];
    genders: any[];
    statuts: any[];
    countries: any[];
    orgActivities: any[];
   lienBanque: number;
    userName: string;
    gestBen: boolean;

  constructor(
      private organisationsService: OrganisationEntityService,
      private cpassService: CpasEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.statuts = enmStatusCompany;
      this.genders = enmGender;
      this.countries = enmCountry;
      this.orgActivities = enmOrgActivities;
      this.booCalledFromTable = true;
      this.booCanDelete = false;
      this.booCanSave = false;
      this.booCanQuit = true;
      this.lienBanque = 0;
      this.userName = '' ;
      this.gestBen = false;
  }

  ngOnInit(): void {
// comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
      // or sometimes via a router link via the Main Menu
      let organisation$: Observable<Organisation>;
      if (!this.idDis$) {
          // we must come from the menu
          console.log('We initialize a new organisation object from the router!');
             this.booCalledFromTable = false;
             this.booCanQuit = false;
          organisation$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idDis')),
                  map(idDisString => Number(idDisString)),
                switchMap(idDis => this.organisationsService.getByKey(idDis))
             );
      } else {
          organisation$ = combineLatest([this.idDis$, this.organisationsService.entities$])
              .pipe(
                  map(([idDis, organisations]) => organisations.find(organisation => idDis === organisation.idDis))
              );
      }
      organisation$.subscribe(organisation => {
          if (organisation) {
              this.organisation = organisation;
              if (this.organisation.lienCpas != null && this.organisation.lienCpas !== 0  ) {
                  this.cpassService.getByKey(this.organisation.lienCpas)
                      .subscribe(
                          cpas => {
                              if (cpas !== null) {
                                  this.selectedCpas = {...cpas};
                                  console.log('our organisation cpas:', this.selectedCpas);
                              } else {
                                  console.log('There is no cpas for this organisation!');
                              }
                          });
              }
          } else {
              this.organisation = new DefaultOrganisation();
              if (this.myform) {
                  this.myform.reset(this.organisation);
              }
              this.selectedCpas = null;
              console.log('we have a new default organisation');
          }
      });
      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  if (authState.user) {
                      this.userName = authState.user.userName;
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
                          case 'Admin_Asso':
                              this.booCanSave = true;
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
    if (this.selectedCpas) {
        modifiedOrganisation.lienCpas = this.selectedCpas.cpasId;
    }
    modifiedOrganisation.lupdUserName = this.userName;
      if (modifiedOrganisation.hasOwnProperty('idDis')) {
          console.log('Modifying Organisation with content:', modifiedOrganisation);
          this.organisationsService.update(modifiedOrganisation)
              .subscribe( ()  => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Update',
                      detail: $localize`:@@messageOrganisationUpdated:Organisation ${modifiedOrganisation.societe} was updated`
                  });
                  this.onOrganisationUpdate.emit(modifiedOrganisation);
              },
                  (dataserviceerror: DataServiceError) => {
                      console.log('Error updating organisation', dataserviceerror.message);
                      const  errMessage = {severity: 'error', summary: 'Update',
                          // tslint:disable-next-line:max-line-length
                          detail: $localize`:@@messageOrganisationUpdateError:The organisation ${modifiedOrganisation.societe} could not be updated: error: ${dataserviceerror.message}`,
                          life: 6000 };
                      this.messageService.add(errMessage) ;
              });
      } else {
          modifiedOrganisation.lienBanque = this.lienBanque;
          console.log('Creating Organisation with content:', modifiedOrganisation);
          this.organisationsService.add(modifiedOrganisation)
              .subscribe((newOrganisation) => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Creation',
                      detail: $localize`:@@messageOrganisationCreated:Organisation ${newOrganisation.societe} was created`
                  });
                  this.onOrganisationCreate.emit(newOrganisation);
              },
                  (dataserviceerror: DataServiceError) => {
                      console.log('Error creating organisation', dataserviceerror.message);
                      const  errMessage = {severity: 'error', summary: 'Creation',
                          // tslint:disable-next-line:max-line-length
                          detail: $localize`:@@messageOrganisationCreateError:The organisation ${modifiedOrganisation.societe} could not be created: error: ${dataserviceerror.message}`,
                          life: 6000 };
                      this.messageService.add(errMessage) ;
                  });
      }
  }
    delete(event: Event, organisation: Organisation) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {
                    severity: 'success',
                    summary: 'Delete',
                    detail: $localize`:@@messageOrganisationDeleted:Organisation ${organisation.societe} was deleted`};
                this.organisationsService.delete(organisation)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onOrganisationDelete.emit();
                    },
                        (dataserviceerror: DataServiceError) => {
                            console.log('Error deleting organisation', dataserviceerror.message);
                            const  errMessage = {severity: 'error', summary: 'Delete',
                                // tslint:disable-next-line:max-line-length
                                detail: $localize`:@@messageOrganisationDeleteError:The organisation ${organisation.idDis} ${organisation.societe} could not be deleted: error: ${dataserviceerror.message}`,
                                life: 6000 };
                            this.messageService.add(errMessage) ;
                        }
                    );
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
                message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
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
}
