import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgcontactsComponent } from './orgcontacts.component';

describe('OrgcontactsComponent', () => {
  let component: OrgcontactsComponent;
  let fixture: ComponentFixture<OrgcontactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgcontactsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgcontactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
