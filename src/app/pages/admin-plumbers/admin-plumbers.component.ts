import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { PlumbersService } from '../../services/plumbers.service';

@Component({
  selector: 'app-admin-plumbers',
  templateUrl: './admin-plumbers.component.html',
  styleUrls: ['./admin-plumbers.component.css']
})
export class AdminPlumbersComponent implements OnInit {
  constructor(
    public adminService: AdminDashboardService,
    public plumbersService: PlumbersService
  ) {}

  ngOnInit(): void {
    this.adminService.loadRegistrations();
  }

  get pendingCount(): number {
    return this.adminService.registrations.filter((item) => item.status !== 'Approved').length;
  }
}
