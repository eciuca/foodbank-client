import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgonereportComponent } from './orgonereport.component';

describe('OrgonereportComponent', () => {
  let component: OrgonereportComponent;
  let fixture: ComponentFixture<OrgonereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgonereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgonereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
