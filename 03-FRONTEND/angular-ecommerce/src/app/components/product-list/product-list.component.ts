import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  //templateUrl: './product-list.component.html',
  //templateUrl: './product-list-table.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId!: number;
  previousCategoryId: number = 1;
  currentCategoryName:string ="";
  searchMode: boolean = false;
  theKeyWord : string = "";

  //new properties for pagination

  thePageNumber : number = 1;
  thePageSize : number =5;
  theTotalElements : number =0;


  previousKeyword : string = null;
  

  constructor(private productService: ProductService,private cartService:CartService, private route : ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode){
      this.handleSearchProducts();
    }
    else{
      this.handleListProducts();
    }
  }

  handleSearchProducts(){
    // @ts-ignore: Object is possibly 'null'.
    this.theKeyWord = this.route.snapshot.paramMap.get('keyword');

    console.log(this.theKeyWord);
   
    //If we have defferent keywprd than previous one then we will set the pagenumber to 1

    if(this.previousKeyword != this.theKeyWord){
      this.thePageNumber = 1;
    }

    this.previousKeyword = this.theKeyWord;

    console.log(`keyword=${this.theKeyWord}, pagenumber=${this.thePageNumber}`);    
    this.productService.searchProductsPaginate(this.thePageNumber-1,this.thePageSize,this.theKeyWord).subscribe(
      this.processResult()
    );

    //now get the products for the given category id
    this.productService.searchProductsPaginate(this.thePageNumber-1,this.thePageSize,this.theKeyWord).subscribe(this.processResult());
  }

  handleListProducts(){
    // check if 'id' parameter is available
    const hasCategoryId : boolean = this.route.snapshot.paramMap.has('id');
    console.log(hasCategoryId);
    if(hasCategoryId == true){
      // @ts-ignore: Object is possibly 'null'.
      this.currentCategoryId =+ this.route.snapshot.paramMap.get('id');
      // @ts-ignore: Object is possibly 'null'.
      this.currentCategoryName = this.route.snapshot.paramMap.get('name');
    }
    else{
      //if not available just use id as 1
      this.currentCategoryId =1 ;
      this.currentCategoryName= 'Books';
    }

    //check if we have a differen category than previous
    //note : Angular will reuse the components if it is curently in view, means angular will have a state, thats why we need an additional operations here.
    //if we have different category id than previous than we have to reset the page number back to 1.

    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);


    this.productService.getProductlistPaginate(this.thePageNumber-1,this.thePageSize,this.currentCategoryId).subscribe(this.processResult());
  }
  processResult() {
    return data => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number+1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
    
  }
  updatePageSize(pageSize:number){
    this.thePageSize=pageSize;
    this.thePageNumber=1;
    this.listProducts();
  }

  addToCart(theProduct : Product){
    console.log(`Adding to cart : ${theProduct.name},${theProduct.unitPrice}`)

    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
  }
  
}
  

