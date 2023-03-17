import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipcodesComponent } from './zipcodes.component';

describe('ZipcodesComponent', () => {
  let component: ZipcodesComponent;
  let fixture: ComponentFixture<ZipcodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZipcodesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZipcodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
