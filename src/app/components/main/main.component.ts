import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StockDataService } from '../../services/stock-data.service';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-moment';

interface SearchResult {
  '1. symbol': string;
  '2. name': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '8. currency': string;
  // Add other properties if needed...
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy {
  isProfileDropdownOpen = false;
  searchResults: SearchResult[] = [];
  stockQuote: any = null; // Store the stock quote information
  searchKeywords = new FormControl();
  isDropdownOpen = false;
  selectedIndex = -1;
  selectedSymbol = '';
  selectedStockName = '';
  selectedStockMarketOpen = '';
  selectedStockMarketClose = '';
  searchSubscription: Subscription | undefined;
  currentDateTime: string = '';
  chart: Chart | undefined;
  selectedInterval: string = 'Daily';
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor(
    private router: Router,
    private stockDataService: StockDataService
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchKeywords.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((keywords: string) =>
          this.stockDataService.searchStocks(keywords)
        )
      )
      .subscribe({
        next: (results: any) => {
          this.searchResults = results.bestMatches.slice(0, 5);
          this.selectedIndex = -1;
        },
        error: (error: any) => {
          console.error('Error searching stocks:', error);
        },
      });
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000);

    this.stockDataService
      .fetchStockData(this.selectedSymbol, this.selectedInterval)
      .subscribe(() => {
        this.initializeChart();
      });
  }

  initializeChart(): void {
    const ctx = document.getElementById('chart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '',
            data: [],
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 1)',
            tension: 0.1,
            pointRadius: 0,
          },
        ],
      },

      options: {
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        plugins: {
          legend: {
            display: false, // Set legend display to false
          },
        },
        hover: {
          intersect: false,
          mode: 'nearest',
        },
        scales: {
          x: {
            type: 'timeseries', // Use 'timeseries' instead of 'time'
            time: {
              tooltipFormat: 'll',
              displayFormats: {
                minute: 'MMM D, h:mm a',
                hour: 'hA',
                day: 'MMM D',
                week: 'll',
                month: 'MMM YYYY',
              },
            },
            ticks: {
              color: 'rgba(255, 255, 255, 1)',
              maxTicksLimit: 5,
            },
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 1)',
            },
            grid: {
              display: false,
            },
          },
        },
        layout: {
          padding: {
            right: 10, // Set right padding to 10
          },
        },
        elements: {
          line: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Set light white color for the area inside the line
            borderColor: 'rgba(255, 255, 255, 1)',
            tension: 0.1,
            fill: {
              target: 'origin', // Fill the area below the line to the x-axis
            },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  updateDateTime(): void {
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);

    const [
      { value: month },
      ,
      { value: day },
      ,
      { value: hour },
      { value: minute },
      { value: dayPeriod },
    ] = formatter.formatToParts(currentDate);
    const daySuffix = this.getDaySuffix(day);
    const amPm = Number(hour) <= 12 ? 'pm' : 'am';

    const formattedDateTime = `${month} ${day}${daySuffix} ${hour}${minute}${dayPeriod}${amPm} IST`;
    this.currentDateTime = formattedDateTime;
  }

  getDaySuffix(day: string): string {
    if (day.endsWith('1') && !day.endsWith('11')) {
      return 'st';
    } else if (day.endsWith('2') && !day.endsWith('12')) {
      return 'nd';
    } else if (day.endsWith('3') && !day.endsWith('13')) {
      return 'rd';
    } else {
      return 'th';
    }
  }

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

  toggleDropdown(): void {
    this.isDropdownOpen = true;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  searchStocks(event: Event) {
    event.preventDefault();
    const keywords = this.searchKeywords.value;
    this.searchResults = [];
    this.stockQuote = null; // Clear previous stock quote information
    this.stockDataService.searchStocks(keywords).subscribe({
      next: (results: any) => {
        this.searchResults = results.bestMatches.slice(0, 5);
        this.selectedIndex = -1;
        if (this.searchResults.length === 0) {
          console.log('No match for this symbol.');
        }
      },
      error: (error: any) => {
        console.error('Error searching stocks:', error);
      },
    });
  }

  fetchStockQuote(symbol: string): Observable<any> {
    return this.stockDataService.getStockQuote(symbol);
  }

  selectResult(symbol: string, interval: string): void {
    this.selectedSymbol = symbol;
    this.selectedInterval = interval;
    this.stockQuote = null;

    this.stockDataService.fetchStockData(symbol, interval).subscribe({
      next: (data: any) => {
        console.log(data);

        // Extract the necessary data from the API response
        let timestamps: string[] = [];
        let prices: number[] = [];

        if (interval === '1min') {
          // Handle 1 Day intervals
          if (data && data['Time Series (1min)']) {
            timestamps = Object.keys(data['Time Series (1min)']).slice(0, 1440);
            prices = timestamps.map((timestamp: string) =>
              parseFloat(data['Time Series (1min)'][timestamp]['4. close'])
            );
          }
        } else if (interval === '30min') {
          // Handle 5 Day interval
          if (data && data['Time Series (30min)']) {
            timestamps = Object.keys(data['Time Series (30min)']).slice(0, 50);
            prices = timestamps.map((timestamp: string) =>
              parseFloat(data['Time Series (30min)'][timestamp]['4. close'])
            );
          }
        } else if (interval === 'Daily') {
          // Handle 1 Month interval
          if (data && data['Time Series (Daily)']) {
            timestamps = Object.keys(data['Time Series (Daily)']).slice(0, 30); // Get the latest 30 points
            prices = timestamps.map((timestamp: string) =>
              parseFloat(data['Time Series (Daily)'][timestamp]['4. close'])
            );
          }
        } else if (interval === 'Weekly') {
          // Handle 1 Year interval
          if (data && data['Weekly Adjusted Time Series']) {
            timestamps = Object.keys(data['Weekly Adjusted Time Series']).slice(
              0,
              52
            ); // Get the latest 52 points
            prices = timestamps.map((timestamp: string) =>
              parseFloat(
                data['Weekly Adjusted Time Series'][timestamp]['4. close']
              )
            );
          }
        } else if (interval === 'Monthly') {
          // Handle 5 Year interval
          if (data && data['Monthly Adjusted Time Series']) {
            timestamps = Object.keys(
              data['Monthly Adjusted Time Series']
            ).slice(0, 60); // Get the latest 60 points
            prices = timestamps.map((timestamp: string) =>
              parseFloat(
                data['Monthly Adjusted Time Series'][timestamp]['4. close']
              )
            );
          }
        }

        // Convert timestamps to JavaScript Date objects
        const formattedTimestamps: Date[] = timestamps.map(
          (timestamp: string) => new Date(timestamp)
        );

        // Update the chart data
        if (this.chart) {
          this.chart.data.labels = formattedTimestamps;
          this.chart.data.datasets[0].data = prices;
          this.chart.update();
        }
      },
      error: (error: any) => {
        console.error('Error fetching stock data:', error);
      },
    });

    this.stockDataService.getStockQuote(symbol).subscribe({
      next: (quote: any) => {
        this.stockQuote = quote['Global Quote'];
        this.selectedStockName = this.getStockName(symbol);
        this.selectedStockMarketOpen = this.getStockMo(symbol);
        this.selectedStockMarketClose = this.getStockMc(symbol);
        this.closeDropdown();
      },
      error: (error: any) => {
        console.error('Error retrieving stock quote:', error);
      },
    });
  }

  getStockName(symbol: string): string {
    const stock = this.searchResults.find(
      (result) => result['1. symbol'] === symbol
    );
    return stock ? stock['2. name'] : '';
  }
  getStockMo(symbol: string): string {
    const stock = this.searchResults.find(
      (result) => result['1. symbol'] === symbol
    );
    return stock ? stock['5. marketOpen'] : '';
  }
  getStockMc(symbol: string): string {
    const stock = this.searchResults.find(
      (result) => result['1. symbol'] === symbol
    );
    return stock ? stock['6. marketClose'] : '';
  }

  clearSearch(): void {
    this.searchKeywords.setValue('');
    this.closeDropdown();
  }
}
