import { Component, OnInit } from '@angular/core';
import {DepotEntityService} from '../services/depot-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {Depot} from '../model/depot';
import {MessageService} from 'primeng/api';
import { Input } from '@angular/core';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'app-depot',
  templateUrl: './depot.component.html',
  styleUrls: ['./depot.component.css']
})
export class DepotComponent implements OnInit {
  @Input() idDepot$: Observable<number>;
  depot$: Observable<Depot>;
  constructor(
      private depotsService: DepotEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // comment: this component is sometimes called from his parent Component with idDepot @Input Decorator,
    // or sometimes via a router link via the Main Menu
    if (!this.idDepot$) {
      // we must come from the menu
      console.log('We initialize a new depot object from the router!');
      this.idDepot$ = this.route.paramMap
          .pipe(
              map(paramMap => paramMap.get('idDepot')),
              map(idDepotString => Number(idDepotString))
          );
    }

    this.depot$ = combineLatest([this.idDepot$, this.depotsService.entities$])
        .pipe(
            map(([idDepot, depots]) => depots.find(depot => depot['idDepot'] === idDepot.toString()))
        );
  }

  save(oldDepot: Depot, depotForm: Depot) {
    const modifiedDepot = Object.assign({}, oldDepot, depotForm);
    this.depotsService.update(modifiedDepot)
        .subscribe( ()  => {
          this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `Le depot ${modifiedDepot.bankShortName} ${modifiedDepot.bankName}  a été modifié`});
          // Emanuel if we did not come from the router,
          // post ( via an @Output event ? the displayDialog property of its parent depots.component to false so we are done
          console.log('We hide the depot component');
    });
  }

    quit(event: Event) {
      // Emanuel Test if we did not come from the router then:
      // test also if the form is dirty
      this.confirmationService.confirm({
        target: event.target,
        message: 'Your changes may be lost. Are you sure that you want to proceed?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
         // Emanuel if we did not come from the router,
         // post ( via an @Output event ? the displayDialog property of its parent depots.component to false so we are done
          console.log('We hide the depot component');
        },
        reject: () => {
         console.log('We do nothing');
        }
      });
    }
}
