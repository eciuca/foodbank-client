import { Component, OnInit } from '@angular/core';
import { Banque } from './model/banque';
import {BanqueEntityService} from './services/banque-entity.service';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'banques',
  templateUrl: './banques.component.html',
  styleUrls: ['./banques.component.css']
})

export class BanquesComponent implements OnInit {

  banques$: Observable<Banque[]>;
  cols: any[];

  constructor(private banqueService: BanqueEntityService) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
   this.banques$ = this.banqueService.entities$
        .pipe(
            tap( (banques) => { console.log('Banques npw loaded:', banques); })
      );
    this.cols = [
      { field: 'vin', header: 'Vin' },
      { field: 'year', header: 'Year' },
      { field: 'brand', header: 'Brand' },
      { field: 'color', header: 'Color' }
    ];

  }
}
