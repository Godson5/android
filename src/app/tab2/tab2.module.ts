import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { AddComponent } from '../add/add.component';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [Tab2Page,AddComponent],

})
export class Tab2PageModule {}
