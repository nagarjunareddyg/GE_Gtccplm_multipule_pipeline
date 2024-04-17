import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// General Components
import { HomeComponent } from './components/general/home/home.component';
import { PageNotFoundComponent } from './components/general/page-not-found/page-not-found.component'; 


// AHM Components
import { DashboardComponent } from './components/ahm/dashboard/dashboard.component';
import { AnalyticsComponent } from './components/ahm/analytics/analytics.component';
import { SubscriptionsComponent } from './components/ahm/subscriptions/subscriptions.component';
import { DataQualityComponent } from './components/ahm/dataquality/dataquality.component';

// File Transporter Components - Health Monitor
import { HealthMonitorComponent } from './components/fts/health-monitor/health-monitor.component';

// File Transporter Components - Other
import { FileSearcherComponent } from './components/fts/file-searcher/file-searcher.component';
import { ServiceTrackersComponent } from './components/fts/service-trackers/service-trackers.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'data-quality', component: DataQualityComponent },
  { path: 'subscription', component: SubscriptionsComponent },
  { path: 'health-monitor', component: HealthMonitorComponent },
  { path: 'file-searcher', component: FileSearcherComponent },
  { path: 'service-trackers', component: ServiceTrackersComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
