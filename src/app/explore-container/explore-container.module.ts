import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { ExploreContainerComponent } from './explore-container.component';


@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule,ReactiveFormsModule,MatProgressSpinnerModule],
  declarations: [ExploreContainerComponent],
  exports: [ExploreContainerComponent],
  providers:[Storage]
})
export class ExploreContainerComponentModule { }
