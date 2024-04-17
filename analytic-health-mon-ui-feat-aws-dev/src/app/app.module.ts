import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Notifier module for popups
import { ToastrModule } from 'ngx-toastr';

// General Components
import { TopNavComponent } from './components/general/top-nav/top-nav.component';
import { SideNavComponent } from './components/general/side-nav/side-nav.component';
import { HomeComponent } from './components/general/home/home.component';
import { PageNotFoundComponent } from './components/general/page-not-found/page-not-found.component'; 

// AHM Components
import { DashboardComponent } from './components/ahm/dashboard/dashboard.component';
import { AnalyticsComponent } from './components/ahm/analytics/analytics.component';
import { DataQualityComponent } from './components/ahm/dataquality/dataquality.component';

// AHM Components - Subscriptions 
import { RecordViewComponent } from './components/ahm/subscriptions/record-view/record-view.component';
import { ListViewComponent } from './components/ahm/subscriptions/list-view/list-view.component';
import { SubscriptionsComponent } from './components/ahm/subscriptions/subscriptions.component';

// File Transporter Components - Health Monitor
import { HealthMonitorComponent } from './components/fts/health-monitor/health-monitor.component';
import { ProcessingHistoryComponent } from './components/fts/health-monitor/processing-history/processing-history.component';
import { FtSummaryComponent } from './components/fts/health-monitor/ft-summary/ft-summary.component';
import { SourceDestComponent } from './components/fts/health-monitor/source-dest/source-dest.component';
import { FtUnitInfoComponent } from './components/fts/health-monitor/ft-unit-info/ft-unit-info.component';
import { OperationSuccessComponent } from './components/fts/health-monitor/processing-history/dialogs/operation-message-stacktrace/operation-success/operation-success.component';
import { OperationFailureComponent } from './components/fts/health-monitor/processing-history/dialogs/operation-message-stacktrace/operation-failure/operation-failure.component';


// File Transporter Components - File Searcher
import { FileSearcherComponent } from './components/fts/file-searcher/file-searcher.component';
import { FileFailureComponent } from './components/fts/file-searcher/file-failure/file-failure.component';
import { FileProgressComponent } from './components/fts/file-searcher/file-progress/file-progress.component';


// File Transporter Computer - Service Tracker
import { ServiceTrackersComponent } from './components/fts/service-trackers/service-trackers.component';
import { HealthTrackerComponent } from './components/fts/service-trackers/health-tracker/health-tracker.component';
import { ReplicatorTrackerComponent } from './components/fts/service-trackers/replicator-tracker/replicator-tracker.component';


// Angular Material Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material';
import { CdkDetailRowDirective } from './tables/cdk-detail-row.directive';

// Dialog Modules
import { AddJobSubscriptionComponent } from './components/ahm/subscriptions/record-view/dialogs/subscriber-job-subscriptions/add-job-subscription/add-job-subscription.component';
import { DeleteJobSubscriptionComponent } from './components/ahm/subscriptions/record-view/dialogs/subscriber-job-subscriptions/delete-job-subscription/delete-job-subscription.component';
import { DeleteSubscriberComponent } from './components/ahm/subscriptions/record-view/dialogs/subscriber/delete-subscriber/delete-subscriber.component';
import { RecordViewAnalyticsComponent } from './components/ahm/analytics/record-view-analytics/record-view-analytics.component';
import { ListViewAnalyticsComponent } from './components/ahm/analytics/list-view-analytics/list-view-analytics.component';
import { MessageStacktraceComponent } from './components/fts/service-trackers/dialogs/message-stacktrace/message-stacktrace.component';
import { ApplicationMessageStacktraceComponent } from './components/fts/health-monitor/processing-history/dialogs/application-message-stacktrace/application-message-stacktrace.component';
import { ProcessMessageStacktraceComponent } from './components/fts/health-monitor/processing-history/dialogs/process-message-stacktrace/process-message-stacktrace.component';
import { OperationMessageStacktraceComponent } from './components/fts/health-monitor/processing-history/dialogs/operation-message-stacktrace/operation-message-stacktrace.component';
import { GetFilesNotTransferredComponent } from './components/fts/health-monitor/ft-summary/dialogs/get-files-not-transferred/get-files-not-transferred.component';

