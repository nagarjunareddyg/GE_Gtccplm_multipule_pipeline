import { Component, OnInit, Inject } from '@angular/core';

// fetch current logged in user
import { UserSessionService } from '../app/services/general/user-session.service';

@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(public userService:UserSessionService) { }

  ngOnInit() {
    if(window.location.hostname!=='localhost'){
      this.userService.setTimeZoneOffsetOfEnvMilli(new Date().getTimezoneOffset()*60000)
      //this.userService.setTimeZoneOffsetOfEnvMilli(new Date().getTimezoneOffset()*0)
    }else{
      this.userService.setTimeZoneOffsetOfEnvMilli(0)
    }
  }
}
