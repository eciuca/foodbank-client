import {Component, Input, OnInit} from '@angular/core';
import {Donateur} from '../model/donateur';
import {DonateurEntityService} from '../services/donateur-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {map} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';



@Component({
  selector: 'app-donateurs',
  templateUrl: './donateurs.component.html',
  styleUrls: ['./donateurs.component.css']
})

export class DonateursComponent implements OnInit {
  @Input() lienBanque$: Observable<number>;
  selectedDonateurId$ = new BehaviorSubject(0);
  donateurs: Donateur[];
  donateur: Donateur = null;
  displayDialog: boolean;
  loading: boolean;
  booCanCreate: boolean;
  booIsAdmin: boolean;
  constructor(private donateurService: DonateurEntityService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store
  ) {
    this.booCanCreate = false;
    this.booIsAdmin = false;
  }
  ngOnInit() {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user && ( authState.user.rights === 'Admin_Banq' ) ) {
                this.booIsAdmin = true;
              }
            })
        )
        .subscribe();
    if (!this.lienBanque$ ) {
      this.lienBanque$ = this.route.paramMap
          .pipe(
              map(paramMap => paramMap.get('bankId')),
              map(bankIdString => Number(bankIdString))
          );
    }
    this.lienBanque$.subscribe(lienBanque => {
      if (lienBanque) {
        console.log('initializing donateurs of id of Banque', lienBanque);
        this.loading = true;
        const queryParms = {};
        queryParms['lienBanque'] = lienBanque;
        this.donateurService.getWithQuery(queryParms)
            .subscribe(loadedDonateurs => {
              console.log('Loaded donateurs: ' + loadedDonateurs.length);
              this.donateurs = loadedDonateurs;
              if (this.booIsAdmin) {
                this.booCanCreate = true;
              }
              this.loading = false;
              this.donateurService.setLoaded(true);
            });
      } else {
        this.donateurs = [];
        this.booCanCreate = false;
        console.log(' not yet initializing donateurs of lienBanque');
      }
    });
  }
  handleSelect(donateur) {
    console.log( 'Donateur was selected', donateur);
    this.selectedDonateurId$.next(donateur.donateurId);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.selectedDonateurId$.next(0);
    this.displayDialog = true;
  }

  handleDonateurQuit() {
    this.displayDialog = false;
  }

  handleDonateurUpdate(updatedDonateur) {
    const index = this.donateurs.findIndex(donateur => donateur.donateurId === updatedDonateur.donateurId);
    this.donateurs[index] = updatedDonateur;
    this.displayDialog = false;
  }
  handleDonateurCreate(createdDonateur: Donateur) {
    this.donateurs.push({...createdDonateur});
    this.displayDialog = false;
  }

  handleDonateurDeleted(deletedDonateur) {
    const index = this.donateurs.findIndex(donateur => donateur.donateurId === deletedDonateur.donateurId);
    this.donateurs.splice(index, 1);
    this.displayDialog = false;
  }

  labelTitre(titre: number) {
    switch (titre) {
      case 1:
        return 'Mr';
      case 2:
        return 'Mrs.';
      case 3:
        return 'Miss';
      default:
        return 'Unspecified';
    }

  }
}


