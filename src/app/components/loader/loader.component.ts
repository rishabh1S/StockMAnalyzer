import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent implements OnInit {
  loading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart || event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loading = true;
        } else if (event instanceof NavigationEnd) {
          setTimeout(() => {
            this.loading = false;
          }, 500); //
        }
      });
  }
}
