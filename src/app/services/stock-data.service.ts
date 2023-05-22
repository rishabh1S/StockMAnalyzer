import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable,
  forkJoin,
  map,
  switchMap,
  interval,
  startWith,
} from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockDataService {
  getSymbolSearchObservable() {}

  //Alpha Vantage
  private apiBaseUrl = 'https://www.alphavantage.co';
  private vantageAPIKey: string = environment.VantageAPIKey;

  //Finnhub
  private finnhubAPIKey: string = environment.FinnhubAPIKey;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  searchStocks(keywords: string): Observable<any> {
    const url = `${this.apiBaseUrl}/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${this.vantageAPIKey}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getStockQuote(symbol: string): Observable<any> {
    const url = `${this.apiBaseUrl}/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.vantageAPIKey}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getTrendingStocks(): Observable<any> {
    const trendingStocksUrl = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${this.finnhubAPIKey}`;

    return interval(7000).pipe(
      startWith(0),
      switchMap(() => this.http.get<any[]>(trendingStocksUrl)),
      switchMap((symbols: any[]) => {
        const symbolPromises = symbols.slice(0, 5).map((symbol: any) => {
          const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol.symbol}&token=${this.finnhubAPIKey}`;
          const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.symbol}&token=${this.finnhubAPIKey}`;

          const quoteRequest$ = this.http.get<any>(quoteUrl);
          const profileRequest$ = this.http.get<any>(profileUrl);

          return forkJoin([quoteRequest$, profileRequest$]).pipe(
            map(([quote, profile]) => ({
              symbol: symbol.symbol,
              c: quote.c,
              dp: quote.dp,
              mc: profile.marketCapitalization,
              name: profile.name,
            }))
          );
        });

        return forkJoin(symbolPromises);
      })
    );
  }
}
