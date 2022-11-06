import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DefaultDonateur, Donateur} from '../../model/donateur';
import {DonateurEntityService} from '../../services/donateur-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmCountry} from '../../../shared/enums';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-donateur',
  templateUrl: './donateur.component.html',
  styleUrls: ['./donateur.component.css']
})
export class DonateurComponent implements OnInit {
  @ViewChild('donateurForm') myform: NgForm;
  @Input() donateurId$: Observable<number>;
  lienBanque: number;
  @Output() onDonateurUpdate = new EventEmitter<Donateur>();
  @Output() onDonateurCreate = new EventEmitter<Donateur>();
  @Output() onDonateurDelete = new EventEmitter<Donateur>();
  @Output() onDonateurQuit = new EventEmitter<Donateur>();
  donateur: Donateur;
  booCanSave: boolean;
  booCanDelete: boolean;
  booCanQuit: boolean;
  countries: any[];
  constructor(
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
     const donateur$ = combineLatest([this.donateurId$, this.donateursService.entities$])
        .pipe(
            map(([donateurId, donateurs]) => donateurs.find(donateur => donateur['donateurId'] === donateurId))
        );
    donateur$.subscribe(donateur => {
      if (donateur) {
        this.donateur = donateur;
        console.log('our donateur:', this.donateur);
      } else {
        this.donateur = new DefaultDonateur();
        if (this.myform) {
          this.myform.reset(this.donateur);
        }
        console.log('we have a new default donateur');
      }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                this.lienBanque = authState.banque.bankId;
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

  delete(event: Event, donateur: Donateur) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Delete',
          detail: `The donateur ${donateur.nom} ${donateur.prenom} has been deleted`
        };
        this.donateursService.delete(donateur)
            .subscribe(() => {
                  this.messageService.add(myMessage);
                  this.onDonateurDelete.emit(donateur);
                },
                (dataserviceerror: DataServiceError) => {
                  console.log('Error deleting donateur', dataserviceerror.message);
                  const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: `The donateur  ${donateur.nom} ${donateur.prenom} could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                });
      },
      reject: () => {
        console.log('We do nothing');
      }
    });
  }

  save(oldDonateur: Donateur, donateurForm: Donateur) {
    const modifiedDonateur = Object.assign({}, oldDonateur, donateurForm);

    if (modifiedDonateur.hasOwnProperty('donateurId')) {
      this.donateursService.update(modifiedDonateur)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update',
                  detail: `The donateur ${modifiedDonateur.nom} ${modifiedDonateur.prenom}  was updated`
                });
                this.onDonateurUpdate.emit(modifiedDonateur);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error updating donateur', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: `The donateur  ${modifiedDonateur.nom} ${modifiedDonateur.prenom} could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {
      modifiedDonateur.lienBanque = this.lienBanque;
      console.log('Creating Donateur with content:', modifiedDonateur);
      this.donateursService.add(modifiedDonateur)
          .subscribe((newDonateur) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: `The donateur ${newDonateur.nom} ${newDonateur.prenom}  has been created`
                });
                this.onDonateurCreate.emit(newDonateur);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error creating donateur', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: `The donateur  ${modifiedDonateur.nom} ${modifiedDonateur.prenom} could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    }

  }

  quit(event: Event, oldDonateur: Donateur, donateurForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          donateurForm.reset(oldDonateur); // reset in-memory object for next open
          console.log('We have reset the donateur form to its original value');
          this.onDonateurQuit.emit();
        },
        reject: () => {
          console.log('We do nothing');
        }
      });
    } else {
      console.log('Form is not dirty, closing');
      this.onDonateurQuit.emit();
    }
  }
}



