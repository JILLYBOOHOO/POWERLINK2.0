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
    return this.adminService.registrations.filter((item) => item.status === 'Pending Verification').length;
  }

  async updateStatus(item: any, status: string) {
    if (confirm(`Are you sure you want to ${status.toLowerCase()} ${item.name}'s registration?`)) {
      await this.adminService.updateRegistrationStatus(item, status);
    }
  }
}
