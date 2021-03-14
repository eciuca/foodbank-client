import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {OrganisationEntityService} from '../services/organisation-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable, combineLatest} from 'rxjs';
import {Organisation} from '../model/organisation';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmStatusCompany, enmGender, enmCountry} from '../../shared/enums';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit {

  @Input() idDis$: Observable<number>;
    @Output() onOrganisationUpdate = new EventEmitter<Organisation>();
    @Output() onOrganisationDelete = new EventEmitter<Organisation>();
    @Output() onOrganisationQuit = new EventEmitter<Organisation>();
    booCanDeleteAndQuit: boolean;
  organisation: Organisation;
  genders: any[];
  statuts: any[];
  countries: any[];

  constructor(
      private organisationsService: OrganisationEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.statuts = enmStatusCompany;
      this.genders = enmGender;
      this.countries = enmCountry;
      this.booCanDeleteAndQuit = true;
  }

  ngOnInit(): void {
// comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
      // or sometimes via a router link via the Main Menu
         if (!this.idDis$) {
          // we must come from the menu
          console.log('We initialize a new organisation object from the router!');
          this.booCanDeleteAndQuit = false;
          this.idDis$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idDis')),
                  map(idDisString => Number(idDisString))
              );
      }
      const organisation$ = combineLatest([this.idDis$, this.organisationsService.entities$])
          .pipe(
              map(([idDis, organisations]) => organisations.find(organisation => idDis === organisation.idDis))
          );

      organisation$.subscribe(organisation => {
          this.organisation = organisation;
          console.log('Organisation : ', organisation);
      });
  }
  save(oldOrganisation: Organisation, organisationForm: Organisation) {
    const modifiedOrganisation = Object.assign({}, oldOrganisation, organisationForm);
    this.organisationsService.update(modifiedOrganisation)
        .subscribe( ()  => {
          this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `L'organisation ${modifiedOrganisation.idDis} ${modifiedOrganisation.societe}  a été modifiée`});
         });
  }
    delete(event: Event, organisation: Organisation) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `L' organisation ${organisation.societe} a été détruite`};
                this.organisationsService.delete(organisation)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onOrganisationDelete.emit();
                    });
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }
    quit(event: Event, oldOrganisation: Organisation, organisationForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: 'Your changes may be lost. Are you sure that you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    organisationForm.reset( oldOrganisation); // reset in-memory object for next open
                    console.log('We have reset the form to its original value');
                    this.onOrganisationQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onOrganisationQuit.emit();
        }
    }
}
