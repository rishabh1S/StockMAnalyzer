import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StockDataService } from '../../services/stock-data.service';
import { Router } from '@angular/router';

interface SearchResult {
  '1. symbol': string;
  '2. name': string;
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
  searchSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private stockDataService: StockDataService
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchKeywords.valueChanges
      .pipe(
        debounceTime(300),
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
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
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
    this.stockDataService.searchStocks(keywords).subscribe(
      (results: any) => {
        this.searchResults = results.bestMatches.slice(0, 5);
        this.selectedIndex = -1;
        if (this.searchResults.length === 0) {
          alert('No match for this symbol.');
        }
      },
      (error: any) => {
        console.error('Error searching stocks:', error);
      }
    );
  }

  selectResult(symbol: string): void {
    this.selectedSymbol = symbol;
    this.stockQuote = null; // Clear previous stock quote information

    this.stockDataService.getStockQuote(symbol).subscribe(
      (quote: any) => {
        this.stockQuote = quote['Global Quote'];
        this.closeDropdown();
      },
      (error: any) => {
        console.error('Error retrieving stock quote:', error);
      }
    );
  }

  clearSearch(): void {
    this.searchKeywords.setValue('');
    this.closeDropdown();
  }
}
