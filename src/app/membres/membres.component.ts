import { Component, OnInit } from '@angular/core';
import {filter, map, mergeMap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Membre} from './model/membre';
import {MembreEntityService} from './services/membre-entity.service';
import {Router} from '@angular/router';
import {globalAuthState} from '../auth/auth.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../reducers';
import {LazyLoadEvent} from 'primeng/api';
import {AuthState} from '../auth/reducers';
import {Organisation} from '../organisations/model/organisation';
import {OrganisationEntityService} from '../organisations/services/organisation-entity.service';
import {QueryParams} from '@ngrx/data';


@Component({
  selector: 'app-membres',
  templateUrl: './membres.component.html',
  styleUrls: ['./membres.component.css']
})

export class MembresComponent implements OnInit {
    loadPageSubject$ = new BehaviorSubject(null);
    selectedBatid$ = new BehaviorSubject(0);
    membre: Membre = null;
    membres: Membre[];
    displayDialog: boolean;
    totalRecords: number;
    loading: boolean;
    filterBase: any;
    booCanCreate: boolean;
    filteredOrganisations: Organisation[];
    booShowOrganisations: boolean;
    bankid: number;

  constructor(private membreService: MembreEntityService,
              private organisationService: OrganisationEntityService,
              private router: Router,
              private store: Store<AppState>
  ) {
      this.booCanCreate = false;
      this.bankid = 0;
      this.booShowOrganisations = false;
  }

  ngOnInit() {
    this.reload();
      this.loadPageSubject$
          .pipe(
              filter(queryParams => !!queryParams),
              mergeMap(queryParams => this.membreService.getWithQuery(queryParams))
          )
          .subscribe(loadedMembres => {
              console.log('Loaded membres from nextpage: ' + loadedMembres.length);
              if (loadedMembres.length > 0) {
                  this.totalRecords = loadedMembres[0].totalRecords;
              }  else {
                  this.totalRecords = 0;
              }
              this.membres  = loadedMembres;
              this.loading = false;
              this.membreService.setLoaded(true);
          });
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
  }

  handleSelect(membre) {
    console.log( 'Membre was selected', membre);
      this.selectedBatid$.next(membre.batId);
      this.displayDialog = true;
  }
    handleMembreQuit() {
        this.displayDialog = false;
    }
    handleMembreCreate(createdMembre: Membre) {
        this.membres.push({...createdMembre});
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }

    handleMembreUpdate(updatedMembre) {
        const index = this.membres.findIndex(membre => membre.batId === updatedMembre.batId);
        this.membres[index] = updatedMembre;
        this.displayDialog = false;
    }

    handleMembreDeleted(deletedMembre) {
        const index = this.membres.findIndex(membre => membre.batId === deletedMembre.batId);
        this.membres.splice(index, 1);
        const latestQueryParams = this.loadPageSubject$.getValue();
        this.loadPageSubject$.next(latestQueryParams);
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
          if (event.filters.prenom && event.filters.prenom.value) {
               queryParms['prenom'] = event.filters.prenom.value;
          }
          if (event.filters.lienDis && event.filters.lienDis.value) {
              queryParms['lienDis'] = event.filters.lienDis.value;
          }
          if (event.filters.address && event.filters.address.value) {
               queryParms['address'] = event.filters.address.value;
          }
          if (event.filters.zip && event.filters.zip.value) {
              queryParms['zip'] = event.filters.zip.value;
          }
          if (event.filters.city && event.filters.city.value) {
              queryParms['city'] = event.filters.city.value;
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
            this.bankid = authState.banque.bankId;
            switch (authState.user.rights) {
                case 'Bank':
                case 'Admin_Banq':
                    this.booShowOrganisations = true;
                    this.filterBase = { 'lienBanque': authState.banque.bankId};
                    if (authState.user.rights === 'Admin_Banq' ) { this.booCanCreate = true; }
                    break;
                case 'Asso':
                case 'Admin_Asso':
                    this.filterBase = { 'lienDis': authState.organisation.idDis};
                    if (authState.user.rights === 'Admin_Asso' ) { this.booCanCreate = true; }
                    break;
                default:
              }
        }
    }

    showDialogToAdd() {
        this.selectedBatid$.next(0);
        this.displayDialog = true;
    }
    filterOrganisation(event ) {
        console.log('Got Query with value:', event, 'bankid:', this.bankid);
        const  queryOrganisationParms: QueryParams = {};
        queryOrganisationParms['offset'] = '0';
        queryOrganisationParms['rows'] = '10';
        queryOrganisationParms['sortField'] = 'societe';
        queryOrganisationParms['sortOrder'] = '1';
        queryOrganisationParms['lienBanque'] = this.bankid.toString();
        queryOrganisationParms['searchField'] = 'societe';
        queryOrganisationParms['searchValue'] = event.query.toLowerCase();
        this.organisationService.getWithQuery(queryOrganisationParms)
            .subscribe(filteredOrganisations => {
                this.filteredOrganisations = filteredOrganisations.map((organisation) =>
                    Object.assign({}, organisation, {fullname: organisation.societe})
                );
            });
    }
}

