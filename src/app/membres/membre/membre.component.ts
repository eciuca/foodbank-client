import {Component, Input, OnInit} from '@angular/core';
import {MembreEntityService} from '../services/membre-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Membre} from '../model/membre';
import {MessageService} from 'primeng/api';
import {enmGender, enmLanguage} from '../../shared/enums';

@Component({
  selector: 'app-membre',
  templateUrl: './membre.component.html',
  styleUrls: ['./membre.component.css']
})
export class MembreComponent implements OnInit {
    @Input() idMembre$: Observable<number>;
  membre$: Observable<Membre>;
  genders: any[];
  languages: any[];
  constructor(
      private membresService: MembreEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {
      this.genders =  enmGender;
      this.languages =  enmLanguage;
  }

  ngOnInit(): void {
      // comment: this component is sometimes called from his parent Component with idDepot @Input Decorator,
      // or sometimes via a router link via the Main Menu
      if (!this.idMembre$) {
          // we must come from the menu
          console.log('We initialize a new membre object from the router!');
          this.idMembre$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('batId')),
                  map(idMembreString => Number(idMembreString))
              );
      }
      this.membre$ = this.idMembre$
          .pipe(
              withLatestFrom(this.membresService.entities$),
              map(([batId, membres]) => membres.find(membre => batId === membre.batId))
          );
  }
  delete(membre: Membre) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `Le membre ${membre.nom} ${membre.prenom}  a été détruit`};
    this.membresService.delete(membre)
        .subscribe( ()  => {
          this.messageService.add(myMessage);
        });
  }

  save(oldMembre: Membre, membreForm: Membre) {
    const modifiedMembre = Object.assign({}, oldMembre, membreForm);
    this.membresService.update(modifiedMembre)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `Le membre ${modifiedMembre.nom} ${modifiedMembre.prenom}  a été modifié`});
        });
  }

}

