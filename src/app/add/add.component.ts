import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collectionData,
  CollectionReference,
  DocumentData,
  addDoc,
  where,
  query,
  getDocs,
} from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { Router } from '@angular/router';
import { MyModalPage } from '../my-modal/my-modal.page';
import { deleteDoc } from 'firebase/firestore';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
  Camera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AnyARecord } from 'dns';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit {
  formDat: FormGroup = new FormGroup({});

  constructor( private fs: Firestore,
    private router: Router,
    private fb: FormBuilder,
    private alrt: AlertController,
    private modalCtrl: ModalController,
    private storage: Storage,
    private geolocation: Geolocation,
    private permissions:AndroidPermissions) {
    this.formDat = this.fb.group({
      id: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{3,5}$'),
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9_.-]*$'),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      location: new FormControl('', Validators.required),
      Image: new FormControl('', Validators.required),
    });
   }

  ngOnInit() {
    alert('hi')
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
    });
    this.formDat.get('Image')?.setValue(`${image.webPath}.${image.format}`);
    console.log(image);
  }
  
  printCurrentPosition = async () => {
    let coordinates;
    this.permissions.checkPermission(this.permissions.PERMISSION.ACCESS_COARSE_LOCATION).then((result:any) =>{
      if(!result.hasPermission){
        this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_COARSE_LOCATION)
      }
    },(err:any)=>{
      this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_COARSE_LOCATION)

    }
    )
    try{
      const position = await this.geolocation.getCurrentPosition()
      const { latitude, longitude } = position.coords;
      coordinates = { latitude, longitude };
      console.log('Current position:', coordinates);
      this.formDat.get('location')?.setValue(JSON.stringify(coordinates));
    }
    catch(error:any){
     console.log(`the error is`,error);
     if(error.message === "User denied Geolocation"){
      prompt('fds')
     }
    }
    
  };

   //saves data to FireStore
   async save() {
    if (this.formDat.valid) {
      // Get form data
      const id = this.formDat.get('id')?.value;
      const name = this.formDat.get('name')?.value;
      const email = this.formDat.get('email')?.value;
      const location = this.formDat.get('location')?.value;
      const img = this.formDat.get('Image')?.value;

      // Create data object
      const data = {
        id: id,
        name: name,
        email: email,
        location: location,
        img: img,
      };
      // Get Firestore collection reference
      const formdata: CollectionReference<DocumentData> = collection(
        this.fs,
        'formdata'
      );

      // Check if email already exists in Firestore
      const query1 = query(formdata, where('email', '==', email));
      const querySnapshot = await getDocs(query1);
      if (querySnapshot.size > 0) {
        // Email already exists
        this.formDat.reset();
        const alert = await this.alrt.create({
          header: 'Email Already used',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Edit user canceled');
              },
            },
          ],
        });
        await alert.present();
        return;
      }

      try {
        // Creating a new user
        const logCurrentNetworkStatus = async () => {
          const status = await Network.getStatus();
        
          console.log('Network status:', status);
          return status;
        };
        let statusN = logCurrentNetworkStatus();
        if((await statusN).connected == true){
          const docRef = await addDoc(formdata, data);
          console.log('Form data saved successfully:', docRef.id);
  
          this.router.navigateByUrl('/tabs/tab1');
          // Reset the form input fields after successful submission
          this.formDat.reset();
          return;
        }
        else{
          this.storage.set('formData',data);
          console.log(this.storage);
          this.router.navigateByUrl('/tabs/tab1');
          // Reset the form input fields after successful submission
          this.formDat.reset();
          return;
        }
        
      } catch (error) {
        console.error('Error saving form data: ', error);
      }
    } else if(this.storage != null){ 
      const formdata: CollectionReference<DocumentData> = collection(
        this.fs,
        'formdata'
      );
      const name = await this.storage.get('formData');
     // const docRef = await addDoc(formdata, name);
      console.log(name)
      const last = await this.storage.remove('formData');
    } else {
      alert('Provide correct data and check for the correct types');
    }
  }

}
