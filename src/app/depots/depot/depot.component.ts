import { Component, Input , Output, EventEmitter, OnInit } from '@angular/core';
import {DepotEntityService} from '../services/depot-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {Depot} from '../model/depot';
import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-depot',
  templateUrl: './depot.component.html',
  styleUrls: ['./depot.component.css']
})
export class DepotComponent implements OnInit {
  @Input() depot: Depot;
    @Output() onDepotUpdate = new EventEmitter<Depot>();
    @Output() onDepotDelete = new EventEmitter<Depot>();
    @Output() onDepotQuit = new EventEmitter<Depot>();
    booCanDelete: boolean;
  constructor(
      private depotsService: DepotEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.booCanDelete = true;
  }

  ngOnInit(): void {
    // comment: this component is sometimes called from his parent Component with idDepot @Input Decorator,
    // or sometimes via a router link via the Main Menu

    if (!this.depot) {
      // we must come from the menu
      console.log('We initialize a new user object from the router!');
      this.booCanDelete = false;
      this.route.paramMap
        .pipe(
            map(paramMap => paramMap.get('idDepot')),
            withLatestFrom(this.depotsService.entities$),
            map(([idDepot, depots]) => depots.find(depot => depot.idDepot === idDepot))
        )
        .subscribe(
            depot => this.depot = depot
        );
    }
  }
    delete(event: Event, depot: Depot) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `Le depot ${depot.nom} a été détruit`};
                this.depotsService.delete(depot)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onDepotDelete.emit();
                    });
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }
  save(oldDepot: Depot, depotForm: Depot) {
    const modifiedDepot = Object.assign({}, oldDepot, depotForm);
    this.depotsService.update(modifiedDepot)
        .subscribe( ()  => {
          this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `Le depot ${modifiedDepot.bankShortName} ${modifiedDepot.bankName}  a été modifié`});
          // Emanuel if we did not come from the router,
          // post ( via an @Output event ? the displayDialog property of its parent depots.component to false so we are done
          console.log('We hide the depot component');
          this.onDepotUpdate.emit(modifiedDepot);
        });
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
