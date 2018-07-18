import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {Router} from "@angular/router";

import { AppService } from '../app.service';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  providers: [AppService]
})
export class PaymentComponent implements OnInit {

	countries = [];
	country = {};
	paymentModes = [];
	cardDetails = {};
	cnamePattern = "^[a-z0-9_-]{4,15}$";
	cvvPattern = "^[0-9]{3,4}$";
	isValidFormSubmitted = null;
	paymentOption = {
		name: '',
		img_url: ''
	};
  amountRequired = false;

	paymentForm: FormGroup;
	currentDate = new Date();
	paymentFormVisible = false;
	amount = "";

  constructor(
  	private formBuilder:FormBuilder,
  	private appService: AppService,
  	private router : Router
  ) { 
	this.paymentForm = formBuilder.group({
	    cardName: ['', [Validators.required, Validators.pattern(this.cnamePattern)]],
	    cardNumber: ['', [Validators.required]],
	    month: ['', [Validators.required]],
	    year: ['', [Validators.required]],
	    cvv: ['', [Validators.required, Validators.pattern(this.cvvPattern)]]
  	});
  }

  ngOnInit() {

  	this.appService.getAllContries().subscribe(countries => {
  		this.countries = countries;
  	});

  	this.appService.getCurrentLocation().subscribe(location => {
  		this.country = {
  			Name: location.city,
  			Code: location.countryCode
  		};
  		this.paymentModes = [];
  		this.getPaymentModes(this.country['Code']);
  	});
  }

  get cardName() {
     return this.paymentForm.get('cardName');
  }

  get cardNumber() {
     return this.paymentForm.get('cardNumber');
  }

  get month() {
     return this.paymentForm.get('month');
  }

  get year() {
     return this.paymentForm.get('year');
  }

  get cvv() {
     return this.paymentForm.get('cvv');
  }

  onCountryChange($event) {
  	let countryData = this.countries.find(country => country.Code === $event);
  	this.paymentForm.reset();
  	this.isValidFormSubmitted = true;
  	this.country = countryData;
  	this.paymentFormVisible = false;
  	this.getPaymentModes(this.country['Code']);
  }

  getPaymentModes(countryCode: String) {
	this.appService.getPaymentOptions(countryCode).subscribe(options => {
		this.paymentModes = options;
	});
  }

  onFormSubmit() {
  	this.isValidFormSubmitted = false;
	if(this.amount === "") {
  		this.amountRequired = true;
  	}
  	if(this.paymentForm.invalid)
  	{ return false; }

     if(this.paymentForm.controls.cardName.valid && this.paymentForm.controls.cvv.valid && this.validateMonthYear(this.paymentForm.controls.month.value, this.paymentForm.controls.year.value) && this.validateCarNumber(this.paymentForm.controls.cardNumber.value)) {
     this.isValidFormSubmitted = true;
     this.amountRequired = false;
     } else {
     	this.router.navigate(['error']);
     	return;
     }
     this.router.navigate(['status']);
     this.paymentForm.reset();
  }

  	validateCarNumber(value) {
	  // accept only digits, dashes or spaces
		if (/[^0-9-\s]+/.test(value)) return false;

		// The Luhn Algorithm. It's so pretty.
		var nCheck = 0, nDigit = 0, bEven = false;
		value = value.replace(/\D/g, "");

		for (var n = value.length - 1; n >= 0; n--) {
			var cDigit = value.charAt(n),
				  nDigit = parseInt(cDigit, 10);

			if (bEven) {
				if ((nDigit *= 2) > 9) nDigit -= 9;
			}

			nCheck += nDigit;
			bEven = !bEven;
		}

		return (nCheck % 10) == 0;
	}

	validateMonthYear(month, year) {
		let dummyDate = new Date();
		dummyDate.setFullYear(parseInt(year), parseInt(month), 1);
		if (dummyDate < this.currentDate) {
		   return false;
		}
		return true;
	}

	validateYear(year) {
		if(parseInt(year) >= this.currentDate.getFullYear()) {
			return true;
		}
		return false;
	}

	onPaymentModeSelect(mode) {
		this.paymentOption = mode;
		this.paymentFormVisible = true;
	}

	onKeyPress(evt) {
		var charCode = (evt.which) ? evt.which : evt.keyCode
         if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;

         return true;
	}

}
