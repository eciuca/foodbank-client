import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DonateursComponent} from './donateurs.component';

describe('DonateursComponent', () => {
  let component: DonateursComponent;
  let fixture: ComponentFixture<DonateursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonateursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DonateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
