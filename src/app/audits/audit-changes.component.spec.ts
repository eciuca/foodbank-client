import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditChangesComponent } from './audit-changes.component';

describe('AuditChangesComponent', () => {
  let component: AuditChangesComponent;
  let fixture: ComponentFixture<AuditChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditChangesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
