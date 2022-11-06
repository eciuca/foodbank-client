import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrgMembershipComponent} from './org-membership.component';

describe('OrgMembershipComponent', () => {
  let component: OrgMembershipComponent;
  let fixture: ComponentFixture<OrgMembershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgMembershipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgMembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
