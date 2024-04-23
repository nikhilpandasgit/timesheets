import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AddEvent, CancelEvent, EditEvent, GridComponent, GridDataResult, GridModule, PageChangeEvent, RemoveEvent, SaveEvent } from "@progress/kendo-angular-grid";
import { InvoiceService } from '../../services/invoice.service';
import { CompositeFilterDescriptor, GroupDescriptor, SortDescriptor, State, filterBy, groupBy, orderBy } from '@progress/kendo-data-query';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { HeaderComponent } from '../header/header.component';


@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    GridModule,
    LoaderComponent,
    HeaderComponent
  ],
  templateUrl: './invoice-dashboard.component.html',
  styleUrl: './invoice-dashboard.component.css'
})
export class InvoiceDashboardComponent implements OnInit {

  // Variables
  public invoiceData : any[] = [];
  public filteredData : any = [];
  public groups !: GroupDescriptor[];
  public gridView : any = []; 
  public take = 10;
  public skip = 0;
  public total = 0;
  isLoading : boolean = false;

  public lastInvoice = 0;
  
  public formGroup ?: FormGroup;
  private editedRowIndex ?: number;

  constructor(
    private invoiceService : InvoiceService
  ){}

  ngOnInit(){
    this.loadInvoices(this.skip, this.take);
  }

  //Load Invoices from Server/Back-end
  loadInvoices(skip:number, take:number){
    this.invoiceService.getAllInvoices(this.skip, this.take).subscribe((result)=>{
      this.invoiceData = result.data;
      this.total = result.total;
      this.lastInvoice = result.lastIndex.id;
      console.log(this.lastInvoice);
      this.loadItems();
    }) 
  }


  // PageChange
  public pageChangeHandler(event: PageChangeEvent){
    this.skip = event.skip;
    this.loadInvoices(this.skip, this.take);
    this.loadItems();
  } 

  private loadItems(){
    this.gridView = {
      data : this.invoiceData,
      total : this.total
    }
    this.filteredData = this.gridView.data;
  }


  //FilterChange
  public filter: CompositeFilterDescriptor = {
    logic : "and",
    filters : [],
  }

  public filterChange(filter: CompositeFilterDescriptor){
    this.filter = filter;
    console.log(this.filter);
    this.loadFilteredData();
  }

  loadFilteredData(){
    if(this.filter.filters.length === 0){
      this.loadItems();
    }
    else{
      let finalData = filterBy(this.filteredData, this.filter);
      this.gridView = {
        data : finalData,
        total : finalData.length
      }
    }
  }

  
  //Grouping 
  groupChange(groups: GroupDescriptor[]){
    this.groups = groups;
    console.log(this.groups);
    this.loadGroupedItems();
  }

  loadGroupedItems(){
    if(this.groups.length === 0){
      this.loadItems();
    }
    else{
      this.gridView = groupBy(this.filteredData, this.groups);
    }
  }


  //Sorting
  public sort : SortDescriptor[] =
  [{
    field : '',
    dir : 'asc'
  }];

  sortChange(sort: SortDescriptor[]){
    this.sort = sort;
    this.loadSortedItems();
  }

  loadSortedItems(){
    this.gridView = {
      data : orderBy(this.filteredData, this.sort),
      total : this.total
    }
  }

  
  // AddHandler
  addHandler(args: AddEvent){
    this.closeEditor(args.sender);

    this.formGroup = new FormGroup({
      id: new FormControl(this.lastInvoice+1),
      timesheet_id: new FormControl(0),
      worker_id: new FormControl("",Validators.required),
      worker_name: new FormControl("",Validators.required),
      total_amount: new FormControl(0,Validators.required),
      organisation: new FormControl("",Validators.required) 
    })

    args.sender.addRow(this.formGroup);
  }


  public editHandler(args: EditEvent){

    // Starts an Inline Edit Form
    const { dataItem } = args;
    this.closeEditor(args.sender);

    this.formGroup = new FormGroup({
      id: new FormControl(dataItem.id, Validators.required),
      timesheet_id: new FormControl(dataItem.timesheet_id, Validators.required),
      worker_id: new FormControl(dataItem.worker_id, Validators.required),
      worker_name: new FormControl(dataItem.worker_name, Validators.required),
      total_amount: new FormControl(dataItem.total_amount, Validators.required),
      organisation: new FormControl(dataItem.organisation, Validators.required) 
    })
      
    this.editedRowIndex = args.rowIndex;
    args.sender.editRow(args.rowIndex, this.formGroup);
  }

  public saveHandler(args: SaveEvent){

    // console.log(args, args.dataItem.id );
    if(args.isNew === false){
      this.invoiceService
          .editInvoice(args.dataItem.id, args.dataItem)
          .subscribe((result)=>{
            console.log(result);
          })
    }

    


  }


  public removeHandler(event: RemoveEvent){
    this.isLoading = true;
    this.invoiceService.deleteInvoice(event.dataItem.id).subscribe((result)=>{
      console.log(result.message);
      this.loadInvoices(this.skip, this.take);
      this.isLoading = false;
    });
  }


  public cancelHandler(args: CancelEvent): void {
    this.closeEditor(args.sender, args.rowIndex);
  }


  private closeEditor(grid: GridComponent, rowIndex = this.editedRowIndex) {
    // close the editor
    grid.closeRow(rowIndex);
    // reset the helpers
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }


  

  onClick(){
    console.log("clicked");
  }
}



