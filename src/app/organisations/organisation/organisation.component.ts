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
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const idDis = this.route.snapshot.paramMap.get('idDis');

    this.organisation$ = this.organisationsService.entities$
        .pipe(
            map( organisations => organisations.find(organisation => idDis === organisation.idDis.toString()))
        );
  }
  delete(organisation: Organisation) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `La banque ${organisation.idDis} ${organisation.societe}  a été détruite`};
    this.organisationsService.delete(organisation)
        .subscribe( ()  => {
            this.messageService.add(myMessage);
            this.router.navigateByUrl('/organisations');
        });
  }

  save(oldOrganisation: Organisation, organisationForm: Organisation) {
    const modifiedOrganisation = Object.assign({}, oldOrganisation, organisationForm);
    this.organisationsService.update(modifiedOrganisation)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `La banque ${modifiedOrganisation.idDis} ${modifiedOrganisation.societe}  a été modifiée`});
          this.router.navigateByUrl('/organisations');
        });


  }
  return() {
    this.router.navigateByUrl('/organisations');
  }
}
