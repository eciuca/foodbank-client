import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {MembreEntityService} from '../services/membre-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Membre} from '../model/membre';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmGender, enmLanguage} from '../../shared/enums';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-membre',
  templateUrl: './membre.component.html',
  styleUrls: ['./membre.component.css']
})
export class MembreComponent implements OnInit {
    @Input() membre: Membre;
    @Output() onMembreUpdate = new EventEmitter<Membre>();
    @Output() onMembreDelete = new EventEmitter<Membre>();
    @Output() onMembreQuit = new EventEmitter<Membre>();
    booCanDeleteAndQuit: boolean;
  membre$: Observable<Membre>;
  genders: any[];
  languages: any[];
  constructor(
      private membresService: MembreEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.genders =  enmGender;
      this.languages =  enmLanguage;
      this.booCanDeleteAndQuit = true;
  }

  ngOnInit(): void {
      // comment: this component is sometimes called from his parent Component with idDepot @Input Decorator,
      // or sometimes via a router link via the Main Menu
      if (!this.membre) {
          // we must come from the menu
          console.log('We initialize a new membre object from the router!');
          this.booCanDeleteAndQuit = false;
          this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('batId')),
                  withLatestFrom(this.membresService.entities$),
                  map(([batId, membres]) => membres.find(membre => membre['batId'].toString() === batId))
              )

              .subscribe(
                  membre => this.membre = membre
              );
      }
  }
    delete(event: Event, membre: Membre) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `Le membre ${membre.prenom} ${membre.nom} a été détruit`};
                this.membresService.delete(membre)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onMembreDelete.emit(membre);
                    });
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }

  save(oldMembre: Membre, membreForm: Membre) {
    const modifiedMembre = Object.assign({}, oldMembre, membreForm);
    this.membresService.update(modifiedMembre)
        .subscribe( ()  => {
          this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `Le membre ${modifiedMembre.nom} ${modifiedMembre.prenom}  a été modifié`});
          this.onMembreUpdate.emit(modifiedMembre);
        });
  }

    quit(event: Event, oldMembre: Membre, membreForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: 'Your changes may be lost. Are you sure that you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    membreForm.reset(oldMembre); // reset in-memory object for next open
                    console.log('We have reset the membre form to its original value');
                    this.onMembreQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onMembreQuit.emit();
        }
    }
}

