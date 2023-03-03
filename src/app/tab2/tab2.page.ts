import { Component, OnInit,Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page{
 @Input() formData: any = {};

  constructor(private route: ActivatedRoute) {  }

  ngOnInit() {
   
  }
  rec(event:any){
    this.formData = event
  }
}
