import {Component, Input, OnInit} from '@angular/core';
import {BeneficiaireEntityService} from '../services/beneficiaire-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Beneficiaire} from '../model/beneficiaire';
import {MessageService} from 'primeng/api';
import {enmGender, enmCountry} from '../../shared/enums';

@Component({
  selector: 'app-beneficiaire',
  templateUrl: './beneficiaire.component.html',
  styleUrls: ['./beneficiaire.component.css']
})
export class BeneficiaireComponent implements OnInit {
  @Input()  idBeneficiaire$: Observable<number>;
  beneficiaire$: Observable<Beneficiaire>;
  civilites: any[];
  countries: any[];
  constructor(
      private beneficiairesService: BeneficiaireEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {
    this.civilites =  enmGender;
    this.countries = enmCountry;
  }

  ngOnInit(): void {

      if (!this.idBeneficiaire$) {
          // we must come from the menu
          console.log('We initialize a new beneficiaire object from the router!');
          this.idBeneficiaire$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('idClient')),
                  map(idBeneficiaireString => Number(idBeneficiaireString))
              );
      }

      this.beneficiaire$ = this.idBeneficiaire$
          .pipe(
              withLatestFrom(this.beneficiairesService.entities$),
              map(([idClient, beneficiaires]) => beneficiaires.find(beneficiaire => idClient === beneficiaire.idClient))
          );
  }

  delete(beneficiaire: Beneficiaire) {
      const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `Le bénéficiaire ${beneficiaire.nom} ${beneficiaire.prenom}  a été détruit`};
      this.beneficiairesService.delete(beneficiaire)
        .subscribe( ()  => {
            this.messageService.add(myMessage);
        });
  }

  save(oldBeneficiaire: Beneficiaire, beneficiaireForm: Beneficiaire) {
    const modifiedBeneficiaire = Object.assign({}, oldBeneficiaire, beneficiaireForm);
    this.beneficiairesService.update(modifiedBeneficiaire)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `Le bénéficiaire ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom}  a été modifié`});
        });


  }

}
