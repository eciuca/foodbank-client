import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrgMembershipsComponent} from './org-memberships.component';

describe('OrgMembershipsComponent', () => {
  let component: OrgMembershipsComponent;
  let fixture: ComponentFixture<OrgMembershipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgMembershipsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgMembershipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
