import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrgauditsComponent} from './orgaudits.component';

describe('OrgauditsComponent', () => {
  let component: OrgauditsComponent;
  let fixture: ComponentFixture<OrgauditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgauditsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgauditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
