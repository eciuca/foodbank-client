import { Component, OnInit } from '@angular/core';
import { Organisation } from './model/organisation';
import {OrganisationEntityService} from './services/organisation-entity.service';
import {concatMap, map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.css']
})

export class OrganisationsComponent implements OnInit {
  organisation: Organisation = null;
  organisations$: Observable<Organisation[]>;
  cols: any[];
  displayDialog: boolean;

  constructor(private organisationService: OrganisationEntityService) { }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.organisations$  = this.organisationService.entities$
        .pipe(
            tap( (organisationsEntities) => {
              console.log('Organisations now loaded:', organisationsEntities); }),
        )
    ;
    this.cols = [
      { field: 'idDis', header: 'Identifiant' },
      { field: 'lienBanque', header: 'Banque' },
      { field: 'societe', header: 'Nom' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'cp', header: 'Code Postal' },
      { field: 'localite', header: 'Commune' }
    ];

  }
  handleSelect(organisation) {
    console.log( 'Organisation was selected', organisation);
    this.organisation = {...organisation};
    this.displayDialog = true;
  }

  delete() {
    console.log( 'Delete Called with Organisation:', this.organisation);
    this.organisationService.delete(this.organisation);
    this.organisation = null;
    this.displayDialog = false;
  }

  save() {
    console.log( 'Save Called with Organisation:', this.organisation);
    this.organisationService.update(this.organisation);
    this.organisation = null;
    this.displayDialog = false;
  }
}

