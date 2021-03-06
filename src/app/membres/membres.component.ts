import { Component, OnInit } from '@angular/core';
import {map} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Membre} from './model/membre';
import {MembreEntityService} from './services/membre-entity.service';
import {Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {AuthState} from '../auth/reducers';

@Component({
  selector: 'app-membres',
  templateUrl: './membres.component.html',
  styleUrls: ['./membres.component.css']
})

export class MembresComponent implements OnInit {
  selectedMembreid$ = new BehaviorSubject(0);
  membre: Membre = null;
  membres: Membre[];
  cols: any[];
  displayDialog: boolean;
  title: string;
  totalRecords: number;
  loading: boolean;
  filterBase: any;

  constructor(private membreService: MembreEntityService,
              private router: Router,
              private store: Store<AppState>
  ) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
      this.loading = true;
      this.totalRecords = 0;

      this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
             this.initializeDependingOnUserRights(authState);
            })
        )
        .subscribe();

    this.cols = [
      { field: 'nom', header: 'Nom' },
      { field: 'prenom', header: 'Prenom' },
      { field: 'address', header: 'Adresse' },
      { field: 'zip', header: 'Code Postal' },
      { field: 'city', header: 'Commune' },
    ];

  }

  handleSelect(membre) {
    console.log( 'Membre was selected', membre);
      this.selectedMembreid$.next(membre.batId);
      this.displayDialog = true;
  }

  nextPage(event: LazyLoadEvent) {
     console.log('Lazy Loaded Event', event);
      this.loading = true;
      if (event.sortField == null) {
          setTimeout(() => {
              console.log('waiting first 250ms for reset to take place');
          }, 250);
      }
      const queryParms = {...this.filterBase};
      queryParms['offset'] = event.first.toString();
      queryParms['rows'] = event.rows.toString();
      queryParms['sortOrder'] = event.sortOrder.toString();
      if (event.filters) {
          if (event.filters.nom && event.filters.nom.value) {
              queryParms['sortField'] = 'nom';
              queryParms['searchField'] = 'nom';
              queryParms['searchValue'] = event.filters.nom.value;
          } else if (event.filters.prenom && event.filters.prenom.value) {
              queryParms['sortField'] = 'prenom';
              queryParms['searchField'] = 'prenom';
              queryParms['searchValue'] = event.filters.prenom.value;
          } else if (event.filters.address && event.filters.address.value) {
              queryParms['sortField'] = 'address';
              queryParms['searchField'] = 'address';
              queryParms['searchValue'] = event.filters.address.value;
          } else if (event.filters.zip && event.filters.zip.value) {
              queryParms['sortField'] = 'zip';
              queryParms['searchField'] = 'zip';
              queryParms['searchValue'] = event.filters.zip.value;
          } else if (event.filters.city && event.filters.city.value) {
              queryParms['sortField'] = 'city';
              queryParms['searchField'] = 'city';
              queryParms['searchValue'] = event.filters.city.value;
          }
      }
      if (!queryParms.hasOwnProperty('sortField')) {
          if (event.sortField) {
              queryParms['sortField'] = event.sortField;
          } else {
              queryParms['sortField'] = 'nom';
          }
      }
        this.membreService.getWithQuery(queryParms)
         .subscribe(loadedMembres => {
           console.log('Loaded membres from nextpage: ' + loadedMembres.length);
           if (loadedMembres.length > 0) {
                this.totalRecords = loadedMembres[0].totalRecords;
            } else {
               this.totalRecords = 0;
           }
           this.membres  = loadedMembres;
           this.loading = false;
           this.membreService.setLoaded(true);
         });
  }
    private initializeDependingOnUserRights(authState: AuthState) {
        if (authState.banque) {
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.title = 'Membres de la ' + authState.banque.bankName;
                    this.filterBase = { 'bankShortName': authState.banque.bankShortName};
                    break;
                case 'Asso':
                case 'Admin_Asso':
                    this.title = `Membres de la Banque ${authState.banque.bankName} ${authState.organisation.societe}` ;
                    this.filterBase = { 'lienDis': authState.organisation.idDis};
                    break;
                default:
                    this.title = 'Membres de toutes les banques';
            }

        } else {
            this.title = 'Membres de toutes les banques';
        }
    }
}

