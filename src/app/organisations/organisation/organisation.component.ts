import { Component, OnInit } from '@angular/core';
import {OrganisationEntityService} from '../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Organisation} from '../model/organisation';
import {MessageService} from 'primeng/api';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit {

  organisation$: Observable<Organisation>;
  constructor(
      private organisationsService: OrganisationEntityService,
      private route: ActivatedRoute,
      private router: Router
  ) {}

  ngOnInit(): void {
    const idDis = this.route.snapshot.paramMap.get('idDis');

    this.organisation$ = this.organisationsService.entities$
        .pipe(
            map( organisations => organisations.find(organisation => idDis === organisation.idDis.toString()))
        );
  }
  delete(organisation: Organisation) {
    console.log( 'Delete Called with Organisation:', organisation);
    this.organisationsService.delete(organisation)
        .subscribe( ()  => {
          console.log('Organisation was deleted');
          this.router.navigateByUrl('/organisations');
        });
  }

  save(oldOrganisation: Organisation, organisationForm: Organisation) {
    const newOrganisation = Object.assign({}, oldOrganisation, organisationForm);
    console.log( 'Save Called with Organisation:', newOrganisation);
    this.organisationsService.update(newOrganisation)
        .subscribe( ()  => {
          console.log('Organisation was updated');
          this.router.navigateByUrl('/organisations');
        });


  }
  return() {
    this.router.navigateByUrl('/organisations');
  }
}
