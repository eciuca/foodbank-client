import { Component, OnInit } from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Membre} from './model/membre';
import {MembreEntityService} from './services/membre-entity.service';
import {Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-membres',
  templateUrl: './membres.component.html',
  styleUrls: ['./membres.component.css']
})

export class MembresComponent implements OnInit {
  membre: Membre = null;
  membres: Membre[];
  cols: any[];
  title: string;
  totalRecords: number;
  loading: boolean;

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
              if (authState.banque) {
                switch (authState.user.rights) {
                  case 'Bank':
                  case 'Admin_Banq':
                    this.title = 'Membres de la ' + authState.banque.bankName;
                    break;
                  case 'Asso':
                  case 'Admin_Asso':
                    this.title = `Membres de la Banque ${authState.banque.bankName} ${authState.organisation.societe}` ;
                    break;
                  default:
                    this.title = 'Membres de toutes les banques';
                }

              } else {
                this.title = 'Membres de toutes les banques';
              }
            })
        )
        .subscribe();

    this.cols = [
      { field: 'batId', header: 'Identifiant' },
      { field: 'nom', header: 'Nom' },
      { field: 'prenom', header: 'Prenom' },
      { field: 'address', header: 'Adresse' },
      { field: 'city', header: 'Commune' },
      { field: 'zip', header: 'Code Postal' }
    ];

  }
  handleSelect(membre) {
    console.log( 'Membre was selected', membre);
    this.membre = {...membre};
    this.router.navigateByUrl(`/membres/${membre.batId}`);
  }

  nextPage(event: LazyLoadEvent) {
     console.log('Lazy Loaded Event', event);
      this.loading = true;
     this.membreService.getWithQuery({ 'offset': event.first.toString(), 'rows': event.rows.toString() })
         .subscribe(loadedMembres => {
           console.log('Loaded membres from nextpage: ' + loadedMembres.length);
           if (loadedMembres.length > 0) {
                this.totalRecords = loadedMembres[0].totalRecords;
            }
           this.membres  = loadedMembres;
           this.loading = false;
           this.membreService.setLoaded(true);
         });
  }
}

