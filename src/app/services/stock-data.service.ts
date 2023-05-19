import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockDataService {
  private apiBaseUrl = 'https://www.alphavantage.co';
  private vantageAPIKey: string = environment.VantageAPIKey;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  searchStocks(keywords: string): Observable<any> {
    const url = `${this.apiBaseUrl}/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${this.vantageAPIKey}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getIntradayData(symbol: string): Observable<any> {
    const url = `${this.apiBaseUrl}/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${this.vantageAPIKey}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getDailyData(symbol: string): Observable<any> {
    const url = `${this.apiBaseUrl}/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.vantageAPIKey}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
}
