import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgbenefdetailComponent } from './orgbenefdetail.component';

describe('OrgbenefdetailComponent', () => {
  let component: OrgbenefdetailComponent;
  let fixture: ComponentFixture<OrgbenefdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgbenefdetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgbenefdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
