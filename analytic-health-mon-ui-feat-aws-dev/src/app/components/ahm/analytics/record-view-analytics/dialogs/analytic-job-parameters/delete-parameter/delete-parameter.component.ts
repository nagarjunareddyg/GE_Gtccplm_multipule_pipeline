import { Component, Inject } from '@angular/core';

import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

// Form Control Dependency
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Data formatting utility service
import { InterfaceFormatUtilityService } from '../../../../../../../services/ahm/general/interface-format-utility.service';

// Job Parameter Data Model
import { JobParameters } from '../../../../../../../models/ahm/analytics/JobParameters/JobParameters';

// Job - Analytics validator
import { AnalyticsValidatorsService } from '../../../../../../../services/ahm/analytics/analytics-validators.service';


@Component({
  selector: 'app-delete-parameter',
  templateUrl: './delete-parameter.component.html',
  styleUrls: ['./delete-parameter.component.scss']
})
export class DeleteParameterComponent {

  // form group representing containing job parameter input
  jobParameterFormGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DeleteParameterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public interfaceFormatUtilityService: InterfaceFormatUtilityService,
    private analyticsValidatorsService: AnalyticsValidatorsService
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {

    // initialize form group that will interface with user. Instantiate each form field value with corresponding selectedSubscriber data.
      this.jobParameterFormGroup = new FormGroup({
        job_ID: new FormControl({ 
          value: this.data.selectedParameter.job_ID,
          disabled: true
        }),
        param_TYPE: new FormControl({ 
          value: this.data.selectedParameter.param_TYPE,
          disabled: true
        },[
          Validators.required
        ]),
        param_VALUE: new FormControl({ 
          value: this.data.selectedParameter.param_VALUE,
          disabled: true
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


  /* with a successful form state, return a new job parameter object */
  public fetchDeletedJobParameterURL(): any {

    // send back updated param body
    return this.data.job_ID + "_" + this.jobParameterFormGroup.get('param_SEQ').value;

  }



}

