import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {provideFirebaseApp,initializeApp} from '@angular/fire/app';
import {getFirestore,provideFirestore} from '@angular/fire/firestore';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { AngularFireModule } from '@angular/fire/compat';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,provideFirebaseApp(()=>initializeApp(environment.firebase)),provideFirestore(()=> getFirestore()),AngularFireModule,IonicModule,MatProgressSpinnerModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
