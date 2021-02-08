import { Component, OnInit } from '@angular/core';
import {BanqueEntityService} from '../services/banque-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Banque} from '../model/banque';
import {MessageService} from 'primeng/api';
import { Input } from '@angular/core';

@Component({
  selector: 'app-banque',
  templateUrl: './banque.component.html',
  styleUrls: ['./banque.component.css']
})
export class BanqueComponent implements OnInit {
  @Input() bankId$: Observable<number>;
  banque$: Observable<Banque>;
  
  constructor(
      private banquesService: BanqueEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
      // comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
      // or sometimes via a router link via the Main Menu
      if (!this.bankId$) {
          // we must come from the menu
          console.log('We initialize a new banque object from the router!');
          this.bankId$ = this.route.paramMap
            .pipe(
              map(paramMap => paramMap.get('bankId')),
              map(bankIdString => Number(bankIdString))
            );
      }

      this.banque$ = this.bankId$
        .pipe(
            withLatestFrom(this.banquesService.entities$),
            map(([bankId, banques]) => banques.find(banque => bankId === banque.bankId))
        );
  }
  
 save(oldBanque: Banque, banqueForm: Banque) {
    const modifiedBanque = Object.assign({}, oldBanque, banqueForm);
    this.banquesService.update(modifiedBanque)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `La banque ${modifiedBanque.bankShortName} ${modifiedBanque.bankName}  a été modifiée`});
          this.router.navigateByUrl('/banques');
        });
  }

}

