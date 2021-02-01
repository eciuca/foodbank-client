import { Component, OnInit } from '@angular/core';
import {BanqueEntityService} from '../services/banque-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap} from 'rxjs/operators';
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
    @Input() bankId: string;
  banque$: Observable<Banque>;
  constructor(
      private banquesService: BanqueEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {

      if (!this.bankId) {
          this.bankId = this.route.snapshot.paramMap.get('bankId');
      }


    this.banque$ = this.banquesService.entities$
        .pipe(
            map( banques => banques.find(banque => this.bankId === banque.bankId.toString()))
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

