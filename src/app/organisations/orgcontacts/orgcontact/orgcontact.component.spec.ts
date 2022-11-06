import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrgcontactComponent} from './orgcontact.component';

describe('OrgcontactComponent', () => {
  let component: OrgcontactComponent;
  let fixture: ComponentFixture<OrgcontactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgcontactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgcontactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
