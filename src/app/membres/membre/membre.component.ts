import { Component, OnInit } from '@angular/core';
import {MembreEntityService} from '../services/membre-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Membre} from '../model/membre';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-membre',
  templateUrl: './membre.component.html',
  styleUrls: ['./membre.component.css']
})
export class MembreComponent implements OnInit {

  membre$: Observable<Membre>;
  constructor(
      private membresService: MembreEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const batId = this.route.snapshot.paramMap.get('batId');

    this.membre$ = this.membresService.entities$
        .pipe(
            map( membres => membres.find(membre => batId === membre.batId.toString()))
        );
  }
  delete(membre: Membre) {
    const  myMessage = {severity: 'succes', summary: 'Destruction', detail: `Le membre ${membre.nom} ${membre.prenom}  a été détruit`};
    this.membresService.delete(membre)
        .subscribe( ()  => {
          this.messageService.add(myMessage);
          this.router.navigateByUrl('/membres');
        });
  }

  save(oldMembre: Membre, membreForm: Membre) {
    const modifiedMembre = Object.assign({}, oldMembre, membreForm);
    this.membresService.update(modifiedMembre)
        .subscribe( ()  => {
          this.messageService.add({severity: 'succes', summary: 'Mise à jour', detail: `Le membre ${modifiedMembre.nom} ${modifiedMembre.prenom}  a été modifié`});
          this.router.navigateByUrl('/membres');
        });


  }
  return() {
    this.router.navigateByUrl('/membres');
  }
}

