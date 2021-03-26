import { Component, Input , Output, EventEmitter, OnInit } from '@angular/core';
import {DepotEntityService} from '../services/depot-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {DefaultDepot, Depot} from '../model/depot';
import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';
import {NgForm} from '@angular/forms';
import {Observable,  combineLatest} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';

@Component({
  selector: 'app-depot',
  templateUrl: './depot.component.html',
  styleUrls: ['./depot.component.css']
})
export class DepotComponent implements OnInit {
    @Input() idDepot$: Observable<string>;
    depot: Depot;
    @Output() onDepotUpdate = new EventEmitter<Depot>();
    @Output() onDepotCreate = new EventEmitter<Depot>();
    @Output() onDepotDelete = new EventEmitter<Depot>();
    @Output() onDepotQuit = new EventEmitter<Depot>();
    booCalledFromTable: boolean;
    booCanSave: boolean;
    booCanDelete: boolean;
    booCanQuit: boolean;
  constructor(
      private depotsService: DepotEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.booCalledFromTable = true;
      this.booCanDelete = false;
      this.booCanSave = false;
      this.booCanQuit = true;
  }

  ngOnInit(): void {
    // comment: this component is sometimes called from his parent Component with idDepot @Input Decorator,
    // or sometimes via a router link via the Main Menu

    if (!this.idDepot$) {
        // we must come from the menu
        console.log('We initialize a new user object from the router!');
        this.booCalledFromTable = false;
        this.booCanQuit = false;
        this.idDepot$ = this.route.paramMap
            .pipe(
                map(paramMap => paramMap.get('idDepot')),
            );
    }
      const depot$ = combineLatest([this.idDepot$, this.depotsService.entities$])
          .pipe(
              map(([idDepot, depots]) => depots.find(depot => depot.idDepot === idDepot.toString()))
          );

      depot$.subscribe(
            depot => {
                if (depot) {
                    this.depot = depot;
                } else {
                    this.depot = new DefaultDepot();
                }
            }
        );
      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  if (authState.banque) {
                      switch (authState.user.rights) {
                          case 'admin':
                          case 'Admin_Banq':
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
    delete(event: Event, depot: Depot) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `Depot ${depot.nom} was deleted`};
                this.depotsService.delete(depot)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onDepotDelete.emit(depot);
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
          console.log('Modifying Depot with content:', modifiedDepot);
          this.depotsService.update(modifiedDepot)
              .subscribe( ()  => {
                  this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `Depot ${modifiedDepot.nom} was updated`});
                  this.onDepotUpdate.emit(modifiedDepot);
              });
      } else {
          console.log('Creating Depot with content:', modifiedDepot);
          this.depotsService.add(modifiedDepot)
              .subscribe((newDepot) => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Creation',
                      detail: `Depot ${newDepot.nom} was created`
                  });
                  this.onDepotCreate.emit(newDepot);
              });
      }
  }

    quit(event: Event, oldDepot: Depot, depotForm: NgForm, formDirty: boolean) {
     if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: 'Your changes may be lost. Are you sure that you want to proceed?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            depotForm.reset( oldDepot); // reset in-memory object for next open
            console.log('We have reset the form to its original value');
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
