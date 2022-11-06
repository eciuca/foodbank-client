import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MembreFunctionComponent} from './membre-function.component';

describe('MembreFunctionComponent', () => {
  let component: MembreFunctionComponent;
  let fixture: ComponentFixture<MembreFunctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembreFunctionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembreFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
