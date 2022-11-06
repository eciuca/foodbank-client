import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {DefaultMailAddress, MailAddress} from '../model/mailaddress';
import {NgForm} from '@angular/forms';


@Component({
  selector: 'app-mailaddress',
  templateUrl: './mailaddress.component.html',
  styleUrls: ['./mailaddress.component.css']
})
export class MailaddressComponent implements OnInit {
  mailAddress: MailAddress;
  @ViewChild('mailAddressForm') myform: NgForm;
  @Output() onMailAddressCreate = new EventEmitter<MailAddress>();
  @Output() onMailAddressQuit = new EventEmitter<MailAddress>();
  constructor() { 
    this.mailAddress = new DefaultMailAddress();
  }

  ngOnInit(): void {
  }
  save(oldMailAddress: MailAddress, mailAddressForm: MailAddress) {
    const modifiedMailAddress = Object.assign({}, oldMailAddress, mailAddressForm);
    this.onMailAddressCreate.emit(modifiedMailAddress);
  }

  quit(mailAddress: MailAddress, value) {
    this.onMailAddressQuit.emit();
  }
}
