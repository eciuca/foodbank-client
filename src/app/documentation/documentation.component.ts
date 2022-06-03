import { Component, OnInit } from '@angular/core';
import {select, Store} from '@ngrx/store';
import {globalAuthState} from '../auth/auth.selectors';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {
  rights: string;
  language: string
  constructor(
      private store: Store
  ) {

  }

  ngOnInit(): void {
    this.store
        .pipe(
            select(globalAuthState),
            map((authState) => {
              if (authState.user) {
                this.rights = authState.user.rights;
                this.language = authState.user.idLanguage;
              }
            })
        ).subscribe();

  }

}
