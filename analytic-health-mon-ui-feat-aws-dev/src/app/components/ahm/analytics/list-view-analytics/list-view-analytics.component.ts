import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';

// RXJS
import { zip } from 'rxjs';

// MAT TABLE IMPORTS
import {MatPaginator, MatTableDataSource, MatSort, MatSortable} from '@angular/material';

// Form Control Dependency
import { FormControl} from '@angular/forms';

// AHM Services
import { AnalyticsApiService } from '../../../../services/ahm/analytics/analytics-api.service';
import { AnalyticsDataService } from '../../../../services/ahm/analytics/analytics-data.service';
import { DashboardApiService } from '../../../../services/ahm/dashboard/dashboard-api.service';
import { DashboardDataService } from '../../../../services/ahm/dashboard/dashboard-data.service';

// General Services
import { MatFilterService } from '../../../../services/general/mat-filter.service';
import { IconStatusService } from '../../../../services/general/icon-status.service';
import { ExcelExportationService } from '../../../../services/general/excel-exportation.service';
import { InterfaceFormatUtilityService } from '../../../../services/ahm/general/interface-format-utility.service';

// Toastr Popup Service
import { ToastrService } from 'ngx-toastr';

// AHM Models
import { Job } from '../../../../models/ahm/analytics/Job';
import { JobDB } from '../../../../models/ahm/analytics/JobDB';
import { Dashboard } from '../../../../models/ahm/dashboard/Dashboard';
import * as moment from 'moment';
import { UserSessionService } from "../../../../services/general/user-session.service";

@Component({
  selector: 'app-list-view-analytics',
  templateUrl: './list-view-analytics.component.html',
  styleUrls: ['./list-view-analytics.component.scss']
})
export class ListViewAnalyticsComponent implements OnInit {

  // current job specified by user
  jobsList: MatTableDataSource<Job>; 

  Search = new FormControl();

  // MAT TABLE Paginator and sort views
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // export function that re-initializes this component
  @Output() changeMatTabToRecordViewEvent: EventEmitter<number> = new EventEmitter();

  constructor(
    private analyticsDataService: AnalyticsDataService,
    private analyticsApiService: AnalyticsApiService,
    private dashboardDataService: DashboardDataService,
    private dashboardApiService: DashboardApiService,
    private matFilterService: MatFilterService,
    private iconStatusService: IconStatusService,
    private excelExportationService: ExcelExportationService,
    public interfaceFormatUtilityService: InterfaceFormatUtilityService,
    private toastr: ToastrService,
    public userSessionService:UserSessionService
  ) { }

  // Column definitions for mat table
  jobTableColumns: string[] = [
    'job_ID',
    'job_NAME',
    'job_DESC',
    'exec_TYPE',
    'queue_ID',
    'frequency',
    'frequency_UOM',
    'run_DAY',
    'next_RUN',
    'max_START_DATE',
    'last_RUN_STATUS',
    'running_FLAG',
    'oos_FLAG',
    'run_ORDER',
    'created_BY',
    'created_DATE',
    'modified_BY',
    'modified_DATE'
  ]

