import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BeneficiaireEntityService} from '../services/beneficiaire-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {Beneficiaire} from '../model/beneficiaire';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmGender, enmCountry} from '../../shared/enums';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-beneficiaire',
  templateUrl: './beneficiaire.component.html',
  styleUrls: ['./beneficiaire.component.css']
})
export class BeneficiaireComponent implements OnInit {
    @Input()  beneficiaire: Beneficiaire;
    @Output() onBeneficiaireUpdate = new EventEmitter<Beneficiaire>();
    @Output() onBeneficiaireDelete = new EventEmitter<Beneficiaire>();
    @Output() onBeneficiaireQuit = new EventEmitter<Beneficiaire>();
    booCanDeleteAndQuit: boolean;
    civilites: any[];
    countries: any[];
  constructor(
      private beneficiairesService: BeneficiaireEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.civilites =  enmGender;
    this.countries = enmCountry;
    this.booCanDeleteAndQuit = true;
  }

  ngOnInit(): void {

      if (!this.beneficiaire) {
          // we must come from the menu
          console.log('We initialize a new beneficiaire object from the router!');
          this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idClient')),
                  withLatestFrom(this.beneficiairesService.entities$),
                  map(([idClient, beneficiaires]) => beneficiaires.find(beneficiaire => beneficiaire['idClient'].toString() === idClient))
              )
              .subscribe(
                  beneficiaire => this.beneficiaire = beneficiaire
              );

      }
  }

    delete(event: Event, beneficiaire: Beneficiaire) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `Le bénéficiaire ${beneficiaire.nom} ${beneficiaire.prenom} a été détruit`};
                this.beneficiairesService.delete(beneficiaire)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onBeneficiaireDelete.emit(beneficiaire);
                    });
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }

  save(oldBeneficiaire: Beneficiaire, beneficiaireForm: Beneficiaire) {
    const modifiedBeneficiaire = Object.assign({}, oldBeneficiaire, beneficiaireForm);
    this.beneficiairesService.update(modifiedBeneficiaire)
        .subscribe( ()  => {
          this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `Le bénéficiaire ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom}  a été modifié`});
            this.onBeneficiaireUpdate.emit(modifiedBeneficiaire);
        });


  }
    quit(event: Event, oldBeneficiaire: Beneficiaire, beneficiaireForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: 'Your changes may be lost. Are you sure that you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    beneficiaireForm.reset(oldBeneficiaire); // reset in-memory object for next open
                    console.log('We have reset the beneficiaire form to its original value');
                    this.onBeneficiaireQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onBeneficiaireQuit.emit();
        }
    }
}
