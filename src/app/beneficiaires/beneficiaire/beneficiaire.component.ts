import { Component, OnInit } from '@angular/core';
import {BeneficiaireEntityService} from '../services/beneficiaire-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Beneficiaire} from '../model/beneficiaire';
import {MessageService} from 'primeng/api';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'beneficiaire',
  templateUrl: './beneficiaire.component.html',
  styleUrls: ['./beneficiaire.component.css']
})
export class BeneficiaireComponent implements OnInit {

  beneficiaire$: Observable<Beneficiaire>;
  constructor(
      private beneficiairesService: BeneficiaireEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const idClient = this.route.snapshot.paramMap.get('idClient');

    this.beneficiaire$ = this.beneficiairesService.entities$
        .pipe(
            map( beneficiaires => beneficiaires.find(beneficiaire => idClient === beneficiaire.idClient.toString()))
        );
  }
  delete(beneficiaire: Beneficiaire) {
      const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `Le bénéficiaire ${beneficiaire.nom} ${beneficiaire.prenom}  a été détruit`};
      this.beneficiairesService.delete(beneficiaire)
        .subscribe( ()  => {
            this.messageService.add(myMessage);
          this.router.navigateByUrl('/beneficiaires');
        });
  }

  save(oldBeneficiaire: Beneficiaire, beneficiaireForm: Beneficiaire) {
    const modifiedBeneficiaire = Object.assign({}, oldBeneficiaire, beneficiaireForm);
    this.beneficiairesService.update(modifiedBeneficiaire)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `Le bénéficiaire ${modifiedBeneficiaire.nom} ${modifiedBeneficiaire.prenom}  a été modifié`});
          this.router.navigateByUrl('/beneficiaires');
        });


  }
  return() {
    this.router.navigateByUrl('/beneficiaires');
  }
}
