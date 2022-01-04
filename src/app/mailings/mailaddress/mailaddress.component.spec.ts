import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailaddressComponent } from './mailaddress.component';

describe('MailaddressComponent', () => {
  let component: MailaddressComponent;
  let fixture: ComponentFixture<MailaddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailaddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailaddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
