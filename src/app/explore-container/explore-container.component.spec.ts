import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { environment } from 'src/environments/environment';


import {provideFirebaseApp,initializeApp} from '@angular/fire/app';
import {getFirestore,provideFirestore} from '@angular/fire/firestore';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { AngularFireModule } from '@angular/fire/compat';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ExploreContainerComponent } from './explore-container.component';

describe('ExploreContainerComponent', () => {
  let component: ExploreContainerComponent;
  let fixture: ComponentFixture<ExploreContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExploreContainerComponent],
      imports: [IonicModule.forRoot(),BrowserModule, IonicModule.forRoot(),provideFirebaseApp(()=>initializeApp(environment.firebase)),provideFirestore(()=> getFirestore()),AngularFireModule,IonicModule,MatProgressSpinnerModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
