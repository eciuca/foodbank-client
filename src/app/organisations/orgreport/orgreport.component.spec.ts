import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgreportComponent } from './orgreport.component';

describe('OrgreportComponent', () => {
  let component: OrgreportComponent;
  let fixture: ComponentFixture<OrgreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
