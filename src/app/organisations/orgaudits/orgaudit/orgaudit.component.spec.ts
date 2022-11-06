import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrgauditComponent} from './orgaudit.component';

describe('OrgauditComponent', () => {
  let component: OrgauditComponent;
  let fixture: ComponentFixture<OrgauditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgauditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgauditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
