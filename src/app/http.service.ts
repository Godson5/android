import { Injectable } from "@angular/core";
import {HttpInterceptor,HttpRequest, HttpHandler} from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
}) 

export class http implements HttpInterceptor{
    intercept(req: HttpRequest<any>, next: HttpHandler){
        return next.handle(req)
    };

}
