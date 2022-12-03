import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DefaultMembreEmploiType, MembreEmploiType} from '../../model/membreEmploiType';
import {MembreEmploiTypeEntityService} from '../../services/membreEmploiType-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-membreEmploiType',
  templateUrl: './membre-emploitype.component.html',
  styleUrls: ['./membre-emploitype.component.css']
})
export class MembreEmploiTypeComponent implements OnInit {
  @ViewChild('membreEmploiTypeForm') myform: NgForm;
  @Input() jobNr$: Observable<number>;

  @Output() onMembreEmploiTypeUpdate = new EventEmitter<MembreEmploiType>();
  @Output() onMembreEmploiTypeCreate = new EventEmitter<MembreEmploiType>();
  @Output() onMembreEmploiTypeDelete = new EventEmitter<MembreEmploiType>();
  @Output() onMembreEmploiTypeQuit = new EventEmitter<MembreEmploiType>();
  membreEmploiType: MembreEmploiType;
  lienBanque: number;
  constructor(
      private membreEmploiTypesService: MembreEmploiTypeEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.lienBanque = 0;
  }

  ngOnInit(): void {


    const membreEmploiType$ = combineLatest([this.jobNr$, this.membreEmploiTypesService.entities$])
        .pipe(
            map(([jobNr, membreEmploiTypes]) => membreEmploiTypes.find(membreEmploiType => membreEmploiType['jobNr'] === jobNr))
        );
    membreEmploiType$.subscribe(membreEmploiType => {
      if (membreEmploiType) {
        this.membreEmploiType = membreEmploiType;
        console.log('our membreEmploiType:', this.membreEmploiType);
      } else {
        this.membreEmploiType = new DefaultMembreEmploiType();
        this.membreEmploiType.lienBanque = this.lienBanque;
        if (this.myform) {
          this.myform.reset(this.membreEmploiType);
        }
        console.log('we have a new default membreEmploiType');
      }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              this.lienBanque= authState.banque.bankId;
            })
        )
        .subscribe();
  }

  delete(event: Event, membreEmploiType: MembreEmploiType) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Delete',
          detail: $localize`:@@messageJobTypeDeleted:The job type was deleted`
        };
        this.membreEmploiTypesService.delete(membreEmploiType)
            .subscribe(() => {
                  this.messageService.add(myMessage);
                  this.onMembreEmploiTypeDelete.emit(membreEmploiType);
                },
                (dataserviceerrorFn: () => DataServiceError) => { 
 const dataserviceerror = dataserviceerrorFn(); 
 if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                  console.log('Error deleting contact', dataserviceerror.message);
                  const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageJobTypeDeleteError:The job type could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                });
      },
      reject: () => {
        console.log('We do nothing');
      }
    });
  }

  save(oldmembreEmploiType: MembreEmploiType, membreEmploiTypeForm: MembreEmploiType) {
    const modifiedmembreEmploiType = Object.assign({}, oldmembreEmploiType, membreEmploiTypeForm);

    if (modifiedmembreEmploiType.hasOwnProperty('jobNr')) {
      this.membreEmploiTypesService.update(modifiedmembreEmploiType)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update',
                  detail: $localize`:@@messageJobTypeUpdated:The job type was updated`
                });
                this.onMembreEmploiTypeUpdate.emit(modifiedmembreEmploiType);
              },
              (dataserviceerrorFn: () => DataServiceError) => { 
 const dataserviceerror = dataserviceerrorFn(); 
 if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                console.log('Error updating contact', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageJobTypeUpdateError:The job type could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {
      modifiedmembreEmploiType.lienBanque = this.lienBanque;
      console.log('Creating membreEmploiType with content:', modifiedmembreEmploiType);
      this.membreEmploiTypesService.add(modifiedmembreEmploiType)
          .subscribe((newmembreEmploiType) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: $localize`:@@messageJobTypeCreated:The job type was created`
                });
                this.onMembreEmploiTypeCreate.emit(newmembreEmploiType);
              },
              (dataserviceerrorFn: () => DataServiceError) => { 
 const dataserviceerror = dataserviceerrorFn(); 
 if (!dataserviceerror.message) { dataserviceerror.message = dataserviceerror.error().message }
                console.log('Error creating contact', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageJobTypeCreateError:The job type could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    }

  }

  quit(event: Event, oldmembreEmploiType: MembreEmploiType, membreEmploiTypeForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          membreEmploiTypeForm.reset(oldmembreEmploiType); // reset in-memory object for next open
          console.log('We have reset the contact form to its original value');
          this.onMembreEmploiTypeQuit.emit();
        },
        reject: () => {
          console.log('We do nothing');
        }
      });
    } else {
      console.log('Form is not dirty, closing');
      this.onMembreEmploiTypeQuit.emit();
    }
  }
}


