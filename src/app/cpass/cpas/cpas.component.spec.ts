import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CpasComponent} from './cpas.component';

describe('CpasComponent', () => {
  let component: CpasComponent;
  let fixture: ComponentFixture<CpasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CpasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
