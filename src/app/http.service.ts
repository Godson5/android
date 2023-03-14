import { Injectable, OnInit } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class http implements HttpInterceptor, OnInit {
  number: number = 93;
  constructor(private storage: Storage) {}
  //this.storage.get('formData').then((data) => {
  //this.storage.remove('formData');
  //});
  async ngOnInit() {
    alert('data fetched')
    let data = await this.storage.get('formData');
    if(data){
     data.then(() => {
       this.storage.remove('formData');
     });
    }
   }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      setHeaders: { Authorization: `Authorization token ${this.number}` },
    });
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          // client-side error
          errorMessage = `Error: ${error.error.message}`;
          console.log(errorMessage);
        } else if (error.status === 0) {
          // network error
          errorMessage = 'No internet connection';
          alert(errorMessage);
          console.log(errorMessage);

          // Store the form data in Ionic Storage

        } else {
          // server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(errorMessage);
      })
    );
  }
}
