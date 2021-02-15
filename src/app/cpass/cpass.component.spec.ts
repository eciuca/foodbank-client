import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpassComponent } from './cpass.component';

describe('CpassComponent', () => {
  let component: CpassComponent;
  let fixture: ComponentFixture<CpassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CpassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
