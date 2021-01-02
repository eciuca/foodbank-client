import { Component, OnInit } from '@angular/core';
import { Banque } from './model/banque';
import {BanqueService} from './services/banqueservice';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'banques',
  templateUrl: './banques.component.html',
  styleUrls: ['./banques.component.css']
})
// tslint:disable-next-line:component-class-suffix
export class BanquePrime implements Banque {
  constructor(public vin?, public year?, public brand?, public color?) {}
}
export class BanquesComponent implements OnInit {

  displayDialog: boolean;

  banque: Banque = new BanquePrime();

  selectedBanque: Banque;

  newBanque: boolean;

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

  showDialogToAdd() {
    this.newBanque = true;
    this.banque = new BanquePrime();
    this.displayDialog = true;
  }

  save() {
    const banques = [...this.banques];
    if (this.newBanque) {
      banques.push(this.banque);
    } else {
      banques[this.findSelectedBanqueIndex()] = this.banque;
    }
    this.banques = banques;
    this.banque = null;
    this.displayDialog = false;
  }

  delete() {
    const index = this.findSelectedBanqueIndex();
    this.banques = this.banques.filter((val, i) => i !== index);
    this.banque = null;
    this.displayDialog = false;
  }

  onRowSelect(event) {
    this.newBanque = false;
    this.banque = {...event.data};
    this.displayDialog = true;
  }

  findSelectedBanqueIndex(): number {
    return this.banques.indexOf(this.selectedBanque);
  }
}
