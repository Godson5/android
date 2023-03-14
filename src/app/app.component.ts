import { Component,OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  constructor( private permissions:AndroidPermissions) {}
  ngOnInit() {
      
  }   
}
