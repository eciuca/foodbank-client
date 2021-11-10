import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {DefaultDon, Don} from '../../model/don';
import {DonEntityService} from '../../services/don-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmCountry} from '../../../shared/enums';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {NgForm} from '@angular/forms';
import {Donateur} from '../../model/donateur';
import {DonateurEntityService} from '../../services/donateur-entity.service';

@Component({
  selector: 'app-don',
  templateUrl: './don.component.html',
  styleUrls: ['./don.component.css']
})
export class DonComponent implements OnInit {
  @ViewChild('donForm') myform: NgForm;
  @Input() idDon$: Observable<number>;
  selectedDonateur: Donateur;
  filteredDonateurs: Donateur[];
  filterDonateurBase: any;
  lienBanque: number;
  @Output() onDonUpdate = new EventEmitter<Don>();
  @Output() onDonCreate = new EventEmitter<Don>();
  @Output() onDonDelete = new EventEmitter<Don>();
  @Output() onDonQuit = new EventEmitter<Don>();
  don: Don;
  booCanSave: boolean;
  booCanDelete: boolean;
  booCanQuit: boolean;
  countries: any[];
  constructor(
      private donsService: DonEntityService,
      private donateursService: DonateurEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.countries = enmCountry;
    this.booCanDelete = false;
    this.booCanSave = false;
    this.booCanQuit = true;
    this.lienBanque = 0;
  }

  ngOnInit(): void {
    const don$ = combineLatest([this.idDon$, this.donsService.entities$])
        .pipe(
            map(([idDon, dons]) => dons.find(don => don['idDon'] === idDon))
        );
    don$.subscribe(don => {
      if (don) {
        this.don = don;
        console.log('our don:', this.don);
        this.donateursService.getByKey(don.donateurId)
            .subscribe(
                donateur => {
                  if (donateur != null) {
                    this.selectedDonateur = Object.assign({}, donateur, {fullname: donateur.nom + ' ' + donateur.prenom});
                    console.log('our don donateur:', this.selectedDonateur);
                  } else {
                    console.log('There is no donateur for this don!');
                  }
                });
      } else {
        this.don = new DefaultDon();
        this.don.lienBanque = this.lienBanque;
        if (this.myform) {
          this.myform.reset(this.don);
        }
        console.log('we have a new default don');
      }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                this.lienBanque = authState.banque.bankId;
                this.filterDonateurBase = { 'lienBanque': authState.banque.bankId};
                switch (authState.user.rights) {
                  case 'Bank':
                    break;
                  case 'Admin_Banq':
                    this.booCanSave = true;
                    this.booCanDelete = true;
                    break;
                  default:
                }
              }
            })
        )
        .subscribe();
  }

  delete(event: Event, don: Don) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Delete',
          detail: `The don ${don.donateurNom} ${don.donateurPrenom} has been deleted`
        };
        this.donsService.delete(don)
            .subscribe(() => {
                  this.messageService.add(myMessage);
                  this.onDonDelete.emit(don);
                },
                (dataserviceerror: DataServiceError) => {
                  console.log('Error deleting don', dataserviceerror.message);
                  const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: `The don  ${don.donateurNom} ${don.donateurPrenom} could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                });
      },
      reject: () => {
        console.log('We do nothing');
      }
    });
  }

  save(oldDon: Don, donForm: Don) {
    const modifiedDon = Object.assign({}, oldDon, donForm);
    modifiedDon.dateEntered = '';
    modifiedDon.donateurId = this.selectedDonateur.donateurId;
    modifiedDon.donateurNom = this.selectedDonateur.nom;
    modifiedDon.donateurPrenom = this.selectedDonateur.prenom;
    if (modifiedDon.hasOwnProperty('idDon')) {
      this.donsService.update(modifiedDon)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update',
                  detail: `The don ${modifiedDon.donateurNom} ${modifiedDon.donateurPrenom}  was updated`
                });
                this.onDonUpdate.emit(modifiedDon);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error updating don', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: `The don  ${modifiedDon.donateurNom} ${modifiedDon.donateurPrenom} could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {

      console.log('Creating Don with content:', modifiedDon);
      this.donsService.add(modifiedDon)
          .subscribe((newDon) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: `The don ${newDon.donateurNom} ${newDon.donateurPrenom}  has been created`
                });
                this.onDonCreate.emit(newDon);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error creating don', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: `The don  ${modifiedDon.donateurNom} ${modifiedDon.donateurPrenom} could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    }

  }

  quit(event: Event, oldDon: Don, donForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          donForm.reset(oldDon); // reset in-memory object for next open
          console.log('We have reset the don form to its original value');
          this.onDonQuit.emit();
        },
        reject: () => {
          console.log('We do nothing');
        }
      });
    } else {
      console.log('Form is not dirty, closing');
      this.onDonQuit.emit();
    }
  }
  filterDonateur(event ) {
    const  queryDonateurParms = {...this.filterDonateurBase};

    const query = event.query;
    queryDonateurParms['offset'] = '0';
    queryDonateurParms['rows'] = '10';
    queryDonateurParms['sortField'] = 'nom';
    queryDonateurParms['sortOrder'] = '1';
    queryDonateurParms['nom'] = query.toLowerCase();
    this.donateursService.getWithQuery(queryDonateurParms)
        .subscribe(filteredDonateurs => {
          this.filteredDonateurs = filteredDonateurs.map((donateur) =>
              Object.assign({}, donateur, {fullname: donateur.nom + ' ' + donateur.prenom})
          );
        });
  }
}




