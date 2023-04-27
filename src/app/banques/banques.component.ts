import {Component, OnInit} from '@angular/core';
import {Banque} from './model/banque';
import {BanqueEntityService} from './services/banque-entity.service';
import {map} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';


@Component({
  selector: 'app-banques',
  templateUrl: './banques.component.html',
  styleUrls: ['./banques.component.css']
})

export class BanquesComponent implements OnInit {
  selectedBankid$ = new BehaviorSubject(0);
  banques: Banque[];
  displayDialog: boolean;
  booCanCreate: boolean;
  booclassicBanks:boolean;
  constructor(
      private banqueService: BanqueEntityService,
      private router: Router,
      private store: Store
      ) {
      this.booCanCreate = false;
      this.booclassicBanks = true; // except for admin, show classic banks
  }

  ngOnInit() {
    this.reload();
    }

  reload() {

      this.store
          .pipe(
              select(globalAuthState),
              map((authState) => {
                  if (authState.user) {
                      switch (authState.user.rights) {
                          case 'admin':
                              this.booCanCreate = true;
                              this.booclassicBanks = false;
                              this.banqueService.getAll()
                                  .subscribe(
                                      banquesEntities => {
                                          this.banques = banquesEntities;
                                      });
                              break;
                          default:
                              const classicBanks = { 'classicBanks': '1' };
                              this.banqueService.getWithQuery(classicBanks)
                                  .subscribe(
                                      banquesEntities => {
                                          this.banques = banquesEntities;
                                      });
                      }
                  }

              })

          )
          .subscribe();

  }
    handleSelect(banque: Banque) {
        this.selectedBankid$.next(banque.bankId);
        this.displayDialog = true;
    }
    showDialogToAdd() {
        this.selectedBankid$.next(0);
        this.displayDialog = true;
    }
    handleBanqueQuit() {
        this.displayDialog = false;
    }

    handleBanqueUpdate() {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }

    handleBanqueDeleted() {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }

    handleBanqueCreate(createdBanque: Banque) {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }
}
