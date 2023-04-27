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
      } else {
        this.membreEmploiType = new DefaultMembreEmploiType();
        this.membreEmploiType.lienBanque = this.lienBanque;
        if (this.myform) {
          this.myform.reset(this.membreEmploiType);
        }
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
                ( dataserviceerror) => { 
                 
                 
                   const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageJobTypeDeleteError:The job type could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                });
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
              ( dataserviceerror) => { 
                 
                 
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageJobTypeUpdateError:The job type could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {
      modifiedmembreEmploiType.lienBanque = this.lienBanque;
      this.membreEmploiTypesService.add(modifiedmembreEmploiType)
          .subscribe((newmembreEmploiType) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: $localize`:@@messageJobTypeCreated:The job type was created`
                });
                this.onMembreEmploiTypeCreate.emit(newmembreEmploiType);
              },
              ( dataserviceerror) => { 
                 
                 
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
          this.onMembreEmploiTypeQuit.emit();
        }
      });
    } else {
        this.onMembreEmploiTypeQuit.emit();
    }
  }
}


