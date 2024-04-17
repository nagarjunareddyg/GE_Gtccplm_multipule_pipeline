import { Component, OnInit, ViewChild } from '@angular/core';

import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  // toggle between record view and list view - initialize to list view
  @ViewChild('tabs') matTabGroup: MatTabGroup;

  public dateTime: Date;

  constructor() { }

  ngOnInit() {
  }

  // event of selecting a job, automatically switch to the record view page. 
  updateMatTabIndex(selectedMatTabIndex: number) {
    this.matTabGroup.selectedIndex = selectedMatTabIndex;
  }

}
