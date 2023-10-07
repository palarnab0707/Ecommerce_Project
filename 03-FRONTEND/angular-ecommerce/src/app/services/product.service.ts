import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  //need to build an url based on category id and page and page size
  
  
 
  private baseUrl = environment.shopCartUrlLocal + "products";

  private categoryUrl = environment.shopCartUrlLocal + 'product-category';

  constructor(private httpClient: HttpClient) { }

  getProductlist(theCategoryId:number) : Observable<Product[]>{

  const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`    

    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );

  }


  getProductCategories() : Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  searchProducts(keyword:string) : Observable<Product[]>{
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;
    console.log(searchUrl);

    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProduct(theProductId: number) : Observable<Product> {
    //need to build url based on the product id
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }

  getProductlistPaginate(thePage:number,thePageSize:number,theCategoryId:number) : Observable<GetResponseProducts>{

    //need to build an url based on category id and page and page size

  const pageUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}` + `&page=${thePage}&size=${thePageSize}`;   

    return this.httpClient.get<GetResponseProducts>(pageUrl);

  }
  searchProductsPaginate(thePage: number, thePageSize: number, theKeyWord: string): Observable<GetResponseProducts> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyWord}` + `&page=${thePage}$size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

}
interface GetResponseProducts {
  _embedded : {
    products : Product[];
  }
  page : {
    size : number,
    totalElemets: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory{
  _embedded : {
    productCategory : ProductCategory[];
  }
}