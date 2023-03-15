import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  Firestore,
  collection,
  CollectionReference,
  DocumentData,
  updateDoc,
  where,
  query,
  getDocs,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-my-modal',
  templateUrl: './my-modal.page.html',
  styleUrls: ['./my-modal.page.scss'],
})
export class MyModalPage {
  @Input() user: any;
  formDat: FormGroup = new FormGroup({});
  nameInvalid? = false;
  emailInvalid? = false;
  picImage: any;
  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private fs: Firestore,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {
    this.formDat = this.fb.group({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9_.-]*$'),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      location: new FormControl(''),
      Image: new FormControl(''),
    });
  }

  async ngOnInit() {
    if (this.user) {
      this.formDat.patchValue({
        name: this.user.name,
        email: this.user.email,
        location: this.user.location,
        Image: this.user.img,
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();

    this.router.navigateByUrl('/tabs/tab1');
  }

  async save() {
    const loading = await this.loadingCtrl.create({
      message: 'Updating Files...',
      duration: 1000,
      spinner: 'circles',
    });

    loading.present();
    // Get form data
    const name = this.formDat.get('name')?.value;
    const email = this.formDat.get('email')?.value;
    const location = this.formDat.get('location')?.value;
    const img = this.formDat.get('Image')?.value;

    // Create data object
    const data = {
      name: name,
      email: email,
      location: location,
      img: img,
    };
    if (this.formDat.valid) {
      const formdata: CollectionReference<DocumentData> = collection(
        this.fs,
        'formdata'
      );
      const query1 = query(formdata, where('id', '==', this.user.id));

      // Get the document ID from the query results and update the document
      getDocs(query1).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          updateDoc(doc.ref, data)
            .then(() => {
              console.log('User updated successfully');
              // Reset the form input fields after successful update
              this.formDat.reset();
              this.modalCtrl.dismiss();
              loading.dismiss();
               
              this.router.navigateByUrl('/tabs/tab1');
            })
            .catch((error: any) => {
              console.error('Error updating user:', error);
            });
        });
      });
    } else {
      alert('hi');
    }
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    });
    this.picImage = 'data:image/jpeg;base64,' + image.base64String;
    console.log(this.picImage);
    this.formDat
      .get('Image')
      ?.setValue('data:image/jpeg;base64,' + image.base64String);
    if (image) {
      //his.saveImage(image);
    }
  }

  printCurrentPosition = async () => {
    let coordinates;
    const position = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = position.coords;
    coordinates = { latitude, longitude };
    console.log('Current position:', coordinates);
    this.formDat.get('location')?.setValue(JSON.stringify(coordinates));
  };
}
