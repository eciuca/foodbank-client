import {Component, Input, OnInit} from '@angular/core';
import {OrganisationEntityService} from '../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Organisation} from '../model/organisation';
import {MessageService} from 'primeng/api';
interface Statut {
    name: string;
    code: number;
}
interface Civilite {
    name: string;
    code: number;
}
@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit {

  @Input() idDis$: Observable<number>;
  organisation$: Observable<Organisation>;
   statuts: Statut[];
   civilites: Civilite[];

  constructor(
      private organisationsService: OrganisationEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {
      this.statuts = [
          {name: 'Personne Physique', code: 0},
          {name: 'A S B L', code: 1},
          {name: 'Association de Fait', code: 2},
          {name: 'CPAS', code: 3},
          {name: 'Auxiliaire Publique', code: 4}
      ];
      this.civilites = [
          {name: 'Mr.', code: 1},
          {name: 'Mrs', code: 2},
          {name: 'Miss', code: 3}
      ];
  }

  ngOnInit(): void {
// comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
      // or sometimes via a router link via the Main Menu
      if (!this.idDis$) {
          // we must come from the menu
          console.log('We initialize a new organisation object from the router!');
          this.idDis$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idDis')),
                  map(idDisString => Number(idDisString))
              );
      }
      this.organisation$ = this.idDis$
          .pipe(
              withLatestFrom(this.organisationsService.entities$),
              map(([idDis, organisations]) => {
                  console.log('finding organisation with id', idDis);
                  return organisations.find(organisation => idDis === organisation.idDis  );

              })
          );

  }
  delete(organisation: Organisation) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `L'organisation ${organisation.idDis} ${organisation.societe}  a été détruite`};
    this.organisationsService.delete(organisation)
        .subscribe( ()  => {
            this.messageService.add(myMessage);
        });
  }

  save(oldOrganisation: Organisation, organisationForm: Organisation) {
    const modifiedOrganisation = Object.assign({}, oldOrganisation, organisationForm);
    this.organisationsService.update(modifiedOrganisation)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `L'organisation ${modifiedOrganisation.idDis} ${modifiedOrganisation.societe}  a été modifiée`});
         });


  }

}
