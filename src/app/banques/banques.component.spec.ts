import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BanquesComponent} from './banques.component';

describe('BanquesComponent', () => {
  let component: BanquesComponent;
  let fixture: ComponentFixture<BanquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BanquesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BanquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