  /* Invoke when page is loaded */
  ngOnInit() {

    // does job data list exist already in the service?
    if ( this.isJobsListDataSaved()  ) {

          // fetch jobs list from data service
          let jobsListServiceData = this.analyticsDataService.getJobsList();

          // Initialize jobs list with data stored in service
          this.setJobsList( jobsListServiceData );

          // check if the selected job is defined, if so, 
          // change tab to record view.
          this.computeSelectedJobStatus(jobsListServiceData);
          

    } else {

        // declare observables analytic + analytic data
        let analyticsObservable = this.analyticsApiService.getJobs();
        let dashboardObservable = this.dashboardApiService.getCompleteDashboardDataList();

        zip(analyticsObservable, dashboardObservable)
            .subscribe(data => {
              
              // fetch combined data
              //let newJobsData: JobDB[] = data[0]._embedded.jobs;
              //let newJobSummaryData: Dashboard[] = data[1]._embedded.jobSummary;
              
              // Added by Ramesh
              let newJobsData: JobDB[] = data[0];
              let newJobSummaryData: Dashboard[] = data[1];


              // combine the data sets to match last run start time, and last run status
              let fullJobList: Job[] = newJobsData.map((job: JobDB) => {
                  
                    // fetch corresponding job dashboard record
                    let summaryRecord: Dashboard[] = newJobSummaryData.filter((jobSummary: Dashboard) => {
                        return job.job_ID == jobSummary.job_ID;
                    })

                    return {
                        created_BY: job.created_BY,
                        created_DATE: job.created_DATE+this.userSessionService.getTimeZoneOffsetOfEnvMilli(job.created_DATE),
                        job_ID: job.job_ID,
                        oos_FLAG: job.oos_FLAG,
                        job_NAME: job.job_NAME,
                        job_DESC: job.job_DESC,
                        exec_TYPE: job.exec_TYPE,
                        modified_BY: job.modified_BY,
                        modified_DATE: job.modified_DATE+this.userSessionService.getTimeZoneOffsetOfEnvMilli(job.modified_DATE),
                        log_MAX_AGE: job.log_MAX_AGE,
                        running_FLAG: job.running_FLAG,
                        executable: job.executable,
                        next_RUN: job.next_RUN+this.userSessionService.getTimeZoneOffsetOfEnvMilli(job.next_RUN),
                        frequency: job.frequency,
                        run_ORDER: job.run_ORDER,
                        run_DAY: job.run_DAY,
                        queue_ID: job.queue_ID,
                        frequency_UOM: job.frequency_UOM,
                        run_AS: job.run_AS,
                        log_MIN_COUNT: job.log_MIN_COUNT,
                        last_RUN_STATUS: summaryRecord[0] && summaryRecord[0].status ? summaryRecord[0].status : '',
                        max_START_DATE: summaryRecord[0] && summaryRecord[0].start_DATE ? summaryRecord[0].start_DATE+this.userSessionService.getTimeZoneOffsetOfEnvMilli(summaryRecord[0].start_DATE) : ''
                      }
                  
              });

            // initialize frontend component
            this.setJobsList( fullJobList );

            // store jobs data into backend service
            this.analyticsDataService.setJobsList( fullJobList );

            for(let newJob of newJobSummaryData) {
              newJob.next_RUN = newJob.next_RUN+this.userSessionService.getTimeZoneOffsetOfEnvMilli(newJob.next_RUN)
              newJob.start_DATE = newJob.start_DATE + this.userSessionService.getTimeZoneOffsetOfEnvMilli(newJob.start_DATE)
              newJob.end_DATE = newJob.end_DATE + this.userSessionService.getTimeZoneOffsetOfEnvMilli(newJob.end_DATE)
            }
            // store job summary data in dashboard section
            this.dashboardDataService.setDashboardDataList( newJobSummaryData );

            // check if the selected job is defined, if so, 
            // change tab to record view.
            this.computeSelectedJobStatus(fullJobList); 

            // notify that job list has loaded successfully
            this.toastr.success('Component Loaded Successfully...');
              
      }, error => {
        this.toastr.error(error.message)
      });
    }
    
  }

  /* When component is destroyed, store jobs list into service for future use */
  ngOnDestroy() {

    if (this.jobsList) {
      this.analyticsDataService.setJobsList(
        this.jobsList.data
      ) 
    }

  }

