import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
import {AuditChangeEntityService} from '../../../audits/services/auditChange-entity.service';
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
  userId: string;
  userName: string;
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
      private auditChangeEntityService: AuditChangeEntityService,
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
        this.donateursService.getByKey(don.donateurId)
            .subscribe(
                donateur => {
                  if (donateur != null) {
                    this.selectedDonateur = Object.assign({}, donateur, {fullname: donateur.nom + ' ' + donateur.prenom});
                 }
                });
      } else {
        this.don = new DefaultDon();
        this.don.lienBanque = this.lienBanque;
        if (this.myform) {
          this.myform.reset(this.don);
        }
      }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                this.lienBanque = authState.banque.bankId;
                this.userId= authState.user.idUser;
                this.userName = authState.user.membreNom + ' ' + authState.user.membrePrenom;
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
                  this.auditChangeEntityService.logDbChange(this.userId,this.userName,this.lienBanque,0,'Don',
                      don.donateurNom + ' ' + don.donateurPrenom, 'Delete' );
                },
                (dataserviceerrorFn: () => DataServiceError) => { 
                    const dataserviceerror = dataserviceerrorFn();
                    if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                    const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: `The don  ${don.donateurNom} ${don.donateurPrenom} could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                });
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
                this.auditChangeEntityService.logDbChange(this.userId,this.userName,this.lienBanque,0,'Don',
                    modifiedDon.donateurNom + ' ' + modifiedDon.donateurPrenom, 'Update' );
              },
              (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: `The don  ${modifiedDon.donateurNom} ${modifiedDon.donateurPrenom} could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {
      this.donsService.add(modifiedDon)
          .subscribe((newDon) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: `The don ${newDon.donateurNom} ${newDon.donateurPrenom}  has been created`
                });
                this.onDonCreate.emit(newDon);
                this.auditChangeEntityService.logDbChange(this.userId,this.userName,this.lienBanque,0,'Don',
                    newDon.donateurNom + ' ' + newDon.donateurPrenom, 'Create' );
              },
              (dataserviceerrorFn: () => DataServiceError) => { 
                const dataserviceerror = dataserviceerrorFn();
                if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
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
          this.onDonQuit.emit();
        }
      });
    } else {
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




