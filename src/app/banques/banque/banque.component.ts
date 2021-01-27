import { Component, OnInit } from '@angular/core';
import {BanqueEntityService} from '../services/banque-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Banque} from '../model/banque';
import {MessageService} from 'primeng/api';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'banque',
  templateUrl: './banque.component.html',
  styleUrls: ['./banque.component.css']
})
export class BanqueComponent implements OnInit {

  banque$: Observable<Banque>;
  constructor(
      private banquesService: BanqueEntityService,
      private route: ActivatedRoute,
      private router: Router
  ) {}

  ngOnInit(): void {
    const bankId = this.route.snapshot.paramMap.get('bankId');

    this.banque$ = this.banquesService.entities$
        .pipe(
            map( banques => banques.find(banque => bankId === banque.bankId.toString()))
        );
  }
  delete(banque: Banque) {
    console.log( 'Delete Called with Banque:', banque);
    this.banquesService.delete(banque)
        .subscribe( ()  => {
          console.log('Banque was deleted');
          this.router.navigateByUrl('/banques');
        });
  }

  save(oldBanque: Banque, banqueForm: Banque) {
    const newBanque = Object.assign({}, oldBanque, banqueForm);
    console.log( 'Save Called with Banque:', newBanque);
    this.banquesService.update(newBanque)
        .subscribe( ()  => {
          console.log('Banque was updated');
          this.router.navigateByUrl('/banques');
        });


  }
  return() {
    this.router.navigateByUrl('/banques');
  }
}

