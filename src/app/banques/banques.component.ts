import { Component, OnInit } from '@angular/core';
import { Banque } from './model/banque';
import {BanqueEntityService} from './services/banque-entity.service';
import {concatMap, map, tap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'banques',
  templateUrl: './banques.component.html',
  styleUrls: ['./banques.component.css']
})

export class BanquesComponent implements OnInit {
  banque: Banque = null;
  banques$: Observable<Banque[]>;
  cols: any[];
  displayDialog: boolean;

  constructor(private banqueService: BanqueEntityService) { }

  ngOnInit() {
    this.reload();
    }

  reload() {
      this.banques$  = this.banqueService.entities$
        .pipe(
            tap( (banquesEntities) => {
                console.log('Banques now loaded:', banquesEntities); }),
  )
   ;
    this.cols = [
      { field: 'bankId', header: 'Identifiant' },
      { field: 'bankShortName', header: 'Abbréviation' },
      { field: 'bankName', header: 'Nom' },
      { field: 'nrEntr', header: 'NrEntreprise' },
      { field: 'bankMail', header: 'E-mail' }
    ];

  }
    handleSelect(banque) {
      console.log( 'Banque was selected', banque);
        this.banque = {...banque};
        this.displayDialog = true;
    }

    delete() {
        console.log( 'Delete Called with Banque:', this.banque);
        this.banqueService.delete(this.banque);
        this.banque = null;
        this.displayDialog = false;
    }

    save() {
        console.log( 'Save Called with Banque:', this.banque);
        this.banqueService.update(this.banque);
        this.banque = null;
        this.displayDialog = false;
    }
}
