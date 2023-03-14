import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { http } from './http.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,provideFirebaseApp(()=>initializeApp(environment.firebase)),provideFirestore(()=> getFirestore()),AngularFireModule,IonicModule,MatProgressSpinnerModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },{provide:HTTP_INTERCEPTORS,useClass: http},Storage,Geolocation,AndroidPermissions],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
