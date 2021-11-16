import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersRightsComponent } from './users-rights.component';

describe('UsersRightsComponent', () => {
  let component: UsersRightsComponent;
  let fixture: ComponentFixture<UsersRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersRightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
