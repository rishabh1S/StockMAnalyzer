import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockDataService } from '../../services/stock-data.service';

// Interface definitions

interface SearchResult {
  '1. symbol': string;
  '2. name': string;
  // Add other properties if needed...
}

interface IntradayDataEntry {
  '1. open': string | any;
  '2. high': string | any;
  '3. low': string | any;
  '4. close': string | any;
  // Add other properties if needed...
}

interface DailyDataEntry {
  '1. open': string | any;
  '2. high': string | any;
  '3. low': string | any;
  '4. close': string | any;
  // Add other properties if needed...
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  isProfileDropdownOpen = false;
  searchResults: SearchResult[] | undefined;
  intradayData: { [key: string]: IntradayDataEntry } | undefined;
  dailyData: { [key: string]: DailyDataEntry } | undefined;
  searchKeywords: string | undefined;

  constructor(
    private router: Router,
    private stockDataService: StockDataService
  ) {}

  ngOnInit(): void {}

  // Component methods

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  switchAccount(): void {
    this.router.navigateByUrl('/login');
  }

  logout(): void {
    // Perform any necessary logout logic (e.g., clearing session data)
    this.router.navigateByUrl('/');
  }

  searchStocks(): void {
    if (this.searchKeywords) {
      this.stockDataService
        .searchStocks(this.searchKeywords)
        .subscribe((results: any) => {
          this.searchResults = results.bestMatches;
        });
    }
  }

  getIntradayData(symbol: string): void {
    this.stockDataService.getIntradayData(symbol).subscribe((data: any) => {
      this.intradayData = data['Time Series (5min)'];
    });
  }

  getDailyData(symbol: string): void {
    this.stockDataService.getDailyData(symbol).subscribe((data: any) => {
      this.dailyData = data['Time Series (Daily)'];
    });
  }
}
