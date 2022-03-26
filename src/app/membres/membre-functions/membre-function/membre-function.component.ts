import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {DefaultMembreFunction, MembreFunction} from '../../model/membreFunction';
import {MembreFunctionEntityService} from '../../services/membreFunction-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {map} from 'rxjs/operators';
import {globalAuthState} from '../../../auth/auth.selectors';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-membreFunction',
  templateUrl: './membre-function.component.html',
  styleUrls: ['./membre-function.component.css']
})
export class MembreFunctionComponent implements OnInit {
  @ViewChild('membreFunctionForm') myform: NgForm;
  @Input() funcId$: Observable<number>;

  @Output() onMembreFunctionUpdate = new EventEmitter<MembreFunction>();
  @Output() onMembreFunctionCreate = new EventEmitter<MembreFunction>();
  @Output() onMembreFunctionDelete = new EventEmitter<MembreFunction>();
  @Output() onMembreFunctionQuit = new EventEmitter<MembreFunction>();
  membreFunction: MembreFunction;
  lienBanque: number;
  constructor(
      private membreFunctionsService: MembreFunctionEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
     this.lienBanque = 0;
  }

  ngOnInit(): void {


    const membreFunction$ = combineLatest([this.funcId$, this.membreFunctionsService.entities$])
        .pipe(
            map(([funcId, membreFunctions]) => membreFunctions.find(membreFunction => membreFunction['funcId'] === funcId))
        );
    membreFunction$.subscribe(membreFunction => {
      if (membreFunction) {
        this.membreFunction = membreFunction;
        console.log('our membreFunction:', this.membreFunction);
      } else {
        this.membreFunction = new DefaultMembreFunction();
        this.membreFunction.lienBanque = this.lienBanque;
        if (this.myform) {
          this.myform.reset(this.membreFunction);
        }
        console.log('we have a new default membreFunction');
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

  delete(event: Event, membreFunction: MembreFunction) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const myMessage = {
          severity: 'success',
          summary: 'Delete',
          detail: `The membreFunction  has been deleted`
        };
        this.membreFunctionsService.delete(membreFunction)
            .subscribe(() => {
                  this.messageService.add(myMessage);
                  this.onMembreFunctionDelete.emit(membreFunction);
                },
                (dataserviceerror: DataServiceError) => {
                  console.log('Error deleting contact', dataserviceerror.message);
                  const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: `The membreFunction could not be deleted: error: ${dataserviceerror.message}`,
                    life: 6000 };
                  this.messageService.add(errMessage) ;
                });
      },
      reject: () => {
        console.log('We do nothing');
      }
    });
  }

  save(oldMembreFunction: MembreFunction, membreFunctionForm: MembreFunction) {
    const modifiedMembreFunction = Object.assign({}, oldMembreFunction, membreFunctionForm);

    if (modifiedMembreFunction.hasOwnProperty('funcId')) {
      this.membreFunctionsService.update(modifiedMembreFunction)
          .subscribe(() => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Update',
                  detail: `The membreFunction  was updated`
                });
                this.onMembreFunctionUpdate.emit(modifiedMembreFunction);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error updating contact', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: `The membreFunction could not be updated: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    } else {
      modifiedMembreFunction.lienBanque = this.lienBanque;
      console.log('Creating MembreFunction with content:', modifiedMembreFunction);
      this.membreFunctionsService.add(modifiedMembreFunction)
          .subscribe((newMembreFunction) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Creation',
                  detail: `The  membreFunction  has been created`
                });
                this.onMembreFunctionCreate.emit(newMembreFunction);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error creating contact', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: `The  membreFunction could not be created: error: ${dataserviceerror.message}`,
                  life: 6000 };
                this.messageService.add(errMessage) ;
              });
    }

  }

  quit(event: Event, oldMembreFunction: MembreFunction, membreFunctionForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          membreFunctionForm.reset(oldMembreFunction); // reset in-memory object for next open
          console.log('We have reset the contact form to its original value');
          this.onMembreFunctionQuit.emit();
        },
        reject: () => {
          console.log('We do nothing');
        }
      });
    } else {
      console.log('Form is not dirty, closing');
      this.onMembreFunctionQuit.emit();
    }
  }
}

