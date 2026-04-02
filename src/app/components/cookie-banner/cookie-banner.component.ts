import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.css']
})
export class CookieBannerComponent implements OnInit {
  hasConsented = false;
  optOutMarketing = false;

  constructor() { }

  ngOnInit(): void {
    const consent = localStorage.getItem('powerlink_cookie_consent');
    if (consent === 'true') {
      this.hasConsented = true;
    }
  }

  accept(): void {
    localStorage.setItem('powerlink_cookie_consent', 'true');
    if (this.optOutMarketing) {
      localStorage.setItem('powerlink_marketing_opt_out', 'true');
    }
    this.hasConsented = true;
  }
}
