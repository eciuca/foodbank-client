import { Component, OnInit } from '@angular/core';
import {DepotEntityService} from '../services/depot-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Depot} from '../model/depot';
import {MessageService} from 'primeng/api';
import { Input } from '@angular/core';

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
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
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

    this.depot$ = this.idDepot$
        .pipe(
            withLatestFrom(this.depotsService.entities$),
            map(([idDepot, depots]) => depots.find(depot => depot['idDepot'] === idDepot.toString()))
        );
  }

  save(oldDepot: Depot, depotForm: Depot) {
    const modifiedDepot = Object.assign({}, oldDepot, depotForm);
    this.depotsService.update(modifiedDepot)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `Le depot ${modifiedDepot.bankShortName} ${modifiedDepot.bankName}  a été modifié`});
          this.router.navigateByUrl('/depots');
        });
  }

}
