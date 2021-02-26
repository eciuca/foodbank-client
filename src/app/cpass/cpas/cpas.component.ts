import {Component, Input, OnInit} from '@angular/core';
import {CpasEntityService} from '../services/cpas-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Cpas} from '../model/cpas';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-cpas',
  templateUrl: './cpas.component.html',
  styleUrls: ['./cpas.component.css']
})
export class CpasComponent implements OnInit {
    @Input() idCpas$: Observable<number>;
  cpas$: Observable<Cpas>;
  constructor(
      private cpassService: CpasEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
      if (!this.idCpas$) {
          // we must come from the menu
          console.log('We initialize a new cpas object from the router!');
          this.idCpas$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('cpasId')),
                  map(idCpasString => Number(idCpasString))
              );
      }

      this.cpas$ = this.idCpas$
          .pipe(
              withLatestFrom(this.cpassService.entities$),
              map(([cpasId, cpass]) => cpass.find(cpas => cpasId === cpas.cpasId))
          );
  }

  delete(cpas: Cpas) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `Le cpas ${cpas.cpasName} a été détruit`};
    this.cpassService.delete(cpas)
        .subscribe( ()  => {
          this.messageService.add(myMessage);
        });
  }

  save(oldCpas: Cpas, cpasForm: Cpas) {
    const modifiedCpas = Object.assign({}, oldCpas, cpasForm);
    this.cpassService.update(modifiedCpas)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `Le cpas ${modifiedCpas.cpasName} a été modifié`});
        });


  }
}

