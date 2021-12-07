import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgMembershipMailingComponent } from './org-membership-mailing.component';

describe('OrgMembershipMailingComponent', () => {
  let component: OrgMembershipMailingComponent;
  let fixture: ComponentFixture<OrgMembershipMailingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgMembershipMailingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgMembershipMailingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
