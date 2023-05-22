import { Component, OnInit } from '@angular/core';
import { StockDataService } from 'src/app/services/stock-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.css'],
})
export class MarketComponent {
  isSmallScreen = false;
  trendingStocks: any[] = [];
  private trendingStocksSubscription: Subscription = new Subscription();

  constructor(private stockService: StockDataService) {}

  ngOnInit() {
    this.trendingStocksSubscription = this.stockService
      .getTrendingStocks()
      .subscribe({
        next: (stocks) => {
          this.trendingStocks = stocks;
        },
        error: (error) => {
          console.log('Error retrieving trending stocks:', error);
        },
      });
  }

  ngOnDestroy() {
    this.trendingStocksSubscription.unsubscribe();
  }
}
