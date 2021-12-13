import {Component,  OnInit} from '@angular/core';
import {Audit} from './model/audit';
import {AuditEntityService} from './services/audit-entity.service';
import {BehaviorSubject} from 'rxjs';
import {filter, map, mergeMap} from 'rxjs/operators';
import {LazyLoadEvent} from 'primeng/api';

@Component({
  selector: 'app-audits',
  templateUrl: './audits.component.html',
  styleUrls: ['./audits.component.css']
})

export class AuditsComponent implements OnInit {
  loadPageSubject$ = new BehaviorSubject(null);
  selectedAuditId$ = new BehaviorSubject(0);
  audits: Audit[];
  audit: Audit = null;
  loading: boolean;
  first: number;
  totalRecords: number;
  constructor(
      private auditService: AuditEntityService,
  ) {
    this.first = 0;
    this.totalRecords = 0;
  }
  ngOnInit() {
    this.loading = true;
    this.totalRecords = 0;
    this.loadPageSubject$
        .pipe(
            filter(queryParams => !!queryParams),
            mergeMap(queryParams => this.auditService.getWithQuery(queryParams))
        )
        .subscribe(loadedAudits => {
          console.log('Loaded audits from nextpage: ' + loadedAudits.length);
          if (loadedAudits.length > 0) {
            this.totalRecords = loadedAudits[0].totalRecords;
          }  else {
            this.totalRecords = 0;
          }
          this.audits  = loadedAudits;
          this.loading = false;
          this.auditService.setLoaded(true);
        });
  }

  nextPage(event: LazyLoadEvent) {
    console.log('Lazy Loaded Event', event);
    this.loading = true;
    const queryParms = {};
    queryParms['offset'] = event.first.toString();
    queryParms['rows'] = event.rows.toString();
    queryParms['sortOrder'] = event.sortOrder.toString();
    if (event.sortField) {
      queryParms['sortField'] = event.sortField.toString();
    } else {
      queryParms['sortField'] =  'dateIn';
    }
    if (event.filters) {
      if (event.filters.userName && event.filters.userName.value) {
        queryParms['userName'] = event.filters.userName.value;
      }
    }
    this.loadPageSubject$.next(queryParms);
  }
}
