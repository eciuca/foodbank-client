import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MembreFunctionsComponent} from './membre-functions.component';

describe('MembreFunctionsComponent', () => {
  let component: MembreFunctionsComponent;
  let fixture: ComponentFixture<MembreFunctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembreFunctionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembreFunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
