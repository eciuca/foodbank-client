import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgfeadoverviewComponent } from './orgfeadoverview.component';

describe('OrgfeadoverviewComponent', () => {
  let component: OrgfeadoverviewComponent;
  let fixture: ComponentFixture<OrgfeadoverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgfeadoverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgfeadoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
