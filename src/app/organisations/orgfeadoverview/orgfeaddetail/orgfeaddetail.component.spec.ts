import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrgfeaddetailComponent} from './orgfeaddetail.component';

describe('OrgfeaddetailComponent', () => {
  let component: OrgfeaddetailComponent;
  let fixture: ComponentFixture<OrgfeaddetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgfeaddetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgfeaddetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
