import { Component, OnInit } from '@angular/core';
import {CpasEntityService} from '../services/cpas-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Cpas} from '../model/cpas';
import {MessageService} from 'primeng/api';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-cpas',
  templateUrl: './cpas.component.html',
  styleUrls: ['./cpas.component.css']
})
export class CpasComponent implements OnInit {

  cpas$: Observable<Cpas>;
  constructor(
      private cpassService: CpasEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const cpasId = this.route.snapshot.paramMap.get('cpasId');

    this.cpas$ = this.cpassService.entities$
        .pipe(
            map( cpass => cpass.find(cpas => cpasId === cpas.cpasId.toString()))
        );
  }
  delete(cpas: Cpas) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `Le cpas ${cpas.cpasName} a été détruit`};
    this.cpassService.delete(cpas)
        .subscribe( ()  => {
          this.messageService.add(myMessage);
          this.router.navigateByUrl('/cpass');
        });
  }

  save(oldCpas: Cpas, cpasForm: Cpas) {
    const modifiedCpas = Object.assign({}, oldCpas, cpasForm);
    this.cpassService.update(modifiedCpas)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `Le cpas ${modifiedCpas.cpasName} a été modifié`});
          this.router.navigateByUrl('/cpass');
        });


  }
  return() {
    this.router.navigateByUrl('/cpases');
  }
}

