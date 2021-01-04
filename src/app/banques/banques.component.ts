import { Component, OnInit } from '@angular/core';
import { Banque } from './model/banque';
import {BanqueService} from './services/banqueservice';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'banques',
  templateUrl: './banques.component.html',
  styleUrls: ['./banques.component.css']
})

export class BanquesComponent implements OnInit {

  banques: Banque[];
  cols: any[];

  constructor(private banqueService: BanqueService) { }

  ngOnInit() {
    this.banqueService.getBanquesSmall().then(banques => this.banques = banques);
    this.cols = [
      { field: 'vin', header: 'Vin' },
      { field: 'year', header: 'Year' },
      { field: 'brand', header: 'Brand' },
      { field: 'color', header: 'Color' }
    ];

  }
}
