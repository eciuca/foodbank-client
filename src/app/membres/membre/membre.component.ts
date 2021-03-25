import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {MembreEntityService} from '../services/membre-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {DefaultMembre, Membre} from '../model/membre';
import {ConfirmationService, MessageService} from 'primeng/api';
import {enmGender, enmLanguage} from '../../shared/enums';
import {NgForm} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../auth/auth.selectors';
import {AppState} from '../../reducers';

@Component({
  selector: 'app-membre',
  templateUrl: './membre.component.html',
  styleUrls: ['./membre.component.css']
})
export class MembreComponent implements OnInit {
    @Input() batId$: Observable<number>;
    @Output() onMembreUpdate = new EventEmitter<Membre>();
    @Output() onMembreCreate = new EventEmitter<Membre>();
    @Output() onMembreDelete = new EventEmitter<Membre>();
    @Output() onMembreQuit = new EventEmitter<Membre>();
    membre: Membre;
    booCalledFromTable: boolean;
    booCanSave: boolean;
    booCanDelete: boolean;
    booCanQuit: boolean;
    genders: any[];
  languages: any[];
  bankName: string;
  bankShortName: string;
  lienDis: number;
  constructor(
      private membresService: MembreEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store<AppState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.genders =  enmGender;
      this.languages =  enmLanguage;
      this.booCalledFromTable = true;
      this.booCanDelete = false;
      this.booCanSave = false;
      this.booCanQuit = true;
      this.bankName = '';
      this.bankShortName = '';
      this.lienDis = 0;
  }

  ngOnInit(): void {
      // comment: this component is sometimes called from his parent Component with idDepot @Input Decorator,
      // or sometimes via a router link via the Main Menu
      if (!this.batId$) {
          // we must come from the menu
          console.log('We initialize a new membre object from the router!');
          this.booCalledFromTable = false;
          this.booCanQuit = false;
          this.batId$ = this.route.paramMap
              .pipe(
                  map(paramMap => paramMap.get('batId')),
                  map(batIdString => Number(batIdString))
              );
      }
      const membre$ = combineLatest([this.batId$, this.membresService.entities$])
              .pipe(
                  map(([batId, membres]) => membres.find(membre => membre['batId'] === batId))
              );
      membre$.subscribe(
          membre => {
              if (membre) {
                  console.log('Existing Membre : ', membre);
                  this.membre = membre;
              } else {
                  this.membre = new DefaultMembre();
                  console.log('we have a new default membre');
              }
      });
    this.store
      .pipe(
          select(globalAuthState),
          map((authState) => {
               switch (authState.user.rights) {
                      case 'Bank':
                          this.bankName = authState.banque.bankName;
                          this.bankShortName = authState.banque.bankShortName;
                          break;
                      case 'Admin_Banq':
                          this.bankName = authState.banque.bankName;
                          this.bankShortName = authState.banque.bankShortName;
                          this.booCanSave = true;
                          if (this.booCalledFromTable) {
                              this.booCanDelete = true;
                          }
                          break;
                      case 'Asso':
                          this.bankName = authState.banque.bankName;
                          this.bankShortName = authState.banque.bankShortName;
                          this.lienDis = authState.user.idOrg;
                          break;
                      case 'Admin_Asso':
                          this.bankName = authState.banque.bankName;
                          this.bankShortName = authState.banque.bankShortName;
                          this.lienDis = authState.user.idOrg;
                          this.booCanSave = true;
                          if (this.booCalledFromTable) {
                              this.booCanDelete = true;
                          }
                          break;
                      default:
                  }
             })
      )
      .subscribe();
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
      if (modifiedMembre.hasOwnProperty('batId')) {
          console.log('Updating Membre with content:', modifiedMembre);
          this.membresService.update(modifiedMembre)
              .subscribe(() => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Mise à jour',
                      detail: `Le membre ${modifiedMembre.nom} ${modifiedMembre.prenom}  a été modifié`
                  });
                  this.onMembreUpdate.emit(modifiedMembre);
              });
      } else {
          modifiedMembre.bankName = this.bankName;
          modifiedMembre.bankShortName = this.bankShortName;
          modifiedMembre.lienDis = this.lienDis;
          console.log('Creating Membre with content:', modifiedMembre);
          this.membresService.add(modifiedMembre)
              .subscribe((newMembre) => {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Création',
                      detail: `Le membre ${newMembre.nom} ${newMembre.prenom}  a été créé`
                  });
                  this.onMembreCreate.emit(newMembre);
              });
      }
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

