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
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraPlugin } from '@capacitor/camera';

interface UserData {
  name: string;
  email: string;
}
@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  send: boolean = false;
  form: boolean = false;
  nameInvalid: boolean = false;
  emailInvalid: boolean = false;
  data: boolean = true;
  dsd: any = [];
  formDat: FormGroup = new FormGroup({});
  selectedUser: UserData = { name: '', email: '' };
  //users$: Observable<any[]>;
  @Input() send1?: boolean;
  @Input() form1?: boolean;
  constructor(
    private fs: Firestore,
    private router: Router,
    private fb: FormBuilder,
    private alrt: AlertController,
    private modalCtrl: ModalController
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
      location: new FormControl(''),
      Image: new FormControl('')
    });
  }
  printCurrentPosition = async () => {
    let coordinates;
    const position = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = position.coords;
    coordinates = { latitude, longitude };
    console.log('Current position:', coordinates);
    this.formDat.get('location')?.setValue(JSON.stringify(coordinates));
  };

  ngOnInit(): void {
    if (this.send1) {
      this.send = true;
      this.get().subscribe((data) => {
        this.dsd = data;
        console.log(data);
        this.printCurrentPosition();
        //this.takePicture();
      });
    } else {
      this.form = true;
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
        const docRef = await addDoc(formdata, data);
        console.log('Form data saved successfully:', docRef.id);
  
        this.router.navigateByUrl('/tabs/tab1');
        // Reset the form input fields after successful submission
        this.formDat.reset();
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
          handler: (formData) => {
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
    });
    this.formDat.get('Image')?.setValue(image.path);
  }
  
}
