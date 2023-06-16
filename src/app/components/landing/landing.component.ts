import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  isMobileMenuOpen = false;
  shouldApplyDropShadow = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.shouldApplyDropShadow = window.scrollY > 0;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
