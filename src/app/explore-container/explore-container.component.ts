import { Component, Input, OnInit } from '@angular/core';
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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
interface UserData {
  name: string;
  email: string;
}
export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}
export class PhotoService {
  public photos: UserPhoto[] = [];
}
@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  send: boolean = false;
  UID: any;
  form: boolean = false;
  nameInvalid: boolean = false;
  emailInvalid: boolean = false;
  data: boolean = false;
  dsd: any = [];
  formDat: FormGroup = new FormGroup({});
  selectedUser: UserData = { name: '', email: '' };
  sum: any = '';
  picImage: any; //variable
  @Input() send1?: boolean;
  @Input() form1?: boolean;
  value: any = '';
  public photos: UserPhoto[] = [];
  constructor(
    private fs: Firestore,
    private router: Router,
    private fb: FormBuilder,
    private alrt: AlertController,
    private modalCtrl: ModalController,
    private storage: Storage,
    private geolocation: Geolocation,
    private permissions: AndroidPermissions,
    public toastController: ToastController,
    public plt: Platform,
    private loadingCtrl: LoadingController
  ) {
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
  printCurrentPosition = async () => {
    let coordinates;
    this.permissions
      .checkPermission(this.permissions.PERMISSION.ACCESS_COARSE_LOCATION)
      .then(
        (result: any) => {
          if (!result.hasPermission) {
            this.permissions.requestPermission(
              this.permissions.PERMISSION.ACCESS_COARSE_LOCATION
            );
          }
        },
        (err: any) => {
          this.permissions.requestPermission(
            this.permissions.PERMISSION.ACCESS_COARSE_LOCATION
          );
        }
      );
    try {
      const position = await this.geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      coordinates = { latitude, longitude };
      console.log('Current position:', coordinates);
      this.formDat.get('location')?.setValue(JSON.stringify(coordinates));
    } catch (error: any) {
      console.log(`the error is`, error);
      if (error.message === 'User denied Geolocation') {
        prompt('fds');
      }
    }
  };

  async ngOnInit() {
    Device.getId().then((uuid) => {
      this.UID = uuid.uuid;
      console.log(uuid.uuid);
    });

    // await this.storage.create();
    // if (this.storage) {
    //   await this.save();
    // }
    if (this.send1) {
      this.send = true;
      this.get().subscribe((data) => {
        this.dsd = data;
      });
    } else {
      this.form = true;
    }
    if (this.dsd.length === 0) {
      const loading = await this.loadingCtrl.create({
        message: 'Fetching Data...',
        duration: 1000,
        spinner: 'circles',
      });

      loading.present();
    } else {
      this.loadingCtrl.dismiss();
    }
  }

  // gets data from fireStore
  get() {
    const sds: CollectionReference<DocumentData> = collection(
      this.fs,
      'formdata'
    );
    return collectionData(sds);
  }

  //saves data to FireStore
  async save() {
    const loading = await this.loadingCtrl.create({
      message: 'Uploading Files...',
      spinner: 'circles',
    });

    loading.present();
    if (this.formDat.valid) {
      // Get form data
      const id = this.formDat.get('id')?.value;
      const name = this.formDat.get('name')?.value;
      const email = this.formDat.get('email')?.value;
      const location = this.formDat.get('location')?.value;
      const img = this.picImage;

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
      console.log(query1);
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
        const docRef = await addDoc(formdata, data);
        console.log('Form data saved successfully:', docRef.id);
        // Reset the form input fields after successful submission
        this.formDat.reset();
        loading.dismiss();
        this.router.navigateByUrl('/tabs/tab1');
      } catch (error) {
        console.error('Error saving form data: ', error);
      }
    } else {
      alert('Provide correct data and check for the correct types');
    }
  }

  //edit user
  async editUser(user: any) {
    const modal = await this.modalCtrl.create({
      component: MyModalPage,
      componentProps: {
        user: user,
      },
    });
    await modal.present();
  }

  //to delete record
  async deleteUser(user: any) {
    const alert = await this.alrt.create({
      header: 'Delete User...?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Edit user canceled');
          },
        },
        {
          text: 'Confirm',
          handler: async (formData) => {
            const loading = await this.loadingCtrl.create({
              message: 'Deleting Data...', 
              spinner: 'circles',
            });

            loading.present();

            const formdata: CollectionReference<DocumentData> = collection(
              this.fs,
              'formdata'
            );
            console.log('Edit user saved', formData);
            this.selectedUser = user;
            this.send1 = false;
            const query1 = query(formdata, where('id', '==', user.id));

            // Get the document ID from the query results and update the document
            getDocs(query1)
              .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  deleteDoc(doc.ref)
                    .then(() => {
                      console.log('User updated successfully');
                      // Reset the form input fields after successful update
                      this.formDat.reset;
                      // Refresh the list of users after update
                      this.get().subscribe((data) => {
                        this.dsd = data;
                        loading.dismiss();
                      });
                      // Navigate to the user list page after successful update
                      this.router.navigateByUrl('/tabs/tab1');
                    })
                    .catch((error) => {
                      console.error('Error updating user:', error);
                    });
                });
              })
              .catch((error) => {
                console.error('Error getting user document:', error);
              });
            this.router.navigateByUrl('/tabs');
          },
        },
      ],
    });

    await alert.present();
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    });
    this.picImage = 'data:image/jpeg;base64,' + image.base64String;
    console.log(image);
    this.formDat.get('Image')?.setValue(`${image.format}`);
    if (image) {
      //his.saveImage(image);
    }
  }

  async saveIt() {}

  async toLcl() {
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
        if ((await statusN).connected == true) {
          const docRef = await addDoc(formdata, data);
          console.log('Form data saved successfully:', docRef.id);

          this.router.navigateByUrl('/tabs/tab1');
          // Reset the form input fields after successful submission
          this.formDat.reset();
          return;
        } else {
          this.storage.set('formData', data);
          console.log(this.storage);
          this.router.navigateByUrl('/tabs/tab1');
          // Reset the form input fields after successful submission
          this.formDat.reset();
          return;
        }
      } catch (error) {
        console.error('Error saving form data: ', error);
      }
    }
  }

  async handleRefresh(event: any) {
    let sum;
    console.log(sum);
    await this.storage.get('formData').then((data) => (sum = data));
    if (sum != undefined) {
      const formdata: CollectionReference<DocumentData> = collection(
        this.fs,
        'formdata'
      );
      const name = await this.storage.get('formData');
      const docRef = await addDoc(formdata, name);
      console.log(name);
      const last = await this.storage.remove('formData');
    }

    event.target.complete();
  }

  async showImg(path: string, name: string) {
    console.log(this.picImage);
    const show = await this.toastController.create({
      //message: `<img id='img'src="${path}" style="width: 40px;
      // height: 40px;">Welcome ${name.toUpperCase()}..!`,
      duration: 1000000,
      position: 'top',
      cssClass: 'new',
      icon: path,
      buttons: [
        {
          text: '❌',
          role: 'cancel',
        },
      ],
    });
    show.present();
  }

  async showUid() {
    Device.getId().then((uuid) => console.log(uuid));
    const show = await this.toastController.create({
      message: `You'r UUID is:${JSON.stringify(this.UID)}..!`,
      duration: 300000,
      position: 'top',
      cssClass: 'new',
      buttons: [
        {
          text: '❌',
          role: 'cancel',
        },
      ],
    });
    show.present();
  }
}
