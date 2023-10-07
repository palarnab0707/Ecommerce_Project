import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { MyValidators } from 'src/app/validators/my-validators';
import { CartService } from 'src/app/services/cart.service';
import { Order } from 'src/app/common/order';
import { Purchase } from 'src/app/common/purchase';
import { OrderItem } from 'src/app/common/order-item';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from 'src/app/common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;
  
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage:  Storage = sessionStorage;
  
  //Initialize the stripe api
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo : PaymentInfo = new PaymentInfo();
  cardElements : any;
  displayError : any = "";
  isDisabled: boolean = false;
  
  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopFormService,
              private cartService: CartService,
              private checkoutService : CheckoutService,
              private router : Router) { }

  ngOnInit(): void {
    
    this.reviewCartDetails();
    this.setupStripePaymentForm();
    const theEmail = JSON.parse(this.storage.getItem("userEmail")) === null ? '' : JSON.parse(this.storage.getItem("userEmail"))
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', 
                              [Validators.required, 
                               Validators.minLength(2), 
                               MyValidators.Whitespace]),

        lastName:  new FormControl('', 
                              [Validators.required, 
                               Validators.minLength(2), 
                               MyValidators.Whitespace]),
                               
        email: new FormControl(theEmail,
                              [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), 
                                     MyValidators.Whitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), 
                                   MyValidators.Whitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), 
                                      MyValidators.Whitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), 
          MyValidators.Whitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), 
          MyValidators.Whitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), 
                                      MyValidators.Whitespace])
      }),
      creditCard: this.formBuilder.group({
        /*cardType: new FormControl('', [Validators.required]),
        nameOnCard:  new FormControl('', [Validators.required, Validators.minLength(2), 
          MyValidators.Whitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']*/
      })
    });
    
/*
    // populate credit card months

    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate credit card years

    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
*/
    // populate countries

    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }
  setupStripePaymentForm() {
    // get a handle to the stripe element
    var elements = this.stripe.elements();

    // create a card element .. and hide the zip/postalcode
    this.cardElements = elements.create('card', { hidePostalCode : true})

    // add an instance of card ui component into the "card-element" div
    this.cardElements.mount('#card-element');

    // add event binding for change event in card element
    this.cardElements.on('change', (event : any) =>{
      this.displayError = document.getElementById("card-errors");
      console.log("Display error ------------------> ",this.displayError)
      if(event.complete){
        this.displayError.textContent = "";
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    })
  }

  reviewCartDetails() {

    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

    console.log(`totalprice = ${this.totalPrice}, totalquantity = ${this.totalQuantity}`)

  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }



  copyShippingAddressToBillingAddress(event) {

    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
            .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // bug fix for states
      this.billingAddressStates = this.shippingAddressStates;

    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      // bug fix for states
      this.billingAddressStates = [];
    }
    
  }

  onSubmit() {
    
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way of doing the same thingy
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();
   
    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
   
    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;
 
    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // convert the total amount
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;
  
    // if the form is valid
    // -create payment intent
    // -confirm payment
    // -place the order
    if(!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {
      this.isDisabled = true;
      this.checkoutService.createPaymentIndent(this.paymentInfo).subscribe((response:any) => {
        if(response) {
          this.stripe.confirmCardPayment(response.client_secret,
            {
              payment_method : {
                card : this.cardElements,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry.value.code
                  }
                }
              },
            }, {handleActions : false}).then((result:any) => {
              if(result.error) {
                alert(`There was an error : ${result.error.message}`)
                this.isDisabled = false;
              } else {
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (purchaseResponse:any) => {
                    alert(`Your order has been recieved.\nOrder Tracking Number : ${purchaseResponse.orderTrackingNumber}`)
                    
                    this.resetCart();
                    this.isDisabled = false;
                  }, error:(err:any) => {
                    alert(`There was an error : ${err.message}`)
                    this.isDisabled = false;
                  }
                })
              }
            })
        }
      })
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

/*     // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          // reset cart
          this.resetCart();

        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    ); */
  
  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();
   
    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    // if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data; 
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup.get('state').setValue(data[0]);
      }
    );
  }
}
