import { Component, OnInit, Inject } from '@angular/core';

// Form Control Dependency
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Data formatting utility service
import { InterfaceFormatUtilityService } from '../../../../../../../services/ahm/general/interface-format-utility.service';

// Job Parameter Data Model
import { JobParameters } from '../../../../../../../models/ahm/analytics/JobParameters/JobParameters';

// Job - Analytics validator
import { AnalyticsValidatorsService } from '../../../../../../../services/ahm/analytics/analytics-validators.service';

// fetch environment variable config
import { environment } from '../../../../../../../../environments/environment';

// Mat Table Imports
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-update-parameter',
  templateUrl: './update-parameter.component.html',
  styleUrls: ['./update-parameter.component.scss']
})
export class UpdateParameterComponent implements OnInit {

  // form group representing containing job parameter input
  jobParameterFormGroup: FormGroup;

  // for calendar validation, block off all days that are in the past
  private todaysDate: Date = new Date();

  constructor(
    public dialogRef: MatDialogRef<UpdateParameterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public interfaceFormatUtilityService: InterfaceFormatUtilityService,
    private analyticsValidatorsService: AnalyticsValidatorsService
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {

    // console.log("this.data.jobParametersList" + JSON.stringify(this.data.jobParametersList))

    // initialize form group that will interface with user. Instantiate each form field value with corresponding selectedSubscriber data.
      this.jobParameterFormGroup = new FormGroup({
        job_ID: new FormControl({ 
          value: this.data.selectedParameter.job_ID,
          disabled: true
        }),
        param_TYPE: new FormControl({ 
          value: this.data.selectedParameter.param_TYPE,
          disabled: false
        },[
          Validators.required
        ]),
        param_VALUE: new FormControl({ 
          value: this.data.selectedParameter.param_VALUE,
          disabled: false
        },[
          Validators.required
        ]),
        param_NAME: new FormControl({ 
          value: this.data.selectedParameter.param_NAME,
          disabled: true
        },[
          Validators.required
        ]),
        param_SEQ: new FormControl({
          value: this.data.selectedParameter.param_SEQ,
          disabled: true
        },[
          Validators.required
        ])
    });

  }

  // on change of the parameter type, assign the proper validator for the parameter name
  fetchCorrespondingValidator(): void {

    // reset parameter value form field
    this.jobParameterFormGroup.controls['param_VALUE'].reset();
    
    // fetch param type from form control
    const paramTYPE = this.jobParameterFormGroup.get('param_TYPE').value; 


    // validate input if type is number or date
    switch( paramTYPE ) {
      case "DATE": {
        this.jobParameterFormGroup.controls['param_VALUE'].setValidators([ Validators.required, this.analyticsValidatorsService.isParameterInvalidDate() ]);
        break;
      }
      case "NUMBER": {
        this.jobParameterFormGroup.controls['param_VALUE'].setValidators([ Validators.required, this.analyticsValidatorsService.isParameterInvalidNumber() ]);
        break;
      }
      default: {
        this.jobParameterFormGroup.controls['param_VALUE'].setValidators([ Validators.required ]);
      }
    } 
  }


  /* Check for error */
  public hasError = (controlName: string, errorName: string): boolean =>{
    return this.jobParameterFormGroup.controls[controlName].hasError(errorName);
  }


  /* Given form state, determine if new parameter is valid for creation */
  public isThisParameterValid(): boolean {
    return this.jobParameterFormGroup.valid ? true: false && this.jobParameterFormGroup.dirty ? true: false;
  }


  /* with a successful form state, return a new job parameter object */
  public fetchUpdatedJobParameterFields(): any {

    // send back updated param body
    return {
      // REPLACE WITH ACTIVE USER
      created_BY: this.data.selectedParameter.created_BY,
      //job: this.fetchEnvironmentLink() + '/jobParameters/' + this.data.selectedParameter.job_ID.job_ID,
      job: this.fetchEnvironmentLink() + '/jobs/fetchJob/' + this.data.selectedParameter.job_ID.job_ID, 
      jobId: this.data.selectedParameter.job_ID.job_ID,
      param_NAME: this.jobParameterFormGroup.get('param_NAME').value,
      param_TYPE: this.jobParameterFormGroup.get('param_TYPE').value,
      param_SEQ: this.jobParameterFormGroup.get('param_SEQ').value,
      param_VALUE: this.jobParameterFormGroup.get('param_VALUE').value,
      modified_DATE: this.todaysDate,
      modified_BY: this.data.selectedParameter.modified_BY
    };

  }


  /* If local, disregard string, if prod, then take what's in the string */
  private fetchEnvironmentLink() {
    return environment.AHM_API_URL;
  }

}
