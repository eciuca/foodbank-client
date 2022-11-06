import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BanqprogComponent} from './banqprog.component';

describe('BanqprogComponent', () => {
  let component: BanqprogComponent;
  let fixture: ComponentFixture<BanqprogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BanqprogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BanqprogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
