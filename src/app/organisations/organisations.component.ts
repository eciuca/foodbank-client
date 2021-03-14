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
  title: string;
  cols: any[];

  constructor(private organisationService: OrganisationEntityService,
              private router: Router,
              private store: Store
  ) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
   this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
                if (authState.banque) {
                    switch (authState.user.rights) {
                        case 'Bank':
                        case 'Admin_Banq':
                            this.title = 'Organisations de la ' + authState.banque.bankName;
                            break;
                        case 'Asso':
                        case 'Admin_Asso':
                            this.title = `Banque ${authState.banque.bankName} ${authState.organisation.societe}` ;
                            break;
                        default:
                            this.title = 'Organisations de toutes les banques';
                    }

                } else {
                    this.title = 'Organisations de toutes les banques';
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
      { field: 'idDis', header: 'Identifiant' },
      { field: 'bankShortName', header: 'Banque' },
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
    handleOrganisationQuit() {
        this.displayDialog = false;
    }

    handleOrganisationUpdate(updatedOrganisation) {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }

    handleOrganisationDeleted() {
        // Non-paged nothing to be done
        this.displayDialog = false;
    }
}