  /* given parameterized worksheet name, file name, and data set - 
  convert to an excel file that is downloaded */
  exportAsExcel() {
    const newObjArr = [];
    for (let i in this.jobsList.data) {
      let convertObjectKeys = this.reArrangeOrder(this.jobsList.data[i]);
      newObjArr.push(convertObjectKeys);
    }
    this.excelExportationService.exportAsExcel( 
      'AHM-jobs-List',
      'AHM-Job-jobs',
      newObjArr//this.jobsList.data
    );
  }
  reArrangeOrder(ObjectData){
    const newObject = {};
    newObject['JOB ID'] = ObjectData.job_ID != null ? ObjectData.job_ID : '-';
    newObject['JOB NAME'] = ObjectData.job_NAME != null ? ObjectData.job_NAME : '-';
    newObject['JOB DESCRIPTION'] = ObjectData.job_DESC != null ? ObjectData.job_DESC : '-';
    newObject['EXEC TYPE'] = ObjectData.exec_TYPE != null ? ObjectData.exec_TYPE : '-';
    newObject['CREATED BY'] = ObjectData.created_BY != null ? ObjectData.created_BY : '-';
    newObject['CREATED DATE'] = ObjectData.created_DATE != null ? moment(ObjectData.created_DATE).format('YYYY-MM-DD HH:mm:ss') : '-';
    newObject['MODIFIED BY'] = ObjectData.modified_BY != null ? ObjectData.modified_BY : '-';
    newObject['MODIFIED DATE'] = ObjectData.modified_DATE != null ? moment(ObjectData.modified_DATE).format('YYYY-MM-DD HH:mm:ss') : '-';
    newObject['EXECUTABLE'] = ObjectData.executable != null ? ObjectData.executable : '-';
    newObject['NEXT RUN'] = ObjectData.next_RUN != null ? moment(ObjectData.next_RUN).format('YYYY-MM-DD HH:mm:ss') : '-';
    newObject['RUN AS'] = ObjectData.run_AS != null ? ObjectData.run_AS : '-';
    newObject['RUN ORDER'] = ObjectData.run_ORDER != null ? ObjectData.run_ORDER : '-';
    newObject['RUN DAY'] = ObjectData.run_DAY != null ? ObjectData.run_DAY : '-';
    newObject['QUEUE ID'] = ObjectData.queue_ID != null ? ObjectData.queue_ID : '-';
    newObject['FREQUENCY'] = ObjectData.frequency != null ? ObjectData.frequency : '-';
    newObject['FREQUENCY UOM'] = ObjectData.frequency_UOM != null ? ObjectData.frequency_UOM : '-';
    newObject['LOG MINIMUM COUNT'] = ObjectData.log_MIN_COUNT != null ? ObjectData.log_MIN_COUNT : '-';
    newObject['LAST RUN STATUS'] = ObjectData.last_RUN_STATUS != null ? ObjectData.last_RUN_STATUS : '-';
    newObject['MAX START DATE'] = ObjectData.max_START_DATE != null ? moment(ObjectData.ObjectData).format('YYYY-MM-DD HH:mm:ss') : '-';
    newObject['ACTIVE (OOS)'] = ObjectData.oos_FLAG != null ? ObjectData.oos_FLAG : '-';
    newObject['RUNNING FLAG'] = ObjectData.running_FLAG != null ? ObjectData.running_FLAG : '-';
    newObject['LOG MAX AGE'] = ObjectData.log_MAX_AGE != null ? ObjectData.log_MAX_AGE : '-';
    return newObject;
}
  /* depending on if the selected job is predefined,
  *  either switch to record view with data, or set selected job to empty obj */
  computeSelectedJobStatus(job: Job[]) {

    // check pre-defined status - click came from 'analytics' or 'subscriptions' section ?
    if (this.isSelectedJobPredefined()) {
      
      // click came from 'analytics' or 'subscriptions' section
      job.forEach((job: Job) => {
        if (job.job_ID == this.analyticsDataService.getUserRequestedJob().job_ID) {
          this.analyticsDataService.setSelectedJob(job);
          this.analyticsDataService.setSelectedJobPreDefined(false);
          this.changeMatTabToRecordViewFunction()
        }
      }) 
    
    } else {

      /* set the selected job to empty if it is not pre-defined */
        this.analyticsDataService.setSelectedJob(
          this.analyticsDataService.fetchEmptyNewJobObject()
        ) 

    }
  }


  /* Refresh local component, data service storing information - then refresh this component */
  refresh() {

    this.jobsList = null;

    this.analyticsDataService.setJobsList(null);

    this.ngOnInit();

    // notify that job list has loaded successfully
    this.toastr.info('Component Refreshing...');

  }

  /* render mat filter text*/
  applyMatFilter(filterText: string) {
    this.analyticsDataService.setSearchString(filterText);
    return this.matFilterService.applyMatFilter(this.jobsList, filterText);
  }

  /* select job from mat table list on a click event */
  selectJobOnClick(clickedJob: Job) {
    this.analyticsDataService.setSelectedJob(clickedJob);
    this.changeMatTabToRecordViewFunction();
  }

  /* Toggle mat tab of parent analytics component  */
  changeMatTabToRecordViewFunction() {

    // the tab index of the record view is '1'
    this.changeMatTabToRecordViewEvent.emit(1);
  }



  /* Change Icon Status For an Table Element */
  setTableElementIconStatus(identifier: string, value: any) {
    return this.iconStatusService.setIconStatus(identifier, value);
  }

  /* Change Text Status For an Table Element */
  setTableElementTextStatus(identifier: string, value: any) {
    return this.iconStatusService.setTextStatus(identifier, value)
  }

  /* Bind subscibers list front end component */
  setJobsList(jobsList: Job[]) {
    
    this.jobsList = new MatTableDataSource<Job>(jobsList);

    this.applyMatFilter(this.analyticsDataService.getSearchString());

    this.Search = new FormControl('');
    this.Search.setValue(this.analyticsDataService.getSearchString());

    // silly hack to fix mat sort not resolving
    setTimeout(() => {
      this.jobsList.paginator = this.paginator;
      this.jobsList.sort = this.sort;
    });
    
  }

  // Is jobs list is ready for rendering?
  isJobsListLoaded() {
    return this.jobsList ? true : false;
  }

  // check if the jobs data is saved in service
  isJobsListDataSaved() {
    return this.analyticsDataService.isJobsListDefined();
  }

  isSelectedJobPredefined() {
    return this.analyticsDataService.getSelectedJobIsPreDefined();
  }

}
