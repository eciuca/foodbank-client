import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrgbenefoverviewComponent} from './orgbenefoverview.component';

describe('OrgbenefoverviewComponent', () => {
  let component: OrgbenefoverviewComponent;
  let fixture: ComponentFixture<OrgbenefoverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgbenefoverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgbenefoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
