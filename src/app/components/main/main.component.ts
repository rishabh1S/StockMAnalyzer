import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StockDataService } from '../../services/stock-data.service';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-moment';
import getSymbolFromCurrency from 'currency-symbol-map';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface SearchResult {
  '1. symbol': string;
  '2. name': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '8. currency': string;
  // Add other properties if needed...
}

interface StockNews {
  title: string;
  source: string;
  summary: string;
  published: Date;
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
  isDropdownOpen: boolean = false;
  isSearchBarOpen: boolean = false;
  showSearchBar = false;
  selectedIndex = -1;
  selectedSymbol: string = '';
  selectedStockName = '';
  selectedStockCurrency = '';
  selectedStockMarketOpen = '';
  selectedStockMarketClose = '';
  searchSubscription: Subscription | undefined;
  currentDateTime: string = '';
  lastRefreshedDate: string = '';
  chart: Chart | undefined;
  selectedInterval: string = 'Daily';
  stockNews: StockNews[] = [];
  shouldApplyDropShadow = false;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private stockDataService: StockDataService,
    private authService: AuthService
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
        responsive: true,
        aspectRatio: 1.5, // Adjust the aspect ratio to make the chart taller
        maintainAspectRatio: false, // Disable maintaining aspect ratio
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
            type: 'timeseries',
            time: {
              tooltipFormat: 'll',
              displayFormats: {
                minute: 'h:mm a',
                hour: 'hA',
                day: 'MMM D',
                week: 'll',
                month: 'YYYY',
              },
            },
            ticks: {
              color: 'rgba(255, 255, 255, 1)',
              maxTicksLimit: 5,
              padding: 10,
            },
            grid: {
              display: true, // Set display to true to show grid markings
              color: 'rgba(128, 128, 128, 1)',
              drawOnChartArea: false,
            },
            border: {
              color: 'rgba(128, 128, 128, 1)', // Set the color of the Y-axis line
              width: 1,
            },
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 1)',
              padding: 10,
            },
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.1)',
            },
            border: {
              color: 'rgba(31, 41, 55, 1)', // Set the color of the Y-axis line
              width: 1,
            },
          },
        },
        elements: {
          line: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Set light white color for the area inside the line
            borderColor: 'rgba(255, 255, 255, 1)',
            tension: 0.5,
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

  @HostListener('window:scroll')
  onWindowScroll() {
    this.shouldApplyDropShadow = window.scrollY > 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdowns = document.getElementsByClassName('dropdown');
    const searchInput = this.searchInput.nativeElement;

    let isTargetInsideDropdown = false;
    for (let i = 0; i < dropdowns.length; i++) {
      const dropdown = dropdowns[i] as HTMLElement;
      if (dropdown.contains(target)) {
        isTargetInsideDropdown = true;
        break;
      }
    }

    if (!isTargetInsideDropdown && target !== searchInput) {
      this.isDropdownOpen = false;
    }
  }

  getCurrencySymbol(currency: string): string {
    const currencySymbol = getSymbolFromCurrency(currency);
    if (currencySymbol) {
      return currencySymbol;
    }
    return '';
  }

  formatDate(lastRefreshedDate: string): string {
    if (!lastRefreshedDate) {
      return ''; // or any default value you want to display
    }
    const dateObject = new Date(lastRefreshedDate);
    const formattedDate = format(dateObject, 'MMM do, h:mm:ss a', {
      locale: enUS,
    });
    return formattedDate + ' UTC-5:00';
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  toggleSearchIcon(): void {
    this.isSearchBarOpen = !this.isSearchBarOpen;
  }

  switchAccount(): void {
    this.router.navigateByUrl('/login');
  }

  logout() {
    // Perform any necessary logout logic (e.g., clearing session data)
    this.authService.signOut().then(() => {
      console.log('Logout Successfull');
      this.router.navigate(['/login']);
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = true;
  }

  toggleSearchBar(): void {
    if (window.innerWidth < 992) {
      this.showSearchBar = !this.showSearchBar;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  clearSearch(): void {
    this.searchKeywords.setValue('');
    this.closeDropdown();
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
        this.lastRefreshedDate = data['Meta Data']['3. Last Refreshed'];

        if (interval === '1min') {
          // Handle 1 Day intervals
          if (data && data['Time Series (1min)']) {
            const latestDate =
              data['Meta Data']['3. Last Refreshed'].split(' ')[0];
            timestamps = Object.keys(data['Time Series (1min)']).filter(
              (timestamp: string) => timestamp.startsWith(latestDate)
            );
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
        this.selectedStockCurrency = this.getStockCurrency(symbol);
        this.selectedStockMarketOpen = this.getStockMo(symbol);
        this.selectedStockMarketClose = this.getStockMc(symbol);
        this.closeDropdown();
        const changePercent = parseFloat(
          quote['Global Quote']['10. change percent'].replace('%', '')
        );
        let lineColor: string;
        if (changePercent > 0) {
          lineColor = 'rgba(0, 255, 0, 1)';
        } else if (changePercent < 0) {
          lineColor = 'rgba(255, 0, 0, 1)';
        } else {
          lineColor = 'rgba(255, 255, 255, 1)';
        }
        if (this.chart) {
          this.chart.data.datasets[0].borderColor = lineColor;
          this.chart.update();
        }
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

  getStockCurrency(symbol: string): string {
    const stock = this.searchResults.find(
      (result) => result['1. symbol'] === symbol
    );
    return stock ? stock['8. currency'] : '';
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
}
