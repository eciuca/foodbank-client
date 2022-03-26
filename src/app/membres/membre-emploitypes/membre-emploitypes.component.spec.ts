import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembreEmploitypesComponent } from './membre-emploitypes.component';

describe('MembreEmploitypesComponent', () => {
  let component: MembreEmploitypesComponent;
  let fixture: ComponentFixture<MembreEmploitypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembreEmploitypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembreEmploitypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
