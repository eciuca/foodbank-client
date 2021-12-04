import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanqprogsComponent } from './banqprogs.component';

describe('BanqprogsComponent', () => {
  let component: BanqprogsComponent;
  let fixture: ComponentFixture<BanqprogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BanqprogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BanqprogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
