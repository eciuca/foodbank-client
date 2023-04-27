import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RegionEntityService} from '../../services/region-entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {DefaultRegion, Region} from '../../model/region';
import {ConfirmationService, MessageService} from 'primeng/api';
import {NgForm} from '@angular/forms';
import {combineLatest, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../../../auth/auth.selectors';

@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.css']
})
export class RegionComponent implements OnInit {
  @Input() regId$: Observable<number>;
  region: Region;
  @Output() onRegionUpdate = new EventEmitter<Region>();
  @Output() onRegionCreate = new EventEmitter<Region>();
  @Output() onRegionDelete = new EventEmitter<Region>();
  @Output() onRegionQuit = new EventEmitter<Region>();
  booCanSave: boolean;
  booCanDelete: boolean;
  booCanQuit: boolean;
  bankLink: number;
  constructor(
      private regionsService: RegionEntityService,
      private route: ActivatedRoute,
      private router: Router,
      private store: Store,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
  ) {
    this.booCanDelete = false;
    this.booCanSave = false;
    this.booCanQuit = true;
    this.bankLink = 0;
  }

  ngOnInit(): void {

    const region$ = combineLatest([this.regId$, this.regionsService.entities$])
        .pipe(
            map(([regId, regions]) => regions.find(region => region['regId'] === regId))
        );

    region$.subscribe(
        region => {
          if (region) {
            this.region = region;
          } else {
            this.region = new DefaultRegion();
          }
        }
    );
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.banque) {
                this.bankLink = authState.banque.bankId;
                switch (authState.user.rights) {
                  case 'admin':
                  case 'Admin_Banq':
                    this.booCanSave = true;
                    this.booCanDelete = true;
                    break;
                  default:
                }
              }
            })
        )
        .subscribe();
  }
  delete(event: Event, region: Region) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Confirm Deletion?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const  myMessage = {severity: 'success', summary: 'Delete', detail: `Region ${region.regName} was deleted`};
        this.regionsService.delete(region)
            .subscribe( () => {
              this.messageService.add(myMessage);
              this.onRegionDelete.emit(region);
            });
      }
    });
  }
  save(oldRegion: Region, regionForm: Region) {
    const modifiedRegion = Object.assign({}, oldRegion, regionForm);
    if (modifiedRegion.hasOwnProperty('regId')) {
      this.regionsService.update(modifiedRegion)
          .subscribe( ()  => {
            this.messageService.add({severity: 'success', summary: 'Update', detail: `Region ${modifiedRegion.regName} was updated`});
            this.onRegionUpdate.emit(modifiedRegion);
          });
    } else {
      modifiedRegion.bankLink = this.bankLink;
      this.regionsService.add(modifiedRegion)
          .subscribe((newRegion) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Creation',
              detail: `Region ${newRegion.regName} was created`
            });
            this.onRegionCreate.emit(newRegion);
          });
    }
  }

  quit(event: Event, oldRegion: Region, regionForm: NgForm, formDirty: boolean) {
    if (formDirty) {
      this.confirmationService.confirm({
        target: event.target,
        message: $localize`:@@messageChangesMayBeLost:Your changes may be lost. Are you sure that you want to proceed?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          regionForm.reset( oldRegion); // reset in-memory object for next open
           this.onRegionQuit.emit();
        }
      });
    } else {
       this.onRegionQuit.emit();
    }
  }
}
