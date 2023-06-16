import { Component, OnInit } from '@angular/core';
import { StockDataService } from 'src/app/services/stock-data.service';
import moment from 'moment';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
})
export class NewsComponent implements OnInit {
  newsList: any[] = [];
  visibleNewsList: any[] = [];
  currentIndex: number = 0;
  responsiveCardCounts = {
    sm: 1,
    md: 2,
    lg: 4,
  };

  constructor(private stockDataService: StockDataService) {}

  ngOnInit() {
    this.fetchNews();
  }

  fetchNews() {
    this.stockDataService.fetchNews().subscribe({
      next: (response: any) => {
        if (response && response.feed) {
          this.newsList = response.feed;
          this.updateVisibleNewsList();
          this.startCarousel();
        }
      },
      error: (error: any) => {
        console.error('Error fetching news:', error);
      },
    });
  }

  updateVisibleNewsList() {
    const screenWidth = window.innerWidth;
    let endIndex = this.currentIndex + this.responsiveCardCounts.sm;

    if (screenWidth >= 1400) {
      endIndex = this.currentIndex + this.responsiveCardCounts.lg;
    } else if (screenWidth >= 768) {
      endIndex = this.currentIndex + this.responsiveCardCounts.md;
    }

    const loopedItems = this.newsList.concat(
      this.newsList.slice(0, this.currentIndex)
    );
    this.visibleNewsList = loopedItems.slice(this.currentIndex, endIndex);
  }

  previousSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.updateVisibleNewsList();
    }
  }

  nextSlide() {
    const lastIndex = this.newsList.length - 1;
    if (this.currentIndex < lastIndex) {
      this.currentIndex += 1;
    } else {
      this.currentIndex = 0; // Reset to the first news card
    }
    this.updateVisibleNewsList();
  }

  startCarousel() {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  getNewsAge(timePublished: string): string {
    const currentDate = moment();
    const newsDate = moment(timePublished, 'YYYYMMDDTHHmmss');
    const diffInDays = currentDate.diff(newsDate, 'days');

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      const diffInHours = currentDate.diff(newsDate, 'hours');
      const diffInMinutes = currentDate.diff(newsDate, 'minutes');

      if (diffInHours >= 1) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else if (diffInMinutes >= 1) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    }
  }

  truncateSummary(summary: string): string {
    const words = summary.split(' ');
    const truncatedSummary = words.slice(0, 15).join(' ');
    return `${truncatedSummary}...`;
  }
}
