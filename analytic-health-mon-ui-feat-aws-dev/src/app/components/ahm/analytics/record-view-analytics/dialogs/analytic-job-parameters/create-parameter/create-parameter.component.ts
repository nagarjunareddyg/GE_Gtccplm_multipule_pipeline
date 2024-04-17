import { Component, OnInit, Inject } from '@angular/core';

// Form Control Dependency
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Data formatting utility service
import { InterfaceFormatUtilityService } from '../../../../../../../services/ahm/general/interface-format-utility.service';

// Job Parameter Data Model
// import { JobParameters } from '../../../../../../../models/ahm/analytics/JobParameters/JobParameters';

// Job - Analytics validator
import { AnalyticsValidatorsService } from '../../../../../../../services/ahm/analytics/analytics-validators.service';


// Mat Table Imports
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// fetch environment variable config
import { environment } from '../../../../../../../../environments/environment';

@Component({
  selector: 'app-create-parameter',
  templateUrl: './create-parameter.component.html',
  styleUrls: ['./create-parameter.component.scss']
})
export class CreateParameterComponent implements OnInit {

  // form group representing containing job parameter input
  jobParameterFormGroup: FormGroup;

  // remaining sequence values removing those which are already taken
  paramSEQAvailableValues: number[];

  constructor(
    public dialogRef: MatDialogRef<CreateParameterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public interfaceFormatUtilityService: InterfaceFormatUtilityService,
    private analyticsValidatorsService: AnalyticsValidatorsService
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {


    // // console.log('this.data.createdBY = ', this.data.created_BY);
    // filter remaining SEQ values
    // this.paramSEQAvailableValues = this.interfaceFormatUtilityService.getJobParameterSEQ
    this.paramSEQAvailableValues = this.interfaceFormatUtilityService.getJobParameterSEQ().
      filter((value: number) => { 
        return !this.data.jobParametersSEQList.includes(value);
      });


    // initialize form group that will interface with user. Instantiate each form field value with corresponding selectedSubscriber data.
    this.jobParameterFormGroup = new FormGroup({
      job_ID: new FormControl({ 
        value: this.data.job_ID,
        disabled: true
      }),
      param_TYPE: new FormControl({ 
        value: 'CHAR',
        disabled: false
      },[
        Validators.required
      ]),
      param_VALUE: new FormControl({ 
        value: '',
        disabled: false
      },[
        Validators.required
      ]),
      param_NAME: new FormControl({ 
        value: '',
        disabled: false
      },[
        Validators.required,
        this.analyticsValidatorsService.isParameterNameTaken(
          this.data.jobParametersNames
        )
      ]),
      param_SEQ: new FormControl({
        value: '',
        disabled: false
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

    this.jobParameterFormGroup.controls["param_NAME"].setValidators([
      this.analyticsValidatorsService.isParameterNameTaken(
        this.data.jobParametersNames
      )
    ])
          // this.jobParameterFormGroup.controls['param_NAME'].setValidators([ Validators.required, this.analyticsValidatorsService.isParameterNameTaken( 
        //   this.data.jobParametersList.map(param => param.param_NAME)
        // )]);

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
    return this.jobParameterFormGroup.valid ? true: false;
  }


  /* with a successful form state, return a new job parameter object */
  public fetchNewJobParameterFields(): any {

    return { 
      job: this.fetchEnvironmentLink() + '/jobs/fetchJob/' + this.data.job_ID,
      jobId: this.data.job_ID,

      // REPLACE WITH ACTIVE USER
      created_BY: this.data.created_BY,
      param_NAME: this.jobParameterFormGroup.get('param_NAME').value,
      param_TYPE: this.jobParameterFormGroup.get('param_TYPE').value,
      param_SEQ: this.jobParameterFormGroup.get('param_SEQ').value,
      param_VALUE: this.jobParameterFormGroup.get('param_VALUE').value,
      modified_DATE: null,
      modified_BY: null
    };
  }

  /* If local, disregard string, if prod, then take what's in the string */
  private fetchEnvironmentLink() {
    return environment.AHM_API_URL;
  }

}



