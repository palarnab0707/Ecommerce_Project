import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  private countriesUrl = environment.shopCartUrlLocal + 'countries';
  private statesUrl = environment.shopCartUrlLocal + 'states';

  constructor(private httpClient: HttpClient) { }

  getCountries() : Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }

  getStates(theCountryCode:string):Observable<State[]>{

    const searchStateUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<getResponseStates>(searchStateUrl).pipe(
      map(response => response._embedded.states)
    );
  }

  getCreditCardMonths(startMonth : number):Observable<number[]>{
    let data : number[]=[];

    //build an array for "month" dropdown list
    // - start at current month and loop untill

    for(let theMonth = startMonth ; theMonth <= 12; theMonth++){
      data.push(theMonth);
    }
    return of(data);
  }
  getCreditCardYears(): Observable<number[]>{
    let data : number[]=[];

    // build an array for year downlist
    //- start at current year and loop for next 10 year

    const startYear : number = new Date().getFullYear(); //It will return the current year
    const endYear : number = startYear+10;
    //console.log(`startyear=${startYear}, endyear=${endYear}`)
    let theYear = startYear;

    for( ; theYear <= endYear; theYear++){
      data.push(theYear);
      //console.log(`theYear=${theYear}`)

    }
    return of(data);
  }

}

interface GetResponseCountries{
  _embedded: {
    countries : Country[];
  }
}

interface getResponseStates{
  _embedded :{
    states : State[];
  }
}