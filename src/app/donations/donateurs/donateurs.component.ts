import {Component, Input, OnInit} from '@angular/core';
import {Donateur} from '../model/donateur';
import {DonateurEntityService} from '../services/donateur-entity.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {filter, map, mergeMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';



@Component({
  selector: 'app-donateurs',
  templateUrl: './donateurs.component.html',
  styleUrls: ['./donateurs.component.css']
})

export class DonateursComponent implements OnInit {
  @Input() lienBanque$: Observable<number>;
  loadPageSubject$ = new BehaviorSubject(null);
  selectedDonateurId$ = new BehaviorSubject(0);
  donateurs: Donateur[];
  donateur: Donateur = null;
  displayDialog: boolean;
  loading: boolean;
  filterBase: any;
  booIsAdmin: boolean;
  first: number;
  totalRecords: number;
  constructor(private donateurService: DonateurEntityService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store
  ) {
    this.booIsAdmin = false;
    this.first = 0;
    this.totalRecords = 0;
    this.filterBase = {};
  }
  ngOnInit() {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                this.filterBase = { 'lienBanque': authState.banque.bankId};
                if (authState.user.rights === 'Admin_Banq') {
                  this.booIsAdmin = true;
                }
              }
            })
        )
        .subscribe();

      this.loadPageSubject$
          .pipe(
              filter(queryParams => !!queryParams),
              mergeMap(queryParams => this.donateurService.getWithQuery(queryParams))
          )
          .subscribe(loadedDonateurs => {
            console.log('Loaded donateurs from nextpage: ' + loadedDonateurs.length);
            if (loadedDonateurs.length > 0) {
              this.totalRecords = loadedDonateurs[0].totalRecords;
            }  else {
              this.totalRecords = 0;
            }
            this.donateurs  = loadedDonateurs;
            this.loading = false;
            this.donateurService.setLoaded(true);
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
  nextPage(event: LazyLoadEvent) {
    console.log('Lazy Loaded Event', event);
    this.loading = true;
    const queryParms = {...this.filterBase};
    queryParms['offset'] = event.first.toString();
    queryParms['rows'] = event.rows.toString();
    queryParms['sortOrder'] = event.sortOrder.toString();
    if (event.sortField) {
      queryParms['sortField'] = event.sortField.toString();
    } else {
      queryParms['sortField'] =  'nom';
    }
    if (event.filters) {
      if (event.filters.nom && event.filters.nom.value) {
        queryParms['nom'] = event.filters.nom.value;
      }
    }
    this.loadPageSubject$.next(queryParms);
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


