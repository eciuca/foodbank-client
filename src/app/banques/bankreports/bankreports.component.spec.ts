import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankreportsComponent } from './bankreports.component';

describe('BankreportsComponent', () => {
  let component: BankreportsComponent;
  let fixture: ComponentFixture<BankreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankreportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
