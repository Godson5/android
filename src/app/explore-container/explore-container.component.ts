import { Component, Input, OnInit } from '@angular/core';
import {
  Firestore,
  collectionData,
  CollectionReference,
  DocumentData,
  addDoc,
  updateDoc,
  getDoc,
  where,
  query,
  getDocs,
} from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { Router } from '@angular/router';
import { MyModalPage } from '../my-modal/my-modal.page';
import { deleteDoc,  } from 'firebase/firestore';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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
  data:boolean = true;
  dsd: any = [];
  formDat:FormGroup = new FormGroup({})
  selectedUser: UserData = { name: '', email: '' };
  //users$: Observable<any[]>;
  @Input() send1?: boolean;
  @Input() form1?: boolean;
  constructor(
    private fs: Firestore,
    private router: Router,
    private fb:FormBuilder,
    private alrt: AlertController,
    private modalCtrl: ModalController
  ) {
    console.log(this.formDat);
    
    this.formDat =  this.fb.group({
      id: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{3,5}$')
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),Validators.pattern('^[a-zA-Z0-9_.-]*$')
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ])
    });
  }

  ngOnInit(): void {
    if (this.send1) {
      this.send = true;
      this.get().subscribe((data) => {
        this.dsd = data;
        console.log(data);
        
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
      const id = this.formDat.get('id')?.value;
      const name = this.formDat.get('name')?.value;
      const email = this.formDat.get('email')?.value;
      const data = {
        id: id,
        name: name,
        email:email,
      };
      const formdata: CollectionReference<DocumentData> = collection(
        this.fs,
        'formdata'
      );
      const query1 = query(
        formdata,
        where('email', '==', email),
      );
      console.log(query1 );
  
      // Check if email already exists in Firestore
      const querySnapshot = await getDocs(query1);
      if (querySnapshot.size > 0) {
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
        this.router.navigateByUrl('/tabs/tab1');
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
    // const alert = await this.alrt.create({
    //   header: 'Edit User',
    //   inputs: [
    //     {
    //       name: 'name',
    //       type: 'text',
    //       value: user.name,
    //       placeholder: 'Name',
    //       attributes: {
    //         formControlName: 'name',
    //       },
    //       cssClass: this.nameInvalid ? 'ng-invalid' : '',
    //     },
    //     {
    //       name: 'email',
    //       type: 'email',
    //       value: user.email,
    //       placeholder: 'Email',
    //       attributes: {
    //         formControlName: 'email',
    //       },
    //       cssClass: this.emailInvalid ? 'ng-invalid' : '',
    //     },
    //   ],
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       role: 'cancel',
    //       cssClass: 'secondary',
    //       handler: () => {
    //         console.log('Edit user canceled');
    //       },
    //     },
    //     {
    //       text: 'Save',
    //       handler: (formDat) => {
    //         this.formDat.statusChanges.subscribe((status:any) => {
    //           console.log('Form status:', status);
    //         });
    //         if(formDat.valid){
    //           const formdata: CollectionReference<DocumentData> = collection(
    //             this.fs,
    //             'formdata'
    //           );
    //           console.log('Edit user saved', formDat);
    //           this.selectedUser = user;
    //           this.send1 = false;
    //           const query1 = query(
    //             formdata,
    //             where('id', '==', user.id),
    //           );
  
    //           // Get the document ID from the query results and update the document
    //           getDocs(query1)
    //             .then((querySnapshot) => {
    //               querySnapshot.forEach((doc) => {
    //                 updateDoc(doc.ref, formDat)
    //                   .then(() => {
    //                     console.log('User updated successfully');
    //                     // Reset the form input fields after successful update
    //                     this.formDat.reset();
    //                     // Refresh the list of users after update
    //                     this.get().subscribe((data) => {
    //                       this.dsd = data;
    //                     });
    //                     // Navigate to the user list page after successful update
    //                     this.router.navigateByUrl('/tabs/tab1');
    //                     alert.dismiss(); // Dismiss the alert after successful update
    //                   })
    //                   .catch((error) => {
    //                     console.error('Error updating user:', error);
    //                   });
    //               });
    //             })
    //             .catch((error) => {
    //               console.error('Error getting user document:', error);
    //             });
    //         }
    //         else{
    //           this.nameInvalid = !this.formDat.get('name')?.value.valid;
    //           this.emailInvalid = !this.formDat.get('email')?.value.valid;
    //         }
    //       },
    //     },
    //   ],
    // });
  
    // await alert.present();
    const modal = await this.modalCtrl.create({
      component: MyModalPage,
      componentProps: {
        user: user
      }
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
            const query1 = query(
              formdata,
              where('id', '==', user.id),
            );

            // Get the document ID from the query results and update the document
            getDocs(query1)
              .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  deleteDoc(doc.ref, )
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

}
