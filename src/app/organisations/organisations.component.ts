import { Component, OnInit } from '@angular/core';
import { Organisation } from './model/organisation';
import {OrganisationEntityService} from './services/organisation-entity.service';
import {map, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {Router} from '@angular/router';


@Component({
  selector: 'app-organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.css']
})

export class OrganisationsComponent implements OnInit {
  selectedIdDis$ = new BehaviorSubject(0);
  organisation: Organisation = null;
  organisations$: Observable<Organisation[]>;
  displayDialog: boolean;
  cols: any[];
  booCanCreate: boolean;

  constructor(private organisationService: OrganisationEntityService,
              private router: Router,
              private store: Store
  ) {
      this.booCanCreate = false;
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
                         case 'Admin_Banq':
                             this.booCanCreate = true;
                            break;
                        default:
                    }
                }
            })
        )
       .subscribe();


    this.organisations$  = this.organisationService.entities$
        .pipe(
            tap( (organisationsEntities) => {
              console.log('Organisations now loaded:', organisationsEntities); }),
        )
    ;
    this.cols = [
      { field: 'societe', header: 'Nom' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'cp', header: 'Code Postal' },
      { field: 'localite', header: 'Commune' }
    ];

  }
  handleSelect(organisation: Organisation) {
    console.log( 'Organisation was selected', organisation);
      this.selectedIdDis$.next(organisation.idDis);
      this.displayDialog = true;

  }
    showDialogToAdd() {
        this.selectedIdDis$.next(0);
        this.displayDialog = true;
    }
    handleOrganisationQuit() {
        this.displayDialog = false;
    }

    handleOrganisationUpdate(updatedOrganisation) {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }

    handleOrganisationDeleted(deletedOrganisation) {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }
    handleOrganisationCreated(createdOrganisation: Organisation) {
        // this.organisations.push({...createdOrganisation});
        // const latestQueryParams = this.loadPageSubject$.getValue();
        // this.loadPageSubject$.next(latestQueryParams);
        this.displayDialog = false;
    }
}

