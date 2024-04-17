import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';

// MAT TABLE IMPORTS
import {MatPaginator, MatTableDataSource, MatSort, MatDialog} from '@angular/material';

// Toastr Popup Service
import { ToastrService } from 'ngx-toastr';

// Select a record
import {SelectionModel} from '@angular/cdk/collections';

// Form Control Dependency
import { FormControl, FormGroup, Validators } from '@angular/forms';

// General Services
import { InterfaceFormatUtilityService } from '../../../../services/ahm/general/interface-format-utility.service';

// AHM Services
import { SubscriptionsDataService } from '../../../../services/ahm/subscriptions/subscriptions-data.service';
import { SubscriptionsApiService } from '../../../../services/ahm/subscriptions/subscriptions-api.service';
import { AnalyticsDataService } from '../../../../services/ahm/analytics/analytics-data.service';
import { AnalyticsApiService } from '../../../../services/ahm/analytics/analytics-api.service';


// RxJS Combine HTTP calls for dependent data
import { concat } from 'rxjs';

// AHM Models
import { Job } from '../../../../models/ahm/analytics/Job';
import { Subscriber } from '../../../../models/ahm/subscriptions/Subscriber';
import { JobSubscription } from '../../../../models/ahm/subscriptions/JobSubscription';
// import { Dashboard } from '../../../../models/ahm/dashboard/Dashboard';
import { JobHistory } from '../../../../models/ahm/analytics/JobHistory/JobHistory';
import { JobParameters } from '../../../../models/ahm/analytics/JobParameters/JobParameters';


// General Services
import { MatFilterService } from '../../../../services/general/mat-filter.service';
import { IconStatusService } from '../../../../services/general/icon-status.service';

// Save + Delete Record View Dialogs
import { DeleteJobComponent } from './dialogs/analytic/delete-job/delete-job.component';
import { CreateParameterComponent } from './dialogs/analytic-job-parameters/create-parameter/create-parameter.component';
import { UpdateParameterComponent } from './dialogs/analytic-job-parameters/update-parameter/update-parameter.component';
import { DeleteParameterComponent } from './dialogs/analytic-job-parameters/delete-parameter/delete-parameter.component';
import { AnalyticCreateJobSubscriptionsComponent } from './dialogs/analytic-job-subscriptions/analytic-create-job-subscriptions/analytic-create-job-subscription.component';
import { AnalyticUpdateJobSubscriptionsComponent } from './dialogs/analytic-job-subscriptions/analytic-update-job-subscriptions/analytic-update-job-subscriptions.component';
import { AnalyticDeleteJobSubscriptionComponent } from './dialogs/analytic-job-subscriptions/analytic-delete-job-subscriptions/analytic-delete-job-subscriptions.component';

// mat animation classes
import { animate, state, style, transition, trigger } from '@angular/animations';
import { JobDB } from '../../../../models/ahm/analytics/JobDB';
// Fetch User Session Service
import { UserSessionService } from '../../../../services/general/user-session.service';

