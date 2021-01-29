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
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const bankId = this.route.snapshot.paramMap.get('bankId');

    this.banque$ = this.banquesService.entities$
        .pipe(
            map( banques => banques.find(banque => bankId === banque.bankId.toString()))
        );
  }
  delete(banque: Banque) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `La banque ${banque.bankShortName} ${banque.bankName}  a été détruite`};
    this.banquesService.delete(banque)
        .subscribe( ()  => {
          this.messageService.add(myMessage);
          this.router.navigateByUrl('/banques');
        });
  }

  save(oldBanque: Banque, banqueForm: Banque) {
    const modifiedBanque = Object.assign({}, oldBanque, banqueForm);
    this.banquesService.update(modifiedBanque)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `La banque ${modifiedBanque.bankShortName} ${modifiedBanque.bankName}  a été modifiée`});
          this.router.navigateByUrl('/banques');
        });


  }
  return() {
    this.router.navigateByUrl('/banques');
  }
}

