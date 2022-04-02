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
  bankShortName: string;
  isGlobalAdmin: boolean;
  booCanUpdate: boolean;
  constructor(
      private membreFunctionsService: MembreFunctionEntityService,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.isGlobalAdmin = false;
    this.lienBanque = 0;
    this.bankShortName = '???';
    this.booCanUpdate = false;

  }

  ngOnInit(): void {


    const membreFunction$ = combineLatest([this.funcId$, this.membreFunctionsService.entities$])
        .pipe(
            map(([funcId, membreFunctions]) => membreFunctions.find(membreFunction => membreFunction['funcId'] === funcId))
        );
    membreFunction$.subscribe(membreFunction => {
      if (membreFunction) {
        this.membreFunction = membreFunction;
        this.booCanUpdate = false;
        if((this.membreFunction.lienBanque == 0) && this.isGlobalAdmin) {
          this.booCanUpdate = true;
        }
        if((this.membreFunction.lienBanque > 0) && (this.isGlobalAdmin == false)) {
          this.booCanUpdate = true;
        }
        console.log('our membreFunction:', this.membreFunction);
      } else {
        this.membreFunction = new DefaultMembreFunction();
        this.membreFunction.lienBanque = this.lienBanque;
        if (this.myform) {
          this.myform.reset(this.membreFunction);
        }
        this.booCanUpdate = true;
        console.log('we have a new default membreFunction');
      }
    });

    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user.rights == 'admin') {
                this.isGlobalAdmin = true;
              }
              if (authState.user.rights == 'Admin_Banq') {
                this.bankShortName = authState.banque.bankShortName;
                this.lienBanque = authState.banque.bankId;
              }
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
          detail: $localize`:@@messageFunctionDeleted:The function was deleted`
        };
        this.membreFunctionsService.delete(membreFunction)
            .subscribe(() => {
                  this.messageService.add(myMessage);
                  this.onMembreFunctionDelete.emit(membreFunction);
                },
                (dataserviceerror: DataServiceError) => {
                   const  errMessage = {severity: 'error', summary: 'Delete',
                    // tslint:disable-next-line:max-line-length
                    detail: $localize`:@@messageFunctionDeleteError:The function could not be deleted: error: ${dataserviceerror.message}`,
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
                  detail: $localize`:@@messageFunctionUpdated:The function was updated`
                });
                this.onMembreFunctionUpdate.emit(modifiedMembreFunction);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error updating contact', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Update',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageFunctionUpdateError:The function could not be updated: error: ${dataserviceerror.message}`,
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
                  detail: $localize`:@@messageFunctionCreated:The function was created`
                });
                this.onMembreFunctionCreate.emit(newMembreFunction);
              },
              (dataserviceerror: DataServiceError) => {
                console.log('Error creating contact', dataserviceerror.message);
                const  errMessage = {severity: 'error', summary: 'Create',
                  // tslint:disable-next-line:max-line-length
                  detail: $localize`:@@messageFunctionCreateError:The function could not be created: error: ${dataserviceerror.message}`,
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
    generateTooltipFunction() {
        return $localize`:@@TooltipFunction:Functions can be standard for all banks or specific for a food bank`;
    }
}

