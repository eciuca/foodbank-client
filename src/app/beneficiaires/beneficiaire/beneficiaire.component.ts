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
      private router: Router
  ) {}

  ngOnInit(): void {
    const idClient = this.route.snapshot.paramMap.get('idClient');

    this.beneficiaire$ = this.beneficiairesService.entities$
        .pipe(
            map( beneficiaires => beneficiaires.find(beneficiaire => idClient === beneficiaire.idClient.toString()))
        );
  }
  delete(beneficiaire: Beneficiaire) {
    console.log( 'Delete Called with Beneficiaire:', beneficiaire);
    this.beneficiairesService.delete(beneficiaire)
        .subscribe( ()  => {
          console.log('Beneficiaire was deleted');
          this.router.navigateByUrl('/beneficiaires');
        });
  }

  save(oldBeneficiaire: Beneficiaire, beneficiaireForm: Beneficiaire) {
    const newBeneficiaire = Object.assign({}, oldBeneficiaire, beneficiaireForm);
    console.log( 'Save Called with Beneficiaire:', newBeneficiaire);
    this.beneficiairesService.update(newBeneficiaire)
        .subscribe( ()  => {
          console.log('Beneficiaire was updated');
          this.router.navigateByUrl('/beneficiaires');
        });


  }
  return() {
    this.router.navigateByUrl('/beneficiaires');
  }
}
