import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MembreEmploitypeComponent} from './membre-emploitype.component';

describe('MembreEmploitypeComponent', () => {
  let component: MembreEmploitypeComponent;
  let fixture: ComponentFixture<MembreEmploitypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembreEmploitypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembreEmploitypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
