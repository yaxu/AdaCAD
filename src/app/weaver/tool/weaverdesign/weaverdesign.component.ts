import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { NgForm } from '@angular/forms';
import { CollectionService } from '../../../core/provider/collection.service';
import * as _ from 'lodash';



@Component({
  selector: 'app-weaverdesign',
  templateUrl: './weaverdesign.component.html',
  styleUrls: ['./weaverdesign.component.scss']
})


export class WeaverDesignComponent implements OnInit {
  @Input()  collapsed;
  @Input()  design_mode;
  @Input()  design_modes;
  @Input()  design_actions;
  @Input()  view_mode;
  @Input()  materials;
  @Input()  patterns;
  @Input()  selection;
  @Output() onDesignModeChange: any = new EventEmitter();
  @Output() onFill: any = new EventEmitter();
  @Output() onPaste: any = new EventEmitter();
  @Output() onCopy: any = new EventEmitter();
  @Output() onClear: any = new EventEmitter();
  @Output() onPatternChange: any = new EventEmitter();
  @Output() onCreatePattern: any = new EventEmitter();
  @Output() onRemovePattern: any = new EventEmitter();


  button_color = "#ff4081";


  selected = 0;

  //Temporary data structures until db access
  collections: any[] = []
  collection: any;
  generativeMode = false;

  constructor(private dialog: MatDialog, private collectionSrvc: CollectionService) { 
    // collectionSrvc.getCollectionNames.then((value) => {
    //   console.log('value returned:', value);
    //   this.collections = value;
    //   this.collection = "";
    // });
    this.collections = [];
    this.collection = {name: ""};
    collectionSrvc.getCollectionNames().then((value) => {
      this.collections = value;
      this.collection = {name: this.collections[0]};
    })
    // var tempSaving = collectionSrvc.getCollectionNames();
    // console.log('tempSaving in constructor:', tempSaving);
    // console.log('this.collections:', this.collections);
    // console.log('this.collections[0]:', this.collections[0]);
    // this.collection = {name: this.collections[0]};
  }
  // ngAfterViewInit() {
  //   console.log('in ngAfterInit of weaverdesign.component.ts');
  //   this.collections = this.collectionSrvc.getCollectionNames();
  //   console.log('this.collections:', this.collections);
  //   console.log('this.collections[0]:', this.collections[0]);
  //   this.collection = {name: this.collections[0]};
  // }

  ngOnInit() {
  }

  designModeChange(e: any) {

    console.log(e.target.name);
    this.design_mode = e.target.name;

     var obj: any = {};
     obj.name = this.design_mode;
     this.onDesignModeChange.emit(obj);
  }

  drawWithMaterial(e: any){
    this.design_mode = 'material';
    var obj: any = {};
    obj.name = this.design_mode;
    obj.id = e.target.name;
    this.onDesignModeChange.emit(obj);
  }

  designActionChange(e){
    console.log(e.target.name);

    switch(e.target.name){
      case 'up': this.clearEvent(true);
      break;

      case 'down': this.clearEvent(false);
      break;

      case 'copy': this.copyEvent(e);
      break;

      case 'paste': this.pasteEvent(e, 'original');
      break;

      case 'toggle': this.pasteEvent(e, 'invert');
      break;

      case 'flip_x': this.pasteEvent(e, 'mirrorX');
      break;

      case 'flip_y': this.pasteEvent(e, 'mirrorY');
      break;

      case 'shift_left': this.pasteEvent(e, 'shiftLeft');
      break;

      case 'shift_up': this.pasteEvent(e, 'shiftUp');
      break;

    }
  }

  fillEvent(id) {
    var obj: any = {};
    obj.id = id;
    this.onFill.emit(obj);
  }

  copyEvent(e) {
    this.onCopy.emit();
  }

  clearEvent(b:boolean) {
    this.onClear.emit(b);
  }

  pasteEvent(e, type) {
    var obj: any = {};
    obj.type = type;
    this.onPaste.emit(obj);
  }


  updatePatterns(obj: any){
    this.onPatternChange.emit(obj);
  }

  removePattern(pattern) {
    this.onRemovePattern.emit(pattern);
  }


  createPattern(obj){
    this.onCreatePattern.emit(obj);
  }

}
