import {Component, Input, OnInit} from '@angular/core';
import {OrganisationEntityService} from '../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Organisation} from '../model/organisation';
import {MessageService} from 'primeng/api';
import {statut, civilite} from '../../shared/enums';

@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit {

  @Input() idDis$: Observable<number>;
  organisation$: Observable<Organisation>;
  civilites: any[];
  statuts: any[];

  constructor(
      private organisationsService: OrganisationEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {
      // Helper
      const StringIsNumber = value => isNaN(Number(value)) === false;
      // Note typescript needs filter to avoid reverse number to string entries when converting enum to object array
      this.statuts = Object.keys(statut).filter(StringIsNumber).map(key => ({ name: statut[key], code: key }));
      this.civilites = Object.keys(civilite).filter(StringIsNumber).map(key => ({ name: civilite[key], code: key }));
  }

  ngOnInit(): void {
// comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
      // or sometimes via a router link via the Main Menu
      console.log('Statuts:', this.statuts);
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
