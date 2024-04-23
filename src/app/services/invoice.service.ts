import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(
    private httpClient : HttpClient
  ) { }

  getAllInvoices(skip:number, take:number){
    const allInvoices = `http://127.0.0.1:8000/api/invoice?skip=${skip}&take=${take}`;

    return this.httpClient.get<any>(allInvoices);
  }

  editInvoice(id:number, invoiceData:any[]){

    const editInvoice = `http://127.0.0.1:8000/api/invoice/edit?id=${id}&data=${invoiceData}`

    return this.httpClient.get<any>(editInvoice);
  }


  deleteInvoice(id:any){
    const removeInvoice = `http://127.0.0.1:8000/api/invoice/delete?invoiceId=${id}`

    return this.httpClient.get<any>(removeInvoice);
  }
  
}