import { DeleteJobComponent } from './components/ahm/analytics/record-view-analytics/dialogs/analytic/delete-job/delete-job.component';
import { CreateParameterComponent } from './components/ahm/analytics/record-view-analytics/dialogs/analytic-job-parameters/create-parameter/create-parameter.component';
import { UpdateParameterComponent } from './components/ahm/analytics/record-view-analytics/dialogs/analytic-job-parameters/update-parameter/update-parameter.component';
import { DeleteParameterComponent } from './components/ahm/analytics/record-view-analytics/dialogs/analytic-job-parameters/delete-parameter/delete-parameter.component';
import { AnalyticDeleteJobSubscriptionComponent } from './components/ahm/analytics/record-view-analytics/dialogs/analytic-job-subscriptions/analytic-delete-job-subscriptions/analytic-delete-job-subscriptions.component';
import { AnalyticUpdateJobSubscriptionsComponent } from './components/ahm/analytics/record-view-analytics/dialogs/analytic-job-subscriptions/analytic-update-job-subscriptions/analytic-update-job-subscriptions.component';
import { AnalyticCreateJobSubscriptionsComponent } from './components/ahm/analytics/record-view-analytics/dialogs/analytic-job-subscriptions/analytic-create-job-subscriptions/analytic-create-job-subscription.component';

// Incorporate Datepicker module
import { OwlDateTimeModule, OwlNativeDateTimeModule,DateTimeAdapter,
   OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from "ng-pick-datetime-moment";
// Application Production Environment Variables
import { environment } from '../environments/environment.prod';

// Incorporate Route Protection & Links to PLP Portal
// import { AuthGuardService } from './auth/auth-guard';
export const MY_CUSTOM_FORMATS = {
  fullPickerInput: 'YYYY-MM-DD HH:mm:ss',
  parseInput: 'YYYY-MM-DD HH:mm:ss',
  datePickerInput: 'YYYY-MM-DD HH:mm:ss',
  //timePickerInput: 'LT',
  //monthYearLabel: 'MMM YYYY',
  //dateA11yLabel: 'LL',
 // monthYearA11yLabel: 'MMMM YYYY'
  };
@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    SideNavComponent,
    HomeComponent,
    DashboardComponent,
    AnalyticsComponent,
    DataQualityComponent,
    SubscriptionsComponent,
    HealthMonitorComponent,
    FileSearcherComponent,
    ServiceTrackersComponent,
    ProcessingHistoryComponent,
    FtSummaryComponent,
    PageNotFoundComponent,
    CdkDetailRowDirective,
    SourceDestComponent,
    FtUnitInfoComponent,
    RecordViewComponent,
    ListViewComponent,
    RecordViewComponent,
    ListViewComponent,
    SubscriptionsComponent,
    AddJobSubscriptionComponent,
    DeleteJobSubscriptionComponent,
    FileProgressComponent,
    FileFailureComponent,
    DeleteSubscriberComponent,
    RecordViewAnalyticsComponent,
    ListViewAnalyticsComponent,
    HealthTrackerComponent,
    ReplicatorTrackerComponent,
    MessageStacktraceComponent,
    ApplicationMessageStacktraceComponent,
    ProcessMessageStacktraceComponent,
    OperationMessageStacktraceComponent,
    OperationSuccessComponent,
    OperationFailureComponent,
    DeleteJobComponent,
    CreateParameterComponent,
    UpdateParameterComponent,
    DeleteParameterComponent,
    UpdateParameterComponent,
    AnalyticDeleteJobSubscriptionComponent,
    AnalyticUpdateJobSubscriptionsComponent,
    AnalyticCreateJobSubscriptionsComponent,
    GetFilesNotTransferredComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      closeButton: true,
    })
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'en-gb' }
    ],
  bootstrap: [AppComponent],
  entryComponents: [ AddJobSubscriptionComponent, DeleteJobSubscriptionComponent, DeleteSubscriberComponent, MessageStacktraceComponent, DeleteJobComponent, CreateParameterComponent, UpdateParameterComponent, DeleteParameterComponent, AnalyticCreateJobSubscriptionsComponent, AnalyticDeleteJobSubscriptionComponent, AnalyticUpdateJobSubscriptionsComponent, ApplicationMessageStacktraceComponent, ProcessMessageStacktraceComponent, OperationMessageStacktraceComponent, GetFilesNotTransferredComponent ]
})




export class AppModule { }
