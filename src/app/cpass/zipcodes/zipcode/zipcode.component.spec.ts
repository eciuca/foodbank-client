import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipCodeComponent } from './zipcode.component';

describe('ZipcodeComponent', () => {
  let component: ZipCodeComponent;
  let fixture: ComponentFixture<ZipCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZipCodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZipCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