@Component({
  selector: 'app-record-view-analytics',
  templateUrl: './record-view-analytics.component.html',
  styleUrls: ['./record-view-analytics.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RecordViewAnalyticsComponent implements OnInit {

  // Variables representing the panel state
  jobDetailsPanelState: boolean = true;
  jobParametersPanelState: boolean = false;
  jobSubscribersPanelState: boolean = false;
  jobHistoryPanelState: boolean = false;

  // current JobDB specified by user
  selectedJob: Job; 

  // remember in the component level if JobDB is new
  isSelectedJobNew: boolean;

  // CREATE FOR PARAMETERS, SUBSCRIBERS, HISTORY

  // Initialize Job History MAT TABLE
  jobHistoryList: MatTableDataSource<JobHistory>;
  jobSubscriptionsList: MatTableDataSource<JobSubscription>;
  jobParametersList: MatTableDataSource<JobParameters>;

  // selected job subscriber + parameter
  selectedParameterInstance: SelectionModel<JobParameters>;
  selectedJobSubscriptionInstance: SelectionModel<JobSubscription>;

  // MAT TABLE Paginator and sort views
  @ViewChild(MatPaginator) jobHistoryPaginator: MatPaginator;
  @ViewChild(MatSort) jobHistorySort: MatSort;

  // Subscriber Form Groups
  jobFormGroup: FormGroup;
  // for calendar validation, block off all days that are in the past
  private todaysDate: Date = new Date();


  // job parameter mat table columns
  // mat-table columns for job subscriptions
  public jobParameterTableColumns: string[] = [
    "select",
    "param_SEQ",
    "param_NAME",
    "param_TYPE",
    "param_VALUE"
  ];


  // Job History Mat Table Columns
  public jobHistoryTableColumns: string[] = [
    "log_ID",
    "start_DATE",
    "end_DATE",
    "duration",
    "status",
    "messages"
  ]

  public jobHistoryMessageTableColumns: string[] = [
    "nested_created_DATE",
    "nested-status",
    "nested_message"
  ];

  // mat-table columns for job subscriptions
  public jobSubscriberTableColumns: string[] = [
    "select",
    "subscriber_ID",
    "email",
    "notification_type",
    "subscriptionActive"
  ];

  constructor(
    private analyticsDataService: AnalyticsDataService,
    private analyticsApiService: AnalyticsApiService,
    private subscriptionsDataService: SubscriptionsDataService,
    private subscriptionsApiService: SubscriptionsApiService,
    public interfaceFormatUtilityService: InterfaceFormatUtilityService,
    public dialog: MatDialog,
    private iconStatusService: IconStatusService,
    private matFilterService: MatFilterService,
    private toastr: ToastrService,
    public userSessionService: UserSessionService
    ) { }

  ngOnInit() {

      // fetch selected job & all dependent data from the data service
      this.selectedJob = this.analyticsDataService.getSelectedJob();

      // if job has data, fetch it's corresponding dependent data
      if(this.isThisNewJobEmpty()) {

        // remember in component that job is new
        this.isSelectedJobNew = true;

        // init job history table with no data
        this.initializeJobHistoryTableForJob( [] );
        this.initializeJobParametersTableForJob( [] );
        this.initializeJobSubscriptionsTableForJob( [] );

      } else {

          // selected job exists
          this.isSelectedJobNew = false;

          // fetch all dependent job data from the API
          this.fetchDependentJobDataFromAPI('all');


      }

      // fetch data from api
      this.subscriptionsApiService.getSubscribers().subscribe((subscribers: any) => {

        // console.log("INSIDE NEXT BRANCH: ");

       // let jobSubscribersData = subscribers._embedded.jobSubscribers;
       //added by dinesh
        let jobSubscribersData = subscribers;

        for(let jobSubscriber of jobSubscribersData){
          jobSubscriber.created_DATE = jobSubscriber.created_DATE + this.userSessionService.getTimeZoneOffsetOfEnvMilli(jobSubscriber.created_DATE);
          jobSubscriber.modified_DATE = jobSubscriber.modified_DATE + this.userSessionService.getTimeZoneOffsetOfEnvMilli(jobSubscriber.modified_DATE);
        }

        // store subscribers data into backend service
        this.subscriptionsDataService.setSubscribersList( jobSubscribersData );

      },error => {
        this.toastr.error(error.message)
      
      });

      // Instantiate each form field value with corresponding selectedJob data.
      this.jobFormGroup = this.fetchFormGroupObjectForJob();
  }

  /* update selected JobDB + JobDB list in JobDB data service*/
  private updateJobDataServiceValues(job: any, state: string): void {
    
    // based on state of job action, either create, update or delete the job.
    switch(state) {
      case "create": 

        // instantiate last run status and max start date to empty strings
        job['last_RUN_STATUS'] = '';
        job['max_START_DATE'] = '';

        this.analyticsDataService.addNewjobToList(job);
        this.analyticsDataService.setSelectedJob(job);
        break;
      case "update": 
        this.analyticsDataService.editExistingJobOnList(job)
        this.analyticsDataService.setSelectedJob(job);
        break;
      case "delete": {
        this.analyticsDataService.deleteExistingJobFromList();
        this.analyticsDataService.setSelectedJob(
          this.analyticsDataService.fetchEmptyNewJobObject()
        );
        break;
      }
    }

    this.refreshAll();   
  }

  /* Given parameter job object, return a new form group instance */
  private fetchFormGroupObjectForJob() : FormGroup {

    let job = this.selectedJob;

    return new FormGroup({
      created_BY: new FormControl({ 
        value: job.created_BY,
        disabled: true
      }),
      created_DATE: new FormControl({
        value: job.created_DATE !== null ? this.interfaceFormatUtilityService.formatDateValue(
          job.created_DATE
        ): '',
        disabled: true
      }),
      job_NAME: new FormControl({ 
        value: job.job_NAME,
        disabled: false
      }, [
        Validators.required
      ]),
      job_ID: new FormControl({ 
        value: job.job_ID,
        disabled: true
      }),
      job_DESC: new FormControl({
        value: job.job_DESC,
        disabled: false
      }, [
        Validators.required
      ]),
      exec_TYPE: new FormControl({
        value: job.exec_TYPE,
        disabled: false
      }, [
        Validators.required
      ]),
      modified_BY: new FormControl({
        value: job.modified_BY,
        disabled: true
      }),
      modified_DATE: new FormControl({
        value: job.modified_DATE !== null ? this.interfaceFormatUtilityService.formatDateValue(
          job.modified_DATE
        ): '',
        disabled: true
      }),
      log_MAX_AGE: new FormControl({
        value: job.log_MAX_AGE,
        disabled: false
      }, [
        Validators.required
      ]),
      running_FLAG: new FormControl({
        value: this.interfaceFormatUtilityService.setBooleanFlagCheckbox(
          job.running_FLAG,
        ),
        disabled: true 
      }),
      executable: new FormControl({
        value: job.executable,
        disabled: false
      }, [
        Validators.required
      ]),
      next_RUN: new FormControl(
        job.next_RUN !== null ? new Date(job.next_RUN):''// + new Date().getTimezoneOffset() * 60000): ''        //job.next_RUN !== null ? new Date(job.next_RUN):''
      ),
      frequency: new FormControl({
        value: job.frequency,
        disabled: false
      }, [
        Validators.required
      ]),
      run_ORDER: new FormControl({
        value: job.run_ORDER,
        disabled: false
      }),
      run_DAY: new FormControl({
        value: job.run_DAY,
        disabled: false
      }),
      queue_ID: new FormControl({
        value: job.queue_ID,
        disabled: false
      }, [
        Validators.required
      ]),
      frequency_UOM: new FormControl({
        value: job.frequency_UOM,
        disabled: false
      }, [
        Validators.required
      ]),
      run_AS: new FormControl({
        value: job.run_AS,
        disabled: false
      }, [
        Validators.required,
        /*Validators.pattern("^[0-9]{9}$")*/
        Validators.pattern("^[A-Za-z0-9_]{1,20}")
      ]),
      log_MIN_COUNT: new FormControl({
        value: job.log_MIN_COUNT,
        disabled: false
      }, [
        Validators.required
      ]),
      last_max_START_DATE: new FormControl({
        value: job.max_START_DATE ? this.interfaceFormatUtilityService.formatDateValue(
          job.max_START_DATE
        ): '',
        disabled: false
      }),
      last_RUN_END_STATUS: new FormControl({
        value: job.last_RUN_STATUS ? 
          job.last_RUN_STATUS: '',
        disabled: false
      }),
      oos_FLAG: new FormControl(  this.interfaceFormatUtilityService.setBooleanFlagCheckbox(
        job.oos_FLAG
      )),
    });
  }

  /* Given parameter form group, return a job instance */
  private fetchJobBodyForFormGroup(dirtyControlList: string[], jobFormGroup: FormGroup, jobBody: any): JobDB { 


    // build job object
    dirtyControlList.forEach((control: string) => {

      // depending if a date or a flag, handle imput differently.
      switch(control) {
          case "oos_FLAG":
          case "running_FLAG": {
            jobBody[control] = this.interfaceFormatUtilityService.setBooleanServiceFlag(
              jobFormGroup.get(control).value
            )
            break;
          }
          case "next_RUN":
           {
            let date: Date = new Date(jobFormGroup.get(control).value);
            jobBody[control]=date.getTime()-this.userSessionService.getTimeZoneOffsetOfEnvMilli(date)
            //removing UTC conversion from view purpose from actual date
             //let dateRemovingZoneOffset=date.getTime()-(new Date().getTimezoneOffset() * 60000);
             //jobBody[control] = dateRemovingZoneOffset//+3600000*-5//converting into EST and saving it
            break;
          }
          case "modified_DATE": 
          case "created_DATE":{
            let date: Date = new Date(jobFormGroup.get(control).value);
            jobBody[control]=date.getTime()-this.userSessionService.getTimeZoneOffsetOfEnvMilli(date);
            break;
          }
          default: {
            jobBody[control] = jobFormGroup.get(control).value;
          }
        }
    })

    // return job to be created
    return jobBody;
  }

  /* Given selected job, return all dependent job history, 
  parameters and subscriptions via concat RXJS */
  private fetchDependentJobDataFromAPI(state: string): void {

    // based on state, decide what to refresh
    switch(state) {
      case "subscribers": {
        const jobSubscribers$ = this.analyticsApiService.fetchJobSubscriptionsForJob(this.selectedJob.job_ID);
        jobSubscribers$.subscribe((data: any) => {
         // this.initializeJobSubscriptionsTableForJob(data._embedded.jobSubscriptions);
         this.initializeJobSubscriptionsTableForJob(data);
        },error => {
          this.toastr.error(error.message)
        })
        break;
      }
      case "history": {
        const jobHistory$ = this.analyticsApiService.fetchJobHistoryForJob(this.selectedJob.job_ID);
        jobHistory$.subscribe((data: any) => {
         // this.initializeJobHistoryTableForJob(data._embedded.findJobHistoryMessages)
         this.initializeJobHistoryTableForJob(data)
        }, error => {
          this.toastr.error(error.message)
        })
        break;
      }
      case "parameters": {
        const jobParameters$ = this.analyticsApiService.fetchJobParametersForJob(this.selectedJob.job_ID);
        jobParameters$.subscribe((data: any) => {
         // this.initializeJobParametersTableForJob(data._embedded.jobParameters);
         this.initializeJobParametersTableForJob(data);
        }, error => {
          this.toastr.error(error.message)
        })
        break;
      }
      case "all": {
            // declare independent observables
          const jobParameters$ = this.analyticsApiService.fetchJobParametersForJob(this.selectedJob.job_ID);
          const jobHistory$ = this.analyticsApiService.fetchJobHistoryForJob(this.selectedJob.job_ID);
          const jobSubscribers$ = this.analyticsApiService.fetchJobSubscriptionsForJob(this.selectedJob.job_ID);
          jobParameters$.subscribe((data: any) => {
            // this.initializeJobParametersTableForJob(data._embedded.jobParameters);
            this.initializeJobParametersTableForJob(data);
           }, error => {
             this.toastr.error(error.message)
           })
          jobHistory$.subscribe((data: any) => {
            // this.initializeJobHistoryTableForJob(data._embedded.findJobHistoryMessages)
            this.initializeJobHistoryTableForJob(data)
           }, error => {
             this.toastr.error(error.message)
           })
          jobSubscribers$.subscribe((data: any) => {
         // this.initializeJobSubscriptionsTableForJob(data._embedded.jobSubscriptions);
         this.initializeJobSubscriptionsTableForJob(data);
        },error => {
          this.toastr.error(error.message)
        })
          // combine unrelated observables together.
          // const jobDependentData$ = concat(
          //       jobParameters$,
          //       jobHistory$,
          //       jobSubscribers$
          // );

          // // // read + process API data
          // jobDependentData$.subscribe((data: any) => {
            
          //     // based on the data that's being returned, instantiante the corresponding mat table w data
          //     // inside if param data._embedded.jobParameters
          //     if(data) {
          //       //this.initializeJobParametersTableForJob(data._embedded.jobParameters);
          //       this.initializeJobParametersTableForJob(data);
          //       //in else if ._embedded.findJobHistoryMessages
          //     } else if (data) {
          //       //this.initializeJobHistoryTableForJob(data._embedded.findJobHistoryMessages);
          //       this.initializeJobHistoryTableForJob(data);
          //       //data._embedded.jobSubscriptions
          //     } else if (data) {
          //       //this.initializeJobSubscriptionsTableForJob(data._embedded.jobSubscriptions);
          //       this.initializeJobSubscriptionsTableForJob(data);
          //     } 

          // }, error => {
          //   this.toastr.error(error.message)
          
          // })
          break;
      }

    }

  }
  
  /* Check for error */
  public hasError = (controlName: string, errorName: string): boolean =>{

    // // console.log(this.jobFormGroup)
    return this.jobFormGroup.controls[controlName].hasError(errorName);
  }

  // REFRESH FUNCTIONS
  // clear current JobDB/subscription details and refresh the component
  public refreshAll(): void {

    // blank selected job
    this.selectedJob = null;

    // blank subscribers list
    this.jobSubscriptionsList = null;

    // blank parameters list 
    this.jobParametersList = null;

    // blank job history list
    this.jobHistoryList = null;

    this.toastr.info('Component refreshing...');

    this.ngOnInit();
  }

  /* clear subscribers list */
  public refreshSubscribersList(): void {

    // blank subscribers list
    this.jobSubscriptionsList = null;

    this.toastr.info('Job subscribers list refreshing...');

    this.fetchDependentJobDataFromAPI('subscribers');

  }

  /* clear parameters list */
  public refreshParametersList(): void {

    // blank parameters list 
    this.jobParametersList = null;

    this.toastr.info('Job parameters list refreshing...');

    this.fetchDependentJobDataFromAPI('parameters');
  }

  /* clear history list */
  public refreshHistoryList(): void {

    // blank parameters list 
    this.jobHistoryList = null;

    this.toastr.info('Job history list refreshing...');

    this.fetchDependentJobDataFromAPI('history');
  }


  /* Insert New Job Object */
  public submitNewJobInstance(): void {

    // use run_AS for now since we're not grabbing the active user
    // declare job object to be returned
    let payload: any = {

      // REPLACED WITH ACTIVE USER
      created_BY: this.userSessionService.getUser().sso
    };

    // instantiate list to store dirty form controls 
    let dirtyControlsList = this.fetchDirtyControls();

    // fetch job body for form group
    let jobBody = this.fetchJobBodyForFormGroup(
      dirtyControlsList,
      this.jobFormGroup,
      payload
    );


    // call analytics API to submit new job
    this.analyticsApiService.addJob(jobBody).subscribe((newJob: JobDB) => {
      this.toastr.success('Job successfully added');
      newJob.next_RUN = newJob.next_RUN + this.userSessionService.getTimeZoneOffsetOfEnvMilli(newJob.next_RUN);
      newJob.modified_DATE = ""
      newJob.created_DATE = ""
      this.updateJobDataServiceValues(newJob, 'create');
    }, error => {
      this.toastr.error(error.message)
    
    })
    

  }

  /* On click of subscriber in the job's subscriptions section, 
  set subscriber in subscriptions data service */
  public selectSubscriberOnClick(subscriber: Subscriber): void {
    this.subscriptionsDataService.setSelectedSubscriberPreDefined(true);
    
    this.subscriptionsDataService.setSelectedSubscriber(subscriber);
  }

  /* delete selected job from local cache & DB */
  public deleteSelectedJob(): void {

    // make sure that subscriber's job subscriptions have been deleted first 
    if(!this.doesJobParametersTableHaveData() && !this.doesJobSubscriptionsTableHaveData() && !this.isSelectedJobNew) {

        let job = this.selectedJob;

        // call API
        const dialogRef = this.dialog.open(DeleteJobComponent, {
          width: '400px',
          height: '225px',
          data: { 
              job
          },
        });

        dialogRef.afterClosed().subscribe((deletedJob: any) => {

          if(deletedJob ? true : false) { 

            const deletedJobDB = deletedJob.job.job_ID;

              // delete subscriber in database
            this.analyticsApiService.deleteJob(deletedJobDB)
                  .subscribe(() => {

                    this.toastr.success('Job successfully deleted');

                    this.updateJobDataServiceValues(
                      this.analyticsDataService.fetchEmptyNewJobObject(),
                      'delete'
                    );
              }, error => {
                this.toastr.error(error.message)
              
              })
          }
        }, error => {
          this.toastr.error(error.message)
        
        });
    } else if( this.isSelectedJobNew ) {
      this.refreshAll();
    } else {
      this.toastr.error('Please delete parameters and subscribers before deleting job')
    }

    

  }

  /* Edit selected job  dialog */
  public updateSelectedJob(): void {

    // use run_AS for now since we're not grabbing the active user
    // declare job object to be returned
    let payload: any = {
      
      // REPLACE WITH ACTIVE USER
      modified_BY: this.userSessionService.getUser().sso,
      modified_DATE: this.todaysDate
    };

    // instantiate list to store dirty form controls 
    let dirtyControlsList = this.fetchDirtyControls();

    // fetch job body for form group
    let jobBody = this.fetchJobBodyForFormGroup(
      dirtyControlsList,
      this.jobFormGroup,
      payload
    );


    // call analytics API to update existing job
    this.analyticsApiService.
      editJob(this.selectedJob.job_ID, jobBody).
        subscribe((updatedJobDBody: JobDB) => {
          this.toastr.success('Job successfully updated');

          // append last run start & last run status for selected job,
          let updatedJobValue = updatedJobDBody;
          updatedJobValue['max_START_DATE'] = this.selectedJob.max_START_DATE;
          updatedJobValue['last_RUN_STATUS'] = this.selectedJob.last_RUN_STATUS;
          console.log("Next Run Before ::::::::"+updatedJobValue.next_RUN+"\nNext Run After:::::"+(updatedJobValue.next_RUN + new Date().getTimezoneOffset()*60000));
          updatedJobValue['next_RUN'] = updatedJobValue.next_RUN + this.userSessionService.getTimeZoneOffsetOfEnvMilli(updatedJobValue.next_RUN)
          updatedJobValue['created_DATE'] = updatedJobValue.created_DATE + this.userSessionService.getTimeZoneOffsetOfEnvMilli(updatedJobValue.created_DATE)
          updatedJobValue['modified_DATE'] = ""

          // // console.log(new Date(updatedJobValue.modified_DATE));

          this.updateJobDataServiceValues(updatedJobValue, 'update');
        }, error => {
          this.toastr.error(error.message)
        
        }
      );
  

  }

  private fetchDirtyControls(): string[] {

    // instantiate list to store dirty form controls 
    let dirtyFormControlList: string[] = [];

    // generate an array out of the controls list
    const formControlList = Object.keys(this.jobFormGroup.controls );

    // identify which controls are dirty
    formControlList.forEach((control: string) => {
      if(this.jobFormGroup.get(control).dirty) {
        dirtyFormControlList.push(control);
      }
    });

    return dirtyFormControlList;
  }

  // DEPENDENT DATA SECTION

  /* given array of job history data, set mat table and paginator + sort */
  initializeJobHistoryTableForJob(jobHistory: JobHistory[]) {

      // create container for unique job history instance
      let uniqueJobHistoryInstances: JobHistory[] = [];
      
      // store all previously identified job history instances
      const map = new Map();

      for(const item of jobHistory) {

        // has this log_ID been processed before?
        if(!map.has(item.log_ID)) {
          // record finding
          map.set(item.log_ID, true);

          // Conversion of created date coming from message of the history item
          for(let messageItem of item.message){
            //console.log("Message Date" + messageItem.message_DATE)
            //console.log("Create Date before message date" + messageItem.created_DATE )
            // Created date in HTML should be mapped to message date
            messageItem.created_DATE = messageItem.message_DATE + this.userSessionService.getTimeZoneOffsetOfEnvMilli(messageItem.message_DATE)
          }
          
          // sort messages on the basis of message date
          item.message = item.message.sort((a, b) => (a.message_ID  > b.message_ID ) ? 1 : -1)          
          // store job history item
          uniqueJobHistoryInstances.push({
            log_ID: item.log_ID,
            start_DATE: item.start_DATE+this.userSessionService.getTimeZoneOffsetOfEnvMilli(item.start_DATE),
            job_DURATION: item.job_DURATION,
            end_DATE: item.end_DATE+this.userSessionService.getTimeZoneOffsetOfEnvMilli(item.end_DATE),
            modified_BY: item.modified_BY,
            modified_DATE: item.modified_DATE+this.userSessionService.getTimeZoneOffsetOfEnvMilli(item.modified_DATE),
            status: item.status,
            created_BY: item.created_BY,
            created_DATE: item.created_DATE+this.userSessionService.getTimeZoneOffsetOfEnvMilli(item.created_DATE),
            message: item.message
          })
        }
        
      }


      // re-initialize local table
      this.jobHistoryList = new MatTableDataSource<JobHistory>(
        uniqueJobHistoryInstances
      );

      // silly hack to fix mat sort not resolving
      setTimeout(() => {
        this.jobHistoryList.paginator = this.jobHistoryPaginator;
        this.jobHistoryList.sort = this.jobHistorySort;

        // resize job history text areas
        // autosize($('history-text-area'));
      });


  }

  /* given array of job subscription data, set mat table and paginator + sort */
  initializeJobSubscriptionsTableForJob(jobSubscribers: JobSubscription[]) {

    // contains selected subscriber instance
    this.selectedJobSubscriptionInstance = new SelectionModel<JobSubscription>();

    // re-initialize local table
    this.jobSubscriptionsList = new MatTableDataSource<JobSubscription>(
      jobSubscribers
    );


  }

  /* given array of job subscription data, set mat table and paginator + sort */
  public initializeJobParametersTableForJob(jobParameters: JobParameters[]): void {

    // contains selected parameter instance
    this.selectedParameterInstance = new SelectionModel<JobParameters>(false, []);

    // re-initialize local table
    this.jobParametersList = new MatTableDataSource<JobParameters>(
      jobParameters
    );

  }

  // =============== UPDATE JOB PARAMETER FUNCTIONS =====================

  // On Click of '+' button, open panel prompting for creation of a job
  public createJobParameterObjectForJob(): void {


    // open dialog prompting updation of a parameter 
    const dialogRef = this.dialog.open(CreateParameterComponent, {
      width: '640px',
      height: '370px',
      data: { 
          job_ID: this.selectedJob.job_ID,
          // REPLACE WITH ACTIVE USER
          created_BY: this.selectedJob.created_BY,
          jobParametersSEQList: this.jobParametersList.data.map((parameter: JobParameters) => {
            return parameter.param_SEQ;
          }),
          jobParametersNames: this.jobParametersList.data.map((parameter: JobParameters) => {
            return parameter.param_NAME;
          }) 
      },
    });

    dialogRef.afterClosed().subscribe(newParameter => {

      // check if the user clicked 'Ok' or 'Cancel'
      if(newParameter && this ? true : false) {

        // Push new job parameter to DB, then update table
        this.analyticsApiService.addJobParameterForJob(newParameter)
          .subscribe(newParameterFromServer => {

            if(newParameterFromServer) {

              // store old parameters data
              let parametersDataList = this.jobParametersList.data;

              // add new subscriptions object to table
              parametersDataList.push(newParameterFromServer);

              // re-initialize local table
              this.initializeJobParametersTableForJob(
                parametersDataList
              );

              this.toastr.success('Job parameter successfully added');
            }

          }, error => {
            this.toastr.error(error.message)
          }) 
      } 
    }, error => {
      this.toastr.error(error.message)
    
    });
  }

  /* Given existing job parameter, update and reset value */
  public editJobParameterObjectForJob(): void {

    // fetch selected parameter
    let selectedParameter: JobParameters = this.selectedParameterInstance.selected[0];

    // open dialog prompting updation of a parameter 
    const dialogRef = this.dialog.open(UpdateParameterComponent, {
      width: '640px',
      height: '370px',
      data: { 
          selectedParameter
      },
    });


    dialogRef.afterClosed().subscribe(updatedParameter => {

      // check if the user clicked 'OK'
      if(updatedParameter && this ? true : false) {
        

        // PATCH updated jobParameter on API
        this.analyticsApiService.addJobParameterForJob( updatedParameter ).
          subscribe(updatedParameterFromServer => {

            if(updatedParameterFromServer) {

                // store old subscriptions data
                let parametersDataList = this.jobParametersList.data;

                // // // fetch index of deleted subscription
                let indexOfEditedParameter = parametersDataList.indexOf(selectedParameter);

                // remove deleted subscriptions object from table
                parametersDataList[indexOfEditedParameter] = updatedParameterFromServer;

                // re-initialize local table
                this.initializeJobParametersTableForJob(
                  parametersDataList
                );

                this.toastr.success('Job parameter successfully updated');

                // remove it from the selection model
                this.selectedParameterInstance.clear();
            }
    
        }, error => {
          this.toastr.error(error.message)
        
        })
      }

    }, error => {
      this.toastr.error(error.message)
    
    })
  }

  

  // On Click of '+' button, open panel prompting for creation of a job
  public deleteJobParameterObjectForJob(): void {

    // fetch selected job parameter
    let selectedParameter: JobParameters = this.selectedParameterInstance.selected[0];

    // open dialog prompting deletion of a parameter 
    const dialogRef = this.dialog.open(DeleteParameterComponent, {
      width: '640px',
      height: '370px',
      data: { 
          job_ID: this.selectedJob.job_ID,
          selectedParameter
      },
    });

    dialogRef.afterClosed().subscribe((deletedParameterFromPanel: any) => {

      // check if the user clicked 'Ok' or 'Cancel'
      if(deletedParameterFromPanel ? true : false) {

        // delete job paramater from DB
        this.analyticsApiService.deleteJobParameterForJob( deletedParameterFromPanel )
          .subscribe(() => {
             
              // store old subscriptions data
              let jobParametersList = this.jobParametersList.data;

              // fetch index of deleted subscription
              let indexOfDeletedParameter = jobParametersList.indexOf(selectedParameter);

              // remove deleted subscriptions object from table
              jobParametersList.splice(indexOfDeletedParameter, 1);

              // re-initialize local table
              this.initializeJobParametersTableForJob(
                jobParametersList
              );

              // the selected job has been deleted from the job subscriptions list,
              // remove it from the selection model
              this.selectedParameterInstance.clear();


              this.toastr.success('Job parameter successfully deleted');

          }, error => {
            this.toastr.error(error.message)
          
          })
        
      } 
    }, error => {
      this.toastr.error(error.message)
    
    });
  }

  // =================== UPDATE JOB SUBSCRIBER FUNCTIONS ========================

  // On Click of '+' button, open panel prompting for creation of a job
  public createJobSubscriptionObjectForJob(): void {


    // check if job subscriptions list has loaded 
    if( this.subscriptionsDataService.isSubscribersListDefined() ) {
      // open dialog prompting updation of a parameter 
      
        const dialogRef = this.dialog.open(AnalyticCreateJobSubscriptionsComponent, {
          width: '550px',
          height: '700px',
          data: {
            job_ID: this.selectedJob,
            subscribers: this.subscriptionsDataService.getSubscribersList().map((subscriber: Subscriber) => {
              return {
                id: subscriber.subscriber_ID,
                email: subscriber.email
              }
            }),
            existingJobSubscriptions: this.jobSubscriptionsList.data
          }
        });

        dialogRef.afterClosed().subscribe(newSubscription =>  {

        if(newSubscription ? true : false) { 

          // // console.log('newSubscription = ', newSubscription);

            // delete subscriber in database
            this.subscriptionsApiService.addSubscriptionForSubscriber(newSubscription)
                .subscribe((newSubscriptionFromServer) => {

                      // store old subscriptions data
                  let subscriptionsDataList = this.jobSubscriptionsList.data;

                  // add new subscriptions object to table
                  subscriptionsDataList.push(newSubscriptionFromServer);

                  // re-initialize local table
                  this.initializeJobSubscriptionsTableForJob(
                    subscriptionsDataList
                  );

                  this.toastr.success('Job Subscription successfully created');
                
            }, error => {
              this.toastr.error(error.message)
            
            })
          
        }
    }, error => {
      this.toastr.error(error.message)
    
    });




    } else {

      // jobs have not loaded yet, notify user to wait a second
      this.toastr.info('Subscribers list has not loaded yet, please wait a moment and try again!')

    }
  
  }

  /*  */
  // On Click of 'pencil' button, open panel prompting for update of a job subscription
  updateJobSubscriptionObjectForJob() {

      // fetch selected job subscription
      let selectedJobSubscription = this.selectedJobSubscriptionInstance.selected[0];

      // open update JobSubscribers panel
      const dialogRef = this.dialog.open(AnalyticUpdateJobSubscriptionsComponent, {
          width: '525px',
          height: '350px',
          data: {
            selectedJobSubscription:selectedJobSubscription,
            sso: this.userSessionService.getUser().sso
          }
        },
      );

      dialogRef.afterClosed().subscribe(updatedSubscription =>  {

        if(updatedSubscription ? true : false) { 

            // delete subscriber in database
            this.subscriptionsApiService.editSubscriptionForSubscriber(selectedJobSubscription.subscription_ID, updatedSubscription)
                .subscribe((newSubscriptionFromServer) => {

                  if(newSubscriptionFromServer) {
                        // store old subscriptions data
                      let jobSubscriptionsList = this.jobSubscriptionsList.data;

                      // fetch index of deleted subscription
                      let indexOfUpdatedParameter = jobSubscriptionsList.indexOf(selectedJobSubscription);

                      // remove deleted subscriptions object from table
                      // jobSubscriptionsList.splice(indexOfUpdatedParameter, 1);
                      jobSubscriptionsList[indexOfUpdatedParameter]= newSubscriptionFromServer;

                      // re-initialize local table
                      this.initializeJobSubscriptionsTableForJob(
                        jobSubscriptionsList
                      );

                      // the selected job has been deleted from the job subscriptions list,
                      // remove it from the selection model
                      this.selectedParameterInstance.clear();


                      this.toastr.success('Job subscription successfully updated');
                  }
                
            }, error => {
              this.toastr.error(error.message)
            
            })
          
        }
    }, error => {
      this.toastr.error(error.message)
    
    });
  }

  // Delete Selected Job subscription
  deleteJobSubscriptionObjectForJob() {

    // fetch the selected subscription
    let selectedJobSubscription = this.selectedJobSubscriptionInstance.selected[0];

    // call API
    const dialogRef = this.dialog.open(AnalyticDeleteJobSubscriptionComponent, {
      width: '400px',
      height: '235px',
      data: selectedJobSubscription
    });

    dialogRef.afterClosed().subscribe(deletedSubscription => {

      // check if the user clicked 'Yes' or 'Cancel'
      if(deletedSubscription ? true : false) {

        
          this.subscriptionsApiService.deleteSubscriptionForSubscriber(deletedSubscription.subscription_ID)
            .subscribe((e) => {

             // console.log('deleted subscribe ',e)
              // store old subscriptions data
              let subscriptionsDataList = this.jobSubscriptionsList.data;

              // fetch index of deleted subscription
              let indexOfDeletedSubscription = subscriptionsDataList.indexOf(deletedSubscription);

              // remove deleted subscriptions object from table
              subscriptionsDataList.splice(indexOfDeletedSubscription, 1);

              // re-initialize local table
              this.initializeJobSubscriptionsTableForJob(
                subscriptionsDataList
              );
              
               // the selected job has been deleted from the job subscriptions list,
              // remove it from the selection model
              this.selectedJobSubscriptionInstance.clear();

              // Verify that job subscription was successfully deleted
              this.toastr.success('Job subscription successfully deleted');

          }, error => {
            this.toastr.error(error.message)
          })
      }
      
    }, error => {
      this.toastr.error(error.message)
    });

    // update new data model in component and service
  }


  /* Refresh variables that store the 
  selected job and corresponding subscriptions list */
  ngOnDestroy() {

    this.analyticsDataService.setSelectedJob( 
      this.analyticsDataService.fetchEmptyNewJobObject()
    );

  }


  /* render mat filter text*/
  applyMatFilter(tableDataSource: MatTableDataSource<any>, filterText: string) {
    return this.matFilterService.applyMatFilter(tableDataSource, filterText);
  }

  // GETTERS

  /* Change Icon Status For an Table Element */
  setTableElementIconStatus(identifier: string, value: any) {
    return this.iconStatusService.setIconStatus(identifier, value);
  }

  /* Change Text Status For an Table Element */
  setTableElementTextStatus(identifier: string, value: any) {
    return this.iconStatusService.setTextStatus(identifier, value)
  }

  /* Check if the client component variable
   for the selected JobDB is defined  */
  public isSelectedJobDefined(): boolean {
    return this.selectedJob ? true: false;
  }

  // Job Parameters
  public isJobParametersTableDefined(): boolean {
    return this.jobParametersList ? true: false;
  }

  public doesJobParametersTableHaveData(): boolean {
    return this.isJobParametersTableDefined() && (this.jobParametersList.data==null?false:this.jobParametersList.data.length > 0);
  }

  /* Determine if a job parameter is selected by user */
  public isJobParameterSelected(): boolean {
    return this.selectedParameterInstance && this.selectedParameterInstance.selected.length > 0;
  }

  // Job History
  public isJobHistoryTableDefined(): boolean {
    return this.jobHistoryList ? true: false;
  }

  public doesJobHistoryTableHaveData(): boolean {
    return this.jobHistoryList && this.jobHistoryList.data==null?false:this.jobHistoryList.data.length > 0;
  }


  // Job Subscribers

  public isJobSubscriptionsTableDefined(): boolean {
    return this.jobSubscriptionsList ? true: false;
  }

  public doesJobSubscriptionsTableHaveData(): boolean {
   // console.log(this.isJobSubscriptionsTableDefined());
    return this.isJobSubscriptionsTableDefined() && 
    this.jobSubscriptionsList.data==null?false:this.jobSubscriptionsList.data.length > 0;
  }

  // check if any job subscriptions have been selected
  public isJobSubscriptionSelected() {
    return this.selectedJobSubscriptionInstance && this.selectedJobSubscriptionInstance.isEmpty() ? false: true;
  }


  /* Convert Notification Type string to format consistent with viewers */
  public convertNotificationTypeString(notification_TYPE: string) {
    return this.interfaceFormatUtilityService.convertNotificationTypeString(notification_TYPE)
  }





  /* Check if this is a new job */
  private isThisNewJobEmpty(): boolean {
    return this.analyticsDataService.isSelectedJobEmpty();
  }

  /* Check form group validity & new JobDB flag
  * Decide whether to show add JobDB button*/
  private isNewJobReadyForAddition(): boolean {
    return this.isSelectedJobNew && this.jobFormGroup.valid;
  }

  /* Check form group validity & new JobDB flag
  * Decide whether to show edit existing JobDB button */
  private isNewJobReadyForUpdation(): boolean {
    return !this.isSelectedJobNew &&
            this.jobFormGroup.valid &&
            this.jobFormGroup.dirty;
  }


}