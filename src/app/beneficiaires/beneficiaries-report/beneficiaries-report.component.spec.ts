import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiariesReportComponent } from './beneficiaries-report.component';

describe('BeneficiariesReportComponent', () => {
  let component: BeneficiariesReportComponent;
  let fixture: ComponentFixture<BeneficiariesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeneficiariesReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneficiariesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
