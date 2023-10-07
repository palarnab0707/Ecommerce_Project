import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  constructor(private httpClient : HttpClient) { }

  getOrderHistory(theEmail : string) : Observable<OrderHistoryResponse> {
    return this.httpClient.get<OrderHistoryResponse>(`${environment.shopCartUrlLocal}orders/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}`)
  }
}

interface OrderHistoryResponse{
  _embedded : {
    order : OrderHistory[];
  }
}
