import { Component, OnInit } from '@angular/core';
import { OrderHistory } from 'src/app/common/order-history';
import { OrderHistoryService } from 'src/app/services/order-history.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {

  orderHistory : OrderHistory[] = [];
  storage : Storage = sessionStorage;

  constructor(private orderHistoryService :  OrderHistoryService) { }

  ngOnInit(): void {
    this.handleOrderDetails();
  }
  handleOrderDetails() {
    this.orderHistoryService.getOrderHistory(JSON.parse(this.storage.getItem("userEmail"))).subscribe((data:any) => {
      if(data){
        console.log(data)
        this.orderHistory = data._embedded.orders;
      }
    })
  }

}
