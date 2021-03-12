import {Component, OnInit, Output} from '@angular/core';
import { Banque } from './model/banque';
import {BanqueEntityService} from './services/banque-entity.service';
import {concatMap, map, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';


@Component({
  selector: 'app-banques',
  templateUrl: './banques.component.html',
  styleUrls: ['./banques.component.css']
})

export class BanquesComponent implements OnInit {
  selectedBankid$ = new BehaviorSubject(0);
  banques$: Observable<Banque[]>;
  cols: any[];
  displayDialog: boolean;

  constructor(
      private banqueService: BanqueEntityService,
      private router: Router,
      ) { }

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
    handleSelect(banque: Banque) {
        console.log( 'Banque was selected', banque);
        this.selectedBankid$.next(banque.bankId);
        this.displayDialog = true;
    }
    handleBanqueQuit() {
        this.displayDialog = false;
    }

    handleBanqueUpdate(updatedBanque) {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }

    handleBanqueDeleted() {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }
}
