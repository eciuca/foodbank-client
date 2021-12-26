import {combineLatest, Observable} from 'rxjs';
import {DataServiceError} from '@ngrx/data';
import {Component, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {DefaultDepot, Depot} from '../model/depot';
import {DepotEntityService} from '../services/depot-entity.service';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {ConfirmationService, MessageService} from 'primeng/api';
import {map, switchMap} from 'rxjs/operators';
import {globalAuthState} from '../../auth/auth.selectors';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-depot',
    templateUrl: './depot.component.html',
    styleUrls: ['./depot.component.css']
})
export class DepotComponent implements OnInit {
    @ViewChild('depotForm') myform: NgForm;
    booCalledFromTable: boolean;
    @Input() idDepot$: Observable<string>;
    lienBanque: number;
    @Output() onDepotUpdate = new EventEmitter<Depot>();
    @Output() onDepotCreate = new EventEmitter<Depot>();
    @Output() onDepotDelete = new EventEmitter<Depot>();
    @Output() onDepotQuit = new EventEmitter<Depot>();
    depot: Depot;
    booCanSave: boolean;
    booCanDelete: boolean;
    booCanQuit: boolean;
    constructor(
        private depotsService: DepotEntityService,
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {

        this.booCanDelete = false;
        this.booCanSave = false;
        this.booCanQuit = true;
        this.lienBanque = 0;
        this.booCalledFromTable = true;
    }

    ngOnInit(): void {
        if (!this.idDepot$) {
            // we must come from the menu
            console.log('We initialize a new depot object from the router!');
            this.booCalledFromTable = false;
            this.booCanQuit = false;
            this.route.paramMap
                .pipe(
                    map(paramMap => paramMap.get('idDepot')),
                    switchMap(idDepot => this.depotsService.getByKey(idDepot))
                ).subscribe(depot => {
                console.log('Depot from Link : ', depot);
                this.depot = depot;
            });
        }  else {
            const depot$ = combineLatest([this.idDepot$, this.depotsService.entities$])
                .pipe(
                    map(([idDepot, depots]) => depots.find(depot => depot['idDepot'] === idDepot))
                );
            depot$.subscribe(depot => {
                if (depot) {
                    this.depot = depot;
                    console.log('our depot:', this.depot);
                } else {
                    this.depot = new DefaultDepot();
                    if (this.myform) {
                        this.myform.reset(this.depot);
                    }
                    console.log('we have a new default depot');
                }
            });
        }
        this.store
            .pipe(
                select(globalAuthState),
                map((authState) => {
                    if (authState.user) {
                        this.lienBanque = authState.banque.bankId;
                        switch (authState.user.rights) {
                            case 'Bank':
                            case 'Asso':
                                break;
                            case 'Admin_Banq':
                            case 'Admin_Asso':
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

    delete(event: Event, depot: Depot) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const myMessage = {
                    severity: 'success',
                    summary: 'Delete',
                    detail: $localize`:@@messageDepotDeleted:The depot ${depot.idDepot} ${depot.nom} has been deleted`
                };
                this.depotsService.delete(depot)
                    .subscribe(() => {
                            this.messageService.add(myMessage);
                            this.onDepotDelete.emit(depot);
                        },
                        (dataserviceerror: DataServiceError) => {
                            console.log('Error deleting depot', dataserviceerror.message);
                            const  errMessage = {severity: 'error', summary: 'Delete',
                                // tslint:disable-next-line:max-line-length
                                detail: $localize`:@@messageDepotNotDeleted:The depot  ${depot.idDepot} ${depot.nom}  could not be deleted: error: ${dataserviceerror.message}`,
                                life: 6000 };
                            this.messageService.add(errMessage) ;
                        });
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }

    save(oldDepot: Depot, depotForm: Depot) {
        const modifiedDepot = Object.assign({}, oldDepot, depotForm);

        if (!modifiedDepot.hasOwnProperty('isNew')) {
            this.depotsService.update(modifiedDepot)
                .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Update',
                            detail: $localize`:@@messageDepotUpdated:The depot ${modifiedDepot.idDepot} ${modifiedDepot.nom} was updated`
                        });
                        this.onDepotUpdate.emit(modifiedDepot);
                    },
                    (dataserviceerror: DataServiceError) => {
                        console.log('Error updating depot', dataserviceerror.message);
                        const  errMessage = {severity: 'error', summary: 'Update',
                            // tslint:disable-next-line:max-line-length
                            detail: $localize`:@@messageDepotNotUpdated:The depot  ${modifiedDepot.idDepot} ${modifiedDepot.nom} could not be updated: error: ${dataserviceerror.message}`,
                            life: 6000 };
                        this.messageService.add(errMessage) ;
                    });
        } else {
            modifiedDepot.lienBanque = this.lienBanque;
            console.log('Creating Depot with content:', modifiedDepot);
            this.depotsService.add(modifiedDepot)
                .subscribe((newDepot) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Creation',
                            detail: $localize`:@@messageDepotCreated:The depot ${newDepot.idDepot} ${newDepot.nom}  has been created`
                        });
                        this.onDepotCreate.emit(newDepot);
                    },
                    (dataserviceerror: DataServiceError) => {
                        console.log('Error creating depot', dataserviceerror.message);
                        const  errMessage = {severity: 'error', summary: 'Create',
                            // tslint:disable-next-line:max-line-length
                            detail: $localize`:@@messageDepotNotCreated:The depot  ${modifiedDepot.idDepot} ${modifiedDepot.nom} could not be created: error: ${dataserviceerror.message}`,
                            life: 6000 };
                        this.messageService.add(errMessage) ;
                    });
        }

    }

    quit(event: Event, oldDepot: Depot, depotForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    depotForm.reset(oldDepot); // reset in-memory object for next open
                    console.log('We have reset the depot form to its original value');
                    this.onDepotQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onDepotQuit.emit();
        }
    }
}




