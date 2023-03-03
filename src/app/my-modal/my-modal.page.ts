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
  addDoc,
  updateDoc,
  getDoc,
  where,
  query,
  getDocs,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
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
  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private fs: Firestore,
    private router: Router
  ) {
    this.formDat = this.fb.group({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9_.-]*$'),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  ngOnInit() {
    if (this.user) {
      this.formDat.patchValue({
        name: this.user.name,
        email: this.user.email,
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
    this.router.navigateByUrl('/tabs/tab1');
  }

  save(formDat:any) {
    const form = {name:this.formDat.get('name')?.value,email:this.formDat.get('email')?.value}
    console.log(form);
    
    if (this.formDat.valid) {
      const formdata: CollectionReference<DocumentData> = collection(
        this.fs,
        'formdata'
      );
      const query1 = query(formdata, where('id', '==', this.user.id));

      // Get the document ID from the query results and update the document
      getDocs(query1)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, form)
              .then(() => {
                console.log('User updated successfully');
                // Reset the form input fields after successful update
                this.formDat.reset();
                // Refresh the list of users after update
                // Navigate to the user list page after successful update
                this.modalCtrl.dismiss();
              })
              .catch((error: any) => {
                console.error('Error updating user:', error);
              });
          });
        })
        .catch((error: any) => {
          console.error('Error getting user document:', error);
        });
    } else {
      // if(this.formDat.get('name')?.value.invalid){
      //   this.nameInvalid = !this.formDat.get('name')?.value.valid;
      // }
      // else if(this.formDat.get('name')?.value.invalid){
      //   this.emailInvalid = !this.formDat.get('email')?.value.valid;
      // }
    }
  }
}
