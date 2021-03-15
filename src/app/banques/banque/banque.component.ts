import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {BanqueEntityService} from '../services/banque-entity.service';
import {MembreEntityService} from '../../membres/services/membre-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {Banque} from '../model/banque';
import {ConfirmationService, MessageService} from 'primeng/api';
import { Input } from '@angular/core';
import {NgForm} from '@angular/forms';
import {QueryParams} from '@ngrx/data';
import {Membre} from '../../membres/model/membre';



@Component({
  selector: 'app-banque',
  templateUrl: './banque.component.html',
  styleUrls: ['./banque.component.css']
})
export class BanqueComponent implements OnInit {

  @Input() bankId$: Observable<number>;
    @Output() onBanqueUpdate = new EventEmitter<Banque>();
    @Output() onBanqueDelete = new EventEmitter<Banque>();
    @Output() onBanqueQuit = new EventEmitter<Banque>();
    booCanDeleteAndQuit: boolean;
  banque: Banque;
    selectedPresident: Membre;
    filteredMembres: any[];
  constructor(
      private banquesService: BanqueEntityService,
      private membresService: MembreEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
      this.booCanDeleteAndQuit = true;
    }

  ngOnInit(): void {
      // comment: this component is sometimes called from his parent Component with BankId @Input Decorator,
      // or sometimes via a router link via the Main Menu
      if (!this.bankId$) {
          // we must come from the menu
          console.log('We initialize a new banque object from the router!');
          this.booCanDeleteAndQuit = false;
          this.bankId$ = this.route.paramMap
            .pipe(
              map(paramMap => paramMap.get('bankId')),
              map(bankIdString => Number(bankIdString))
            );
      }

      const bank$ = combineLatest([this.bankId$, this.banquesService.entities$])
        .pipe(
          map(([bankId, banques]) => banques.find(banque => bankId === banque.bankId))
        );

      bank$.subscribe(banque => {
          this.banque = banque;
          console.log('Banque : ', banque);
          this.membresService.getByKey(banque.idMemberPres)
              .subscribe(
                  membre => {
                      this.selectedPresident =  Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom});
                      console.log('our president:', this.selectedPresident);
                  });
        });
}

    filterMembre(event) {
      const  queryMemberParms: QueryParams = {};
        const query = event.query;
        queryMemberParms['offset'] = '0';
        queryMemberParms['rows'] = '10';
        queryMemberParms['sortField'] = 'nom';
        queryMemberParms['sortOrder'] = '1';
        queryMemberParms['searchField'] = 'nom';
        queryMemberParms['searchValue'] = query.toLowerCase();
        this.membresService.getWithQuery(queryMemberParms)
        .subscribe(filteredMembres => {
            this.filteredMembres = filteredMembres.map((membre) =>
                Object.assign({}, membre, {fullname: membre.nom + ' ' + membre.prenom})
            );
        });
    }

 save(oldBanque: Banque, banqueForm: Banque) {
      console.log('Banque Form value', banqueForm);
      const modifiedBanque = Object.assign({}, oldBanque, banqueForm);
      modifiedBanque.idMemberPres = this.selectedPresident.batId;
    this.banquesService.update(modifiedBanque)
        .subscribe( ()  => {
          this.messageService.add({severity: 'success', summary: 'Mise à jour', detail: `La banque ${modifiedBanque.bankShortName} ${modifiedBanque.bankName}  a été modifiée`});
          this.onBanqueUpdate.emit(modifiedBanque);
        });
  }
    delete(event: Event, banque: Banque) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Confirm Deletion?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const  myMessage = {severity: 'success', summary: 'Destruction', detail: `Le banque ${banque.bankName} a été détruite`};
                this.banquesService.delete(banque)
                    .subscribe( () => {
                        this.messageService.add(myMessage);
                        this.onBanqueDelete.emit();
                    });
            },
            reject: () => {
                console.log('We do nothing');
            }
        });
    }
    quit(event: Event, oldBanque: Banque, banqueForm: NgForm, formDirty: boolean) {
        if (formDirty) {
            this.confirmationService.confirm({
                target: event.target,
                message: 'Your changes may be lost. Are you sure that you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    banqueForm.reset( oldBanque); // reset in-memory object for next open
                    console.log('We have reset the form to its original value');
                    this.onBanqueQuit.emit();
                },
                reject: () => {
                    console.log('We do nothing');
                }
            });
        } else {
            console.log('Form is not dirty, closing');
            this.onBanqueQuit.emit();
        }
    }
}

