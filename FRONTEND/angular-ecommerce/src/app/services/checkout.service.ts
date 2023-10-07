import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchase } from '../common/purchase';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from '../common/payment-info';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl = environment.shopCartUrlLocal + "checkout/purchase";
  private paymentUrl = environment.shopCartUrlLocal + "checkout/payment-intent";


  constructor(private httpClient : HttpClient) { }

  placeOrder(puchase : Purchase) : Observable<any>{
    return this.httpClient.post<Purchase>(this.purchaseUrl, puchase);
  }

  createPaymentIndent(paymentInfo: PaymentInfo) : Observable<any>{
    return this.httpClient.post<PaymentInfo>(this.paymentUrl,paymentInfo);
  }
}
