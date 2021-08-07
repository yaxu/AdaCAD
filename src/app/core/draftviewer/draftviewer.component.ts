import { ComponentFactoryResolver, ElementRef, HostListener, Inject } from '@angular/core';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { Render } from '../model/render';
import { Selection } from '../model/selection';
import { Cell } from '../model/cell';
import { Interlacement } from '../model/datatypes';
import { Draft } from '../model/draft';
import { Loom } from '../model/loom';
import { Pattern } from '../model/pattern';
import {cloneDeep, now} from 'lodash';
import { FileService } from '../provider/file.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionComponent } from './selection/selection.component';

@Component({
  selector: 'app-draftviewer',
  templateUrl: './draftviewer.component.html',
  styleUrls: ['./draftviewer.component.scss']
})
export class DraftviewerComponent implements OnInit {

  @ViewChild('bitmapImage', {static: false}) bitmap;
  @ViewChild('selection', {read: SelectionComponent, static: true}) selection: SelectionComponent;

  @Input('design_actions')  design_actions;


  /**
   * a descriptor of the parent who generated this window
   * @property {string} will be "weaver" or "mixer"
   */
   @Input('source') source: string;


 /// ATTRIBUTES
  /**
   * Contains the name of the brush being used to manipulate the weave draft.
   * It is defined and inputed from the HTML declaration of the WeaveDirective.
   * @property {string}
   */
   @Input('design_mode') design_mode: any;

   /**
    * The Draft object containing the pattern and shuttle information.
    * It is defined and inputed from the HTML declaration of the WeaveDirective.
    * @property {Draft}
    */
   @Input('draft') weave: Draft;
 
 
   /**
  * The Draft object containing the pattern and shuttle information.
  * It is defined and inputed from the HTML declaration of the WeaveDirective.
  * @property {Draft}
  */
  @Input('loom') loom: Loom;
 
 
 
 /**
    * The Render object containing the variables about zoom and cell sizes.
    * It is defined and inputed from the HTML declaration of the WeaveDirective.
    * @property {Render}
   */
   @Input('render') render:Render;
 
 
 
 /**
    * The Timeline object containing state histories for undo and redo
    * @property {Timeline}
   */
   @Input('timeline') timeline: any;
 
 
 
   @Input() copy: Pattern;
 
 
   @Output() onNewSelection = new EventEmitter();
 
 
 
 /**
    * The HTML canvas element within the weave draft.
    * @property {HTMLCanvasElement}
   */ 
   canvasEl: HTMLCanvasElement;
 
 /**
    * the window holding the draft.
    * @property {HTMLCanvasElement}
   */ 
   draftContainer: HTMLElement;
 
 
   /**
    * flag defining if there needs to be a recomputation of the draft on Mouse Up
    */
   flag_recompute: boolean;
 
 
   /**
    * flag defining if there needs to be a recomputation of the draft on Mouse Up
    */
   flag_history: boolean;
 
 
   /**
    * The 2D context of the canvas
    * @property {any}
    */
   cx: any;
 
   /**
    * The 2D context of the threading canvas
    * @property {any}
    */
   cxThreading: any;
 
   /**
    * The 2D context of the treadling canvas
    * @property {any}
    */
   cxTreadling: any;
 
   /**
    * The 2D context of the treadling canvas
    * @property {any}
    */
   cxTieups: any;
 
   /**
    * The 2D context of the weft_systems canvas
    * @property {any}
    */
   cxWeftSystems: any;
 
   /**
    * The 2D context of the warp_systems canvas
    * @property {any}
    */
   cxWarpSystems: any;
 
 
   cxWarpMaterials: any;
 
 
 
   cxWeftMaterials: any;
 
 
   /**
    * Subscribes to move event after a touch event is started.
    * @property {Subscription}
    */
   moveSubscription: Subscription;
 
 
   /**
    * The HTML div element used to show the weft-systems text.
    * @property {HTMLElement}
    */
   divWesy: HTMLElement;
 
   /**
    * The HTML div element used to show the warp-systems text.
    * @property {HTMLElement}
    */
   divWasy: HTMLElement;
 
 
   /**
    * The HTML div element used to show and hide the frames.
    * @property {HTMLElement}
    */
   divViewFrames: HTMLElement;
 
 
  /**
    * The HTML SVG element used to show the row
    * @property {HTMLElement}
    */
   svgSelectRow: HTMLElement;
 
 
  /**
    * The HTML SVG element used to show the row
    * @property {HTMLElement}
    */
   svgSelectCol: HTMLElement;
 
 
   /**
    * The HTML canvas element within the weave draft for threading.
    * @property {HTMLCanvasElement}
    * 
    */
   threadingCanvas: HTMLCanvasElement;
 
     /**
    * The HTML canvas element within the weave draft for treadling.
    * @property {HTMLCanvasElement}
    * 
    */
   treadlingCanvas: HTMLCanvasElement;
 
   /**
    * The HTML canvas element within the weave draft for tieups.
    * @property {HTMLCanvasElement}
    * 
    */
   tieupsCanvas: HTMLCanvasElement;
 
 
 
   weftSystemsCanvas: HTMLCanvasElement;
   warpSystemsCanvas: HTMLCanvasElement;
 
 
   weftMaterialsCanvas: HTMLCanvasElement;
   warpMaterialsCanvas: HTMLCanvasElement;
 
   private tempPattern: Array<Array<Cell>>;
   private unsubscribe$ = new Subject();
 
   private lastPos: Interlacement;
 
 
 
   /// ANGULAR FUNCTIONS
   /**
    * Creates the element reference.
    * @constructor
    */

  constructor(
    private fs: FileService
    ) { 

    this.flag_recompute = false;
    this.flag_history = false;

  }

  ngOnInit() {

  }

  ngAfterViewInit(){

    // define the elements and context of the weave draft, threading, treadling, and tieups.
    this.canvasEl = <HTMLCanvasElement> document.getElementById('drawdown');
    this.draftContainer = <HTMLElement> document.getElementById('draft-container');


  
    // this.svgSelectRow = el.nativeElement.children[12];
    // this.svgSelectCol = el.nativeElement.children[13];
    this.divWesy =  document.getElementById('weft-systems-text');
    this.divWasy =  document.getElementById('warp-systems-text');
    this.divViewFrames = document.getElementById('view_frames');

    this.threadingCanvas = <HTMLCanvasElement> document.getElementById('threading');
    this.tieupsCanvas = <HTMLCanvasElement> document.getElementById('tieups');
    this.treadlingCanvas = <HTMLCanvasElement> document.getElementById('treadling');
    this.weftSystemsCanvas = <HTMLCanvasElement> document.getElementById('weft-systems');
    this.weftMaterialsCanvas = <HTMLCanvasElement> document.getElementById('weft-materials');
    this.warpSystemsCanvas = <HTMLCanvasElement> document.getElementById('warp-systems');
    this.warpMaterialsCanvas =<HTMLCanvasElement> document.getElementById('warp-materials');
    
    this.cx = this.canvasEl.getContext('2d');
    this.cxThreading = this.threadingCanvas.getContext('2d');
    this.cxTreadling = this.treadlingCanvas.getContext('2d');
    this.cxTieups = this.tieupsCanvas.getContext('2d');
    this.cxWarpSystems = this.warpSystemsCanvas.getContext('2d');
    this.cxWeftSystems = this.weftSystemsCanvas.getContext('2d');
    this.cxWarpMaterials = this.warpMaterialsCanvas.getContext('2d');
    this.cxWeftMaterials = this.weftMaterialsCanvas.getContext('2d');
    // set the width and height

    this.rescale(this.render.getZoom());

  }

  //this is called anytime a new draft object is loaded. 
  onNewDraftLoaded() {  

    var dims = this.render.getCellDims("base");

    this.canvasEl.width = this.weave.warps * dims.w;
    this.canvasEl.height = this.weave.wefts * dims.h;
    this.threadingCanvas.width = this.weave.warps * dims.w;
    this.threadingCanvas.height = this.loom.min_frames * dims.h;
    this.treadlingCanvas.height = this.weave.wefts * dims.h;
    this.treadlingCanvas.width = this.loom.min_treadles * dims.w;
    this.tieupsCanvas.width = this.loom.min_treadles*dims.w;
    this.tieupsCanvas.height = this.loom.min_frames * dims.h;


    this.weftSystemsCanvas.width =  dims.w;
    this.weftSystemsCanvas.height = this.weave.wefts * dims.h;
    this.weftMaterialsCanvas.width =  dims.w;
    this.weftMaterialsCanvas.height = this.weave.wefts * dims.h;

    this.warpSystemsCanvas.width =  this.weave.warps * dims.w;
    this.warpSystemsCanvas.height = dims.h;
    this.warpMaterialsCanvas.width =  this.weave.warps * dims.w;
    this.warpMaterialsCanvas.height = dims.h;


  }

  clearSelection(){
        this.selection.unsetParameters();
        // d3.select(this.svgSelectCol).style('display', 'none');
        // d3.select(this.svgSelectRow).style('display', 'none');
  }

  ngOnDestroy() {
     this.removeSubscription();
  }


  /**
   *  takes an event from mouse event and determines how to handle it 
   * @param target the dom target of the mouse click
   * @param shift whether or not the shift key is being held
   * @param currentPos the position of the click within the target
   */
  setPosAndDraw(target:HTMLElement, shift: boolean, currentPos:Interlacement){

      if (target && target.id =='treadling') {
        currentPos.i = this.render.visibleRows[currentPos.i];
        this.drawOnTreadling(currentPos);
      } else if (target && target.id === 'tieups') {
        currentPos.i = this.loom.frame_mapping[currentPos.i];
        this.drawOnTieups(currentPos);
      } else if (target && target.id === ('threading')) {
        currentPos.i = this.loom.frame_mapping[currentPos.i];
        this.drawOnThreading(currentPos);
      } else if(target && target.id === ('weft-systems')){
        currentPos.i = this.render.visibleRows[currentPos.i];
        this.drawOnWeftSelectors(currentPos);
      }else if(target && target.id === ('warp-systems')){
        this.drawOnWarpSelectors(currentPos);
      }else if(target && target.id === ('weft-materials')){
        currentPos.i = this.render.visibleRows[currentPos.i];
        this.drawOnWeftMaterials(currentPos);
      }else if(target && target.id === ('warp-materials')){
        this.drawOnWarpMaterials(currentPos);
      } else{
        currentPos.i = this.render.visibleRows[currentPos.i];
        this.drawOnDrawdown(currentPos, shift);
      }

      this.flag_history = true;
    }



  /**
   * Touch start event. Subscribes to the move event.
   * @extends WeaveDirective
   * @param {Event} event - The mousedown event.
   * @returns {void}
   */
  @HostListener('mousedown', ['$event'])
  private onStart(event) {

    //get dimis based on zoom.
    let dims ={
      w: this.warpSystemsCanvas.width / this.weave.warps,
      h: this.weftSystemsCanvas.height / this.render.visibleRows.length
    }

    if (event.target.localName === 'canvas') {
    
      this.removeSubscription();    
      
      this.moveSubscription = 
        fromEvent(event.target, 'mousemove').subscribe(e => this.onMove(e));   

      // set up the Point to be used.
      var screen_row = Math.floor(event.offsetY / dims.h);

      const currentPos: Interlacement = {
        si: screen_row,
        i: screen_row, //row
        j: Math.floor((event.offsetX) / dims.w), //col
      };

      if(currentPos.i < 0 || currentPos.i >= this.render.visibleRows.length) return;
      if(currentPos.j < 0 || currentPos.j >= this.weave.warps) return;

      if(event.target && event.target.id==="drawdown"){
        currentPos.si -=1;
        currentPos.i -=1;
        currentPos.j -=1;
      }

      if(currentPos.i < 0 || currentPos.i >= this.render.visibleRows.length) return;
      if(currentPos.j < 0 || currentPos.j >= this.weave.warps) return;
      

      // Save temp pattern
      this.tempPattern = cloneDeep(this.weave.pattern);
      switch (this.design_mode.name) {
        case 'toggle':
          this.setPosAndDraw(event.target, event.shiftKey, currentPos);
          //this.unsetSelection();
        break;

        case 'up':
        case 'down':
        case 'unset':
        case 'material':
          this.setPosAndDraw(event.target, event.shiftKey, currentPos);
          // this.unsetSelection();
          this.flag_recompute = true;

          break;
        case 'maskpoint':
        case 'maskerase':
        case'maskinvert':
          this.drawOnMask(currentPos);
          break;
        case 'select':
        case 'copy':

            if(event.shiftKey){
              this.selection.onSelectDrag(currentPos);
              this.selection.onSelectStop();
            }   
            else this.selection.onSelectStart(event.target, currentPos);

          break;
          default:
          break;
      }

      this.lastPos = {
        si: currentPos.si,
        i: currentPos.i, //row
        j: currentPos.j //col
      };

      // this.segment = {
      //   start: [currentPos.si, currentPos.i, currentPos.j],
      //   end: [currentPos.si, currentPos.i, currentPos.j],
      //   pattern: null,
      //   id: generateId(),
      // }
    }
  }

  private isSame(p1: Interlacement, p2:Interlacement){
    if(p1 === undefined || p2 === undefined ) return false
    return (p1.i == p2.i && p1.j === p2.j);

  }



  /**
   * Event called when mouse down and moved within the canvas.
   * @extends WeaveDirective
   * @param {Event} event - The mousemove event.
   * @returns {void}
   */
  private onMove(event) {

    let dims ={
      w: this.warpSystemsCanvas.width / this.weave.warps,
      h: this.weftSystemsCanvas.height /this.render.visibleRows.length
    };    

    var offset = this.render.getCellDims(this.design_mode.name);
  
    // set up the point based on touched square.
    var screen_row = Math.floor((event.offsetY + offset.y) / dims.h);

    const currentPos: Interlacement = {
      si: screen_row,
      i:  screen_row,
      j:  Math.floor((event.offsetX + offset.x) / dims.w)
    };

   


    if(event.target && event.target.id==="drawdown"){
      currentPos.si -=1;
      currentPos.i -=1;
      currentPos.j -=1;
    }

   

    //don't call unless you've moved to a new spot
    if(this.isSame(currentPos, this.lastPos)) return;

    // determine action based on brush type. invert inactive on move.
    switch (this.design_mode.name) {
      case 'up':
      case 'down':
      case 'unset':
      case 'material':
       //this.unsetSelection();

        if(currentPos.i < 0 || currentPos.i >= this.render.visibleRows.length) return;
        if(currentPos.j < 0 || currentPos.j >= this.weave.warps) return;


        this.setPosAndDraw(event.target, event.shiftKey, currentPos);
        this.flag_recompute = true;


        
        break;

      case 'maskpoint':
      case 'maskerase':
      case'maskinvert':
        this.drawOnMask(currentPos);
        break;


      case 'select':
      case 'copy':

        this.selection.onSelectDrag(currentPos);

        break;
      case 'invert':
      default:
        break;
    }

    this.lastPos = {
        si: currentPos.si,
        i: currentPos.i, //row
        j: currentPos.j //col
      };
  }

  /**
   * Event removes subscription when touch has ended.
   * @extends WeaveDirective
   * @param {Event} event - The mouseleave or mouseup event.
   * @returns {void}
   */
  @HostListener('mouseleave', ['$event'])
  @HostListener('mouseup', ['$event'])
  private onEnd(event) {
     this.lastPos = {
      si: -1,
      i: -1,
      j: -1
     }

     if(this.flag_history && event.type == 'mouseup'){
        this.timeline.addHistoryState(this.weave);
        this.flag_history = false;
      } 


     if(this.flag_recompute && event.type == 'mouseup'){
      if(this.render.isYarnBasedView()) this.weave.computeYarnPaths();
      this.flag_recompute = false;
     }



    // remove subscription unless it is leave event with select.
    if (!(event.type === 'mouseleave' && (this.design_mode.name === 'select' || this.design_mode.name ==='copy'))) {
      this.removeSubscription();
      this.selection.onSelectStop();
      if(this.design_mode.name != "copy" && this.selection.hasSelection()) this.copyArea();
    }

  }

  /**
   * Remove the subscription from the move event.
   * @extends WeaveDirective
   * @returns {void}
   */
 private removeSubscription() {    
    if (this.moveSubscription) {
      this.moveSubscription.unsubscribe();
    }
  }

  /**
   * Creates the copied pattern. Hack for warp and weft shuttles is that it creates a 2d arrray representing the 
   * threading or treadling with "true" in the frame/threadle associated with that col/row. 
   * @extends WeaveDirective
   * @returns {void}
   */
  private copyArea() {


    const screen_i = this.selection.getStartingScreenIndex();    
    const draft_j = this.selection.getEndingIndex();
    

    var w = this.selection.getWidth();
    var h = this.selection.getHeight();

    this.copy = new Pattern({name: 'copy', width: w, height: h});
    const temp_copy: Array<Array<boolean>> = [];

    if(this.selection.getTargetId() === 'weft-systems'){
      for(var i = 0; i < h; i++){
        temp_copy.push([]);
        for(var j = 0; j < this.weave.weft_systems.length; j++){
          temp_copy[i].push(false);
        }
      }
    }else if(this.selection.getTargetId()=== 'warp-systems'){
      for(var i = 0; i < this.weave.warp_systems.length; i++){
        temp_copy.push([]);
        for(var j = 0; j < w; j++){
          temp_copy[i].push(false);
        }
      }
    }else if(this.selection.getTargetId()=== 'weft-materials'){
      for(var i = 0; i < h; i++){
        temp_copy.push([]);
        for(var j = 0; j < this.weave.shuttles.length; j++){
          temp_copy[i].push(false);
        }
      }
    }else if(this.selection.getTargetId() === 'warp-materials'){
      for(var i = 0; i < this.weave.shuttles.length; i++){
        temp_copy.push([]);
        for(var j = 0; j < w; j++){
          temp_copy[i].push(false);
        }
      }
    }else{
       for (var i = 0; i < h; i++){
        temp_copy.push([]);
        for (var j = 0; j < w; j++){
          temp_copy[i].push(false);
        }
       }
    }


    //iterate through the selection
    for (var i = 0; i < temp_copy.length; i++) {
      for(var j = 0; j < temp_copy[0].length; j++) {

        var screen_row = screen_i + i;
        var draft_row = this.render.visibleRows[screen_row];
        var col = draft_j + j;

        switch(this.selection.getTargetId()){
          case 'drawdown':
            temp_copy[i][j]= this.weave.isUp(draft_row, col);
          break;
          case 'threading':
              var frame = this.loom.frame_mapping[screen_row];
              temp_copy[i][j]= this.loom.isInFrame(col,frame);

          break;
          case 'treadling':
            temp_copy[i][j] = this.loom.isInTreadle(screen_row,col);
          break;
          case 'tieups':
              var frame = this.loom.frame_mapping[screen_row];
              temp_copy[i][j] = this.loom.hasTieup({i: frame, j: col, si: screen_row});
          break;  
          case 'warp-systems':
            temp_copy[i][j]= (this.weave.colSystemMapping[col] == i);
          break;
          case 'weft-systems':
            temp_copy[i][j]= (this.weave.rowSystemMapping[draft_row] == j);
          break;
          case 'warp-materials':
            temp_copy[i][j]= (this.weave.colShuttleMapping[col] == i);
          break;
          case 'weft-materials':
            temp_copy[i][j]= (this.weave.rowShuttleMapping[draft_row] == j);
          break;
          default:
          break;
        }

      }
    }

    this.copy.setPattern(temp_copy);
    this.onNewSelection.emit(this.copy);



  }





  private drawWeftMaterialCell(cx, i){
        var dims = this.render.getCellDims("base");
        var margin = this.render.zoom;

        cx.fillStyle = this.weave.getColor(i, this.render.visibleRows);

        if(i == this.weave.wefts-1) cx.fillRect(margin, (dims.h*i)+margin, dims.w, dims.h-(margin*2));
        else cx.fillRect(margin, (dims.h*i)+margin, dims.w, dims.h-(margin));
  
  }


  private drawWeftMaterials(cx, canvas){

      var dims = this.render.getCellDims("base");
      var margin = this.render.zoom;
      var top = dims.h;

      cx.clearRect(0,0, cx.canvas.width, cx.canvas.height);


      canvas.width =  dims.w;
      canvas.height = this.render.visibleRows.length * dims.h;

      cx.fillStyle = "white";
      cx.fillRect(0,0,canvas.width,this.render.visibleRows.length*dims.h);

      for(var i = 0 ; i < this.render.visibleRows.length; i++){
          this.drawWeftMaterialCell(cx, i);        
      }


  }

  private drawWarpMaterialCell(cx, j){


        var dims = this.render.getCellDims("base");
        var margin = this.render.zoom;
        cx.fillStyle = this.weave.getColorCol(j);

        if(j == this.weave.warps-1) cx.fillRect((dims.w*j)+margin, 0, dims.w-(margin*2), (dims.h) - margin);
        else cx.fillRect( (dims.w*j)+margin, 0, dims.w-margin, (dims.h) - margin);
  
  }


  private drawWarpMaterials(cx,canvas){

    var dims = this.render.getCellDims("base");
    var margin = this.render.zoom;

    this.warpMaterialsCanvas.width =  this.weave.warps * dims.w;
    this.warpMaterialsCanvas.height = dims.h;

    cx.fillStyle = "white";
    cx.fillRect(0,0,canvas.width,canvas.height);
  

    for(var j = 0; j < this.weave.warps; j++){
      this.drawWarpMaterialCell(cx, j);
    } 

  }




  private drawWeftSelectorCell(cx, i){

        var dims = this.render.getCellDims("base");
        var margin = this.render.zoom;

        cx.fillStyle = "#303030";
        if(i == this.weave.wefts-1) cx.fillRect(margin, (dims.h*i)+margin, dims.w, dims.h-(margin*2));
        else cx.fillRect(margin, (dims.h*i)+margin, dims.w, dims.h-(margin));
         
         cx.fillStyle = "#ffffff";  
         cx.font = "10px Arial";
         cx.fillText(this.weave.getWeftSystemCode(i, this.render.visibleRows), dims.w/3, (dims.h*i)+3*dims.h/4);

  }


  private drawWeftSystems(cx, canvas){

    

      var dims = this.render.getCellDims("base");
      var top = dims.h;

      cx.clearRect(0,0, cx.canvas.width, cx.canvas.height);


      canvas.width =  dims.w;
      canvas.height = this.render.visibleRows.length * dims.h;

      cx.fillStyle = "white";
      cx.fillRect(0,0,canvas.width,this.render.visibleRows.length*dims.h);

      for(var i = 0 ; i < this.render.visibleRows.length; i++){
          this.drawWeftSelectorCell(cx, i);        
      }


  }

  private drawWarpSelectorCell(cx, j){


        var dims = this.render.getCellDims("base");
        var margin = this.render.zoom;
        cx.fillStyle = "#303030";

        if(j == this.weave.warps-1) cx.fillRect((dims.w*j)+margin, 0, dims.w-(margin*2), (dims.h) - margin);
        else cx.fillRect( (dims.w*j)+margin, 0, dims.w-margin, (dims.h) - margin);
  
         cx.fillStyle = "#ffffff";  
         cx.font = "10px Arial";
         cx.fillText(this.weave.getWarpSystemCode(j),(dims.w*j)+dims.w/3, dims.w-(margin*3));


  }


  private drawWarpSystems(cx,canvas){

    var dims = this.render.getCellDims("base");

    this.warpSystemsCanvas.width =  this.weave.warps * dims.w;
    this.warpSystemsCanvas.height = dims.h;

    cx.fillStyle = "white";
    cx.fillRect(0,0,canvas.width,canvas.height);
  

    for(var j = 0; j < this.weave.warps; j++){
      this.drawWarpSelectorCell(cx, j);
    } 

  }


  /**
   * Draws the grid lines onto the canvas.
   * @extends WeaveDirective
   * @returns {void}
   */
  private drawBlank(cx,canvas) {

    cx.fillStyle = "#3d3d3d";
    cx.fillRect(0,0,canvas.width,canvas.height);
   
  }

  /**
   * Draws the grid lines onto the canvas.
   * @extends WeaveDirective
   * @returns {void}
   */
  private drawGrid(cx,canvas) {
    var i,j;

    var dims = this.render.getCellDims("base");

    if(canvas.id=== "threading"){
      cx.fillStyle = "white";
      cx.fillRect(0,0,canvas.width,canvas.height);
      cx.fillStyle = "#cccccc";
      cx.fillRect(0, 0, canvas.width, (this.loom.num_frames - this.loom.min_frames)*dims.h);
    }
    else if (canvas.id=== "treadling"){
      cx.fillStyle = "white";
      cx.fillRect(0,0,canvas.width,canvas.height);
      cx.fillStyle = "#cccccc";
      var start = this.loom.min_treadles * dims.w;
      cx.fillRect(start, 0, canvas.width - start, canvas.height);

    }
    else if (canvas.id=== "tieups"){
      cx.fillStyle = "white";
      cx.fillRect(0,0,canvas.width,canvas.height);
      cx.fillStyle = "#cccccc";
      var start = this.loom.min_treadles * dims.w;
      cx.fillRect(start, 0, canvas.width - start, canvas.height);
      cx.fillRect(0, 0, canvas.width, (this.loom.num_frames - this.loom.min_frames)*dims.h);

    }


    cx.fillStyle="black";
    cx.lineWidth = .5;
    cx.lineCap = 'round';
    cx.strokeStyle = '#000';

    //only draw the lines if the zoom is big enough to render them well

     //cx.lineWidth = this.render.zoom/100;

     //cx.setLineDash([dims.w/20,dims.w/4]);

      // draw vertical lines
      for (i = 0; i <= canvas.width; i += dims.w) {
        //if(canvas.id === "treadling" && i === (this.loom.min_treadles)*dims.w) cx.setLineDash([0]);
        //else if(canvas.id === "tieups" && i === (this.loom.min_treadles)*dims.w) cx.setLineDash([0]);
        
        //else  cx.setLineDash([dims.w/20,dims.w/4]);
        
          if(canvas.id == 'drawdown'){
            if(i > dims.w && i < canvas.width - dims.w){
            cx.beginPath();
            cx.moveTo(i, dims.h);
            cx.lineTo(i, canvas.height-dims.h);
            cx.stroke();
            }
          }else{
            cx.beginPath();
            cx.moveTo(i, 0);
            cx.lineTo(i, canvas.height);
            cx.stroke();
          }
        

      }

      // draw horizontal lines
      for (i = 0; i <= canvas.height; i += dims.h) {
        //if(canvas.id === "threading" && i === (this.loom.num_frames - this.loom.min_frames)*dims.h) cx.setLineDash([0]);
        //else if(canvas.id === "tieups" && i === (this.loom.num_frames - this.loom.min_frames)*dims.h) cx.setLineDash([0]);
        //else  cx.setLineDash([dims.w/20,dims.w/4]);

        if(canvas.id == "drawdown"){
          if(i > dims.h && i < canvas.height - dims.h){
          cx.beginPath();
          cx.moveTo(dims.w, i);
          cx.lineTo(canvas.width-dims.w, i);
          cx.stroke();
          }
        }else{
          cx.beginPath();
          cx.moveTo(0, i);
          cx.lineTo(canvas.width, i);
          cx.stroke();
        }
      }


      // reset the line dash.
      //cx.setLineDash([0]);
    
  }




  /**
   * Change shuttle of row to next in list. If there isn't a next in list, create a new System
   * @extends WeaveComponent
   * @param {Point} the point of the interaction
   * @returns {void}
   */
  private drawOnWeftSelectors( currentPos: Interlacement ) {

    var dims = this.render.getCellDims("base");

    var updates;

    if (!this.cx || !currentPos) { return; }

    var draft_row = currentPos.i; //need to offset this due to canvas padding
   
    var screen_row = currentPos.si;

    if(screen_row < 0){ return; }

    var newSystem = this.weave.getNextWeftSystem(draft_row);

    this.weave.rowSystemMapping[draft_row] = newSystem;

    this.weave.updateSystemVisibility('weft');

    this.redraw({weft_systems: true});



  }


    /**
   * Change shuttle of row to next in list.
   * @extends WeaveComponent
   * @param {Point} the point of the interaction
   * @returns {void}
   */
  private drawOnWeftMaterials( currentPos: Interlacement ) {

    var dims = this.render.getCellDims("base");
    var updates;

    if (!this.cx || !currentPos) { return; }

    var draft_row = currentPos.i; //need to offset this due to canvas padding
    var screen_row = currentPos.si;

    if(screen_row < 0){ return; }

    if(this.design_mode.name === 'material'){
      this.weave.rowShuttleMapping[draft_row] = parseInt(this.design_mode.id);
    }else{
      const len = this.weave.shuttles.length;
      var shuttle_id = this.weave.rowShuttleMapping[draft_row];
      var newShuttle = (shuttle_id + 1) % len;
      this.weave.rowShuttleMapping[draft_row] = newShuttle;
    }
    this.redraw({weft_materials: true, drawdown:true});

  }

  /**
   * Change column to next row in the list
   * @extends WeaveComponent
   * @param {Point} the point of the interaction
   * @returns {void}
   */
  private drawOnWarpSelectors( currentPos: Interlacement ) {

    var dims = this.render.getCellDims("base");

    if (!this.cxWarpSystems || !currentPos) { return; }

    var col = currentPos.j; //need to offset this due to canvas padding

    if(col < 0){ return; }

    var newSystem = this.weave.getNextWarpSystem(col);

    this.weave.colSystemMapping[col] = newSystem;

    this.weave.updateSystemVisibility('warp');
    this.drawWarpSelectorCell(this.cxWarpSystems,(col));
    this.redraw({warp_systems: true});
  }


  /**
   * Change column to next row in the list
   * @extends WeaveComponent
   * @param {Point} the point of the interaction
   * @returns {void}
   */
  private drawOnWarpMaterials( currentPos: Interlacement ) {

    var dims = this.render.getCellDims("base");

    if (!this.cxWarpSystems || !currentPos) { return; }

    var col = currentPos.j; //need to offset this due to canvas padding

    if(col < 0){ return; }


    if(this.design_mode.name === 'material'){
        this.weave.colShuttleMapping[col] = parseInt(this.design_mode.id);
    }else{
      const len = this.weave.shuttles.length;
      var shuttle_id = this.weave.colShuttleMapping[col];
      var newShuttle_id = (shuttle_id + 1) % len;
      this.weave.colShuttleMapping[col] = newShuttle_id;
    }

  
    this.drawWarpSelectorCell(this.cxWarpMaterials,col);
    this.redraw({warp_materials:true, drawdown:true}); //full redraw or just this column?
  }

 /**
   * Draws, inverts, or erases a single rectangle on the mask. 
   * @extends WeaveDirective
   * @param {Point} currentPos - the current position of the mouse within draft.
   * @returns {void}
   */
  private drawOnMask( currentPos: Interlacement ) {
    var updates;
    var val;

    if (!this.cx || !currentPos) { return; }

    // Set the heddles based on the brush.
    switch (this.design_mode.name) {
      case 'maskpoint':
        val = true;
        break;
      case 'maskerase':
        val = false;
        break;
      case 'maskinvert':
         val = !this.weave.isMask(currentPos.i,currentPos.j);
        break;        
      default:
        break;
    }

    this.weave.setMask(currentPos.i,currentPos.j,val);
    this.drawCell(this.cx,currentPos.si, currentPos.j, "mask");
    this.redraw({mask: true});
  }





  /**
   * Called when a single point "draw" event is called on the
   * @param {Point} currentPos - the current position of the mouse within draft.
   * @param shift - boolean for if the shift key was being held when this operation was called
   * @returns {void}
   */

  private drawOnDrawdown( currentPos: Interlacement, shift: boolean) {

    var updates;
    var val  = false;


    if (!this.cx || !currentPos) { return; }


    if(this.weave.hasCell(currentPos.i, currentPos.j)){

      // Set the heddles based on the brush.
      switch (this.design_mode.name) {
        case 'up':
          val = true;
          this.weave.setHeddle(currentPos.i,currentPos.j,val);
          break;
        case 'down':
          val = false;
          this.weave.setHeddle(currentPos.i,currentPos.j,val);
          break;
        case 'toggle':
          if(shift){
            val = null;
          } 
          else val = !this.weave.isUp(currentPos.i,currentPos.j);
          this.weave.setHeddle(currentPos.i,currentPos.j,val);

          break;

        case 'unset':
            this.weave.setHeddle(currentPos.i,currentPos.j,null);
 
        break;
        case 'material':
          this.drawOnWeftMaterials(currentPos);
          this.drawOnWarpMaterials(currentPos)
        break;        
        default:
          break;
      }


      // if(this.render.getCurrentView() == 'pattern'){
      //   this.drawCell(this.cx,currentPos.si, currentPos.j, "drawdown");
      // }else{
      //   this.drawYarn(currentPos.si, currentPos.j, val);
      // }

        
      if(this.design_mode.name !== 'material')
        if(this.render.showingFrames()) this.loom.updateLoomFromDraft(currentPos, this.weave);
      
      this.redraw({drawdown:true, loom:true});
      
    }
    
  }

  /**
   * Draws or erases a single rectangle on the canvas. Updates the tieups.
   * @extends WeaveDirective
   * @param {Point} currentPos - the current position of the mouse within draft.
   * @returns {void}
   */
  private drawOnTieups( currentPos: Interlacement ) {
    var updates;
    var val = false;
    
    if (!this.cxTieups || !currentPos) { return; }

    if (this.loom.inTieupRange(currentPos)) {
      switch (this.design_mode.name) {
        case 'up':
            val = true;
          break;
        case 'down':
          val = false;
          break;
        case 'toggle':
          val = !this.loom.tieup[currentPos.i][currentPos.j];
          break;
        default:
          break;
      }
    
    updates = this.loom.updateTieup({i:currentPos.i,j: currentPos.j, val:val});
    this.weave.updateDraftFromTieup(updates, this.loom);
    //this.drawCell(this.cxTieups, currentPos.i, currentPos.j, "tieup");
    this.redraw({drawdown:true, loom:true});
    
    
    }
  }

  /**
   * Draws or erases a single rectangle on the canvas. Updates the threading.
   * @extends WeaveDirective
   * @param {Point} currentPos - the current position of the mouse within draft.
   * @returns {void}
   */
  private drawOnThreading( currentPos: Interlacement ) {
    if (!this.cxThreading || !currentPos) { return; }
    

    if (this.loom.inThreadingRange(currentPos)){
      var val = false;

      switch (this.design_mode.name) {
        case 'up':
          val = true;
          break;
        case 'down':
          val = false;
          break;
        case 'toggle':
          val = !(this.loom.threading[currentPos.j] == currentPos.i);
          break;
        default:
          break;
      }

  
      const updates = this.loom.updateThreading({i:currentPos.i, j:currentPos.j, val:val});
      this.weave.updateDraftFromThreading(updates, this.loom);

      if(this.loom.min_frames < this.loom.num_frames){
        this.loom.updateUnused(this.loom.threading, this.loom.min_frames, this.loom.num_frames, "threading")
      }  

      this.redraw({drawdown:true, loom:true});

      //temporarily disabled, as it causes errors, for now, just redraw the whole state
      // for(var u in updates){
      //   this.drawCell(this.cxThreading,updates[u].i, updates[u].j, "threading");
      // }
          
     // if(unused) this.redrawLoom();

    }
  }


  /**
   * Draws or erases a single rectangle on the canvas. Updates the treadling.
   * @extends WeaveDirective
   * @param {Point} currentPos - the current position of the mouse within draft.
   * @returns {void}
   */
  private drawOnTreadling( currentPos: Interlacement ) {


    if (!this.cxTreadling || !currentPos) { return; }
    
    var val = false;

    if(this.loom.inTreadlingRange(currentPos)){
      switch (this.design_mode.name) {
        case 'up':
          val = true;
          break;
        case 'down':
          val = false;
          break;
        case 'toggle':
          val = !(this.loom.treadling[currentPos.i] === currentPos.j);
          break;
        default:
          break;
      }


      //this updates the value in the treadling
      var updates = this.loom.updateTreadling({i:currentPos.i, j:currentPos.j, val:val});
      this.weave.updateDraftFromTreadling(updates, this.loom);

      // for(var u in updates){
      //   this.drawCell(this.cxTreadling,updates[u].i, updates[u].j, "treadling");
      // }
      if( this.loom.min_treadles <  this.loom.num_treadles){
        this.loom.updateUnused(this.loom.treadling, this.loom.min_treadles, this.loom.num_treadles, "treadling")
      }
      //if(unused) this.redrawLoom();
      this.redraw({drawdown:true, loom:true});

    }
   }



  /**
   * Fills in selected area of canvas. Updates the pattern within selection.
   * @extends WeaveDirective
   * @param {Selection} selection - defined user selected area to fill.
   * @param {Array<Array<boolean>>} - the pattern used to fill the area.
   * @param {string} - the type of logic used to fill selected area.
   * @returns {void}
   */
  // private fillArea(
  //   selection: Selection, 
  //   pattern: Array<Array<boolean>>, 
  //   type: string
  // ) {

  //   console.log("fill area called");
  //   console.log(selection, pattern, type);

  //   var dims = this.render.getCellDims("base");
  //   var updates = [];
    
  //   var screen_i = Math.min(selection.start.si, selection.end.si)
  //   const draft_i = Math.min(selection.start.i, selection.end.i);
  //   const draft_j = Math.min(selection.start.j, selection.end.j);
  
  //   const rows = pattern.length;
  //   const cols = pattern[0].length;

  //   var w,h;

  //   w = Math.ceil(selection.width);
  //   h = Math.ceil(selection.height);


  //   if(selection.target.id === "warp-systems"){
  //     h = pattern.length;
  //     screen_i = 0;
  //   } 
  //   if(selection.target.id === "weft-systems"){
  //     w = pattern[0].length;
  //   } 

  //   if(selection.target.id === "warp-materials"){
  //      h = pattern.length;
  //      screen_i = 0;
  //   }
  //   if(selection.target.id === "weft-materials"){
  //     w = pattern[0].length;
  //   } 

  //   //cycle through each visible row/column of the selection
  //   for (var i = 0; i < h; i++ ) {
  //     for (var j = 0; j < w; j++ ) {

  //       var row = i + screen_i;
  //       var col = j + draft_j;


  //       var temp = pattern[i % rows][j % cols];
       
  //       var prev = false; 
  //       switch(selection.target.id){

  //         case 'drawdown':
  //             var draft_row = this.render.visibleRows[row];
  //             prev = this.weave.pattern[draft_row][col].isUp();

  //         break;
  //         case 'threading':
  //             var frame = this.loom.frame_mapping[row];
  //             prev = this.loom.isInFrame(col, frame);
          
  //         break;
  //         case 'treadling':
  //             var draft_row = this.render.visibleRows[row];
  //             prev = (this.loom.isInTreadle(draft_row, col)); 
  //         break;
  //         case 'tieups':
  //             var frame = this.loom.frame_mapping[row];
  //             prev = this.loom.hasTieup(frame,col); 
          
  //         break;
  //         default:
  //         break;
  //       }

  //       if (prev !== null){

  //         var val = false;
  //         switch (type) {
  //           case 'invert':
  //            val = !temp;
  //             break;
  //           case 'mask':
  //            val = temp && prev;
  //             break;
  //           case 'mirrorX':
  //             val = pattern[(h - i - 1) % rows][j % cols];
  //             break;
  //           case 'mirrorY':
  //             val = pattern[i % rows][(w - j - 1) % cols];
  //             break;
  //           default:
  //             val = temp;
  //             break;
  //         }


  //         var updates = [];

  //         switch(selection.target.id){
           
  //          case 'drawdown':
  //          var draft_row = this.render.visibleRows[row];

  //           if(this.weave.hasCell(draft_row,col)){

  //               var p = new Point(); 
  //               p.si = row;
  //               p.i = this.render.visibleRows[row];
  //               p.j = col;
              
  //               this.weave.setHeddle(p.i,p.j,val);
  //               this.updateLoomFromDraft(p);
  //             }

  //           break;
            
  //           case 'threading':
  //           var frame = this.loom.frame_mapping[row];

  //             if(this.loom.inThreadingRange(frame,col)){ 
  //               updates = this.loom.updateThreading(frame, col, val);
  //               this.weave.updateDraftFromThreading(updates); 
  //             }
  //           break;

  //           case 'treadling':
              
  //            var draft_row = this.render.visibleRows[row];
  //            if(this.loom.inTreadlingRange(draft_row,col)){ 
  //               updates = this.loom.updateTreadling(draft_row, col, val);
  //               this.weave.updateDraftFromTreadling(updates);
  //             }
  //           break;
  //           case 'tieups':
  //             var frame = this.loom.frame_mapping[row];

  //             if(this.loom.inTieupRange(frame, col)){
  //               updates = this.loom.updateTieup(frame, col, val);
  //               this.weave.updateDraftFromTieup(updates);
  //             }
  //           break;
  //           case 'weft-systems':
  //             var draft_row = this.render.visibleRows[row];
  //             val = pattern[i % rows][j % cols];
  //             if(val && col < this.weave.weft_systems.length) this.weave.rowSystemMapping[draft_row] = col;
            
  //           break;
  //           case 'warp-systems':
  //             val = pattern[i % rows][j % cols];
  //             if(val && row < this.weave.warp_systems.length){
  //                 this.weave.colSystemMapping[col] = row;
  //             }
  //           break;
  //           case 'weft-materials':
  //             var draft_row = this.render.visibleRows[row];
  //             val = pattern[i % rows][j % cols];
  //             if(val && col < this.weave.shuttles.length) this.weave.rowShuttleMapping[draft_row] = col;
            
  //           break;
  //           case 'warp-materials':
  //             val = pattern[i % rows][j % cols];
  //             if(val && row < this.weave.shuttles.length){
  //                 this.weave.colShuttleMapping[col] = row;
  //             }
  //           break;
  //           default:
  //           break;
  //         }
  //       }


  //     }
  //   }

  //   var u_threading = this.loom.updateUnused(this.loom.threading, this.loom.min_frames, this.loom.num_frames, "threading");
  //   var u_treadling = this.loom.updateUnused(this.loom.treadling, this.loom.min_treadles, this.loom.num_treadles, "treadling");
  //   this.addHistoryState();
  //   this.redraw();
  //   this.redrawLoom();

  // }



  /**
   * Fills the visible regions of the mask with the stitch
   * @extends WeaveDirective
   * @param {Array<Array<boolean>>} - the pattern used to fill the area.
   * @returns {void}
   */


  private maskArea(pattern: Array<Array<boolean>>) {
   

    // var dims = this.render.getCellDims("base");
    // var updates = [];

    // const rows = pattern.length;
    // const cols = pattern[0].length;


    // //iterate through cell
    // for (var i = 0; i < this.weave.pattern.length; i++ ) {
    //   for (var j = 0; j < this.weave.pattern[0].length; j++ ) {
        
    //     var row = this.render.visibleRows[i];
    //     var col = j;
    //     var temp = pattern[i % rows][j % cols];
    //     var prev = this.weave.mask[row][col];
    //     var val = temp && prev;

    //     var p = new Point(); 
    //     p.i = row;
    //     p.j = col;
        
    //     this.weave.setHeddle(p.i,p.j,val);
    //     this.drawCell(this.cx,p.i, p.j, "drawdown");
    //   }
    // }

   // this.redraw();

   }


//   //This function draws whatever the current value is at screen coordinates cell i, J
// private drawYarn(i, j, value){

//   if(this.weave.yarn_paths.length == 0) return;
      
//       let p = this.weave.yarn_paths[i][j+1];
//       let s = this.weave.shuttles[p.getShuttle()];
//       p.setHeddle(value);

//       //check no poles

//       //no matter what, draw this cell up or down
//       if(p.isUp() && this.render.isFront() || !p.isUp() && !this.render.isFront()){
//           this.drawWeftUnder(i, j, s);
//         }
//         else{
//           this.drawWeftOver(i, j, s);
//       }

//   }


//This function draws whatever the current value is at screen coordinates cell i, J
  private drawCell(cx, i, j, type){


    var base_dims = this.render.getCellDims("base");
    var base_fill = this.render.getCellDims("base_fill");
    var has_mask = false;
    var is_up = false;
    var is_set = false;
    var color = "#FFFFFF";
    var beyond = false;

    var top = 0; 
    var left = 0;



    switch(type){
      case 'drawdown':
      case 'mask':
        var row = this.render.visibleRows[i];
        
        is_up = this.weave.isUp(row,j);
        is_set = this.weave.isSet(row,j);

        if(!this.render.isFront()) is_up = !is_up;
        has_mask = this.weave.isMask(row,j);

        if(!is_set){
          color = "#cccccc";
        }
        else {
          if(is_up) color = "#333333";
           else if(has_mask) color = "#CCCCCC";
        }

        top = base_dims.h;
        left = base_dims.w;

      break;
      case 'threading':
        var frame = this.loom.threading[j];
        is_up = (frame == i);
        beyond = frame > this.loom.min_frames; 
        has_mask = false;
        
        if(is_up)  color = "#333333";
        i = this.loom.frame_mapping[frame];

      break;
      case 'tieup':
        is_up = (this.loom.tieup[i][j]);
        beyond = i > this.loom.min_frames; 
        has_mask = false;
        if(is_up) color = "#333333";
        i = this.loom.frame_mapping[i];

      break;
      case 'treadling':
        //i and j is going to come from the UI which is only showing visible rows
        var row = this.render.visibleRows[i];
        beyond = this.loom.treadling[row] > this.loom.min_treadles; 
        is_up = (this.loom.treadling[row] == j);
        has_mask = false;
        if(is_up)  color = "#333333";

      break;

    }

     //cx.fillStyle = color;
     cx.fillStyle = color;
     if(color != '#FFFFFF') cx.fillRect(left+j*base_dims.w + base_fill.x, top+i*base_dims.h + base_fill.y, base_fill.w, base_fill.h);


  }

  /**
   * Redraws one row to avoid drawing the entire canvas.
   * @extends WeaveDirective
   * @returns {void}
   */
  private redrawRow(y, i, cx) {
 
    for (var j = 0; j < this.weave.warps; j++) {
      this.drawCell(this.cx, i, j, "drawdown");
    }
  }

  //   /**
  //  * Redraws one row to avoid drawing the entire canvas.
  //  * @extends WeaveDirective
  //  * @returns {void}
  //  */
  private redrawCol(x, i,cx) {
    // var color = '#000000'

    // // Gets color of col.
    // color = this.weave.getColorCol(i);
    // cx.fillStyle = color;
  }




  public drawWeftLeftUp(top, left, shuttle){
      var dims = this.render.getCellDims("base");
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;

      top += dims.h/2;


      cx.lineWidth = shuttle.getThickness()/100 * .9*dims.h;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();
      cx.shadowColor = 'white';
      cx.shadowOffsetX = 0;
      cx.shadowOffsetY = .5;

      cx.beginPath();
      cx.moveTo(left,top);
      cx.arcTo(left+dims.w/2, top, left+dims.w/2, top - dims.h/2, dims.w/2);
      cx.stroke();
  }

  public drawWeftRightUp(top, left, shuttle){
      //console.log("draw right up", top, left);
      var dims = this.render.getCellDims("base");
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;

      top += dims.h/2;


      cx.lineWidth = shuttle.getThickness()/100 * .9*dims.h;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();
      cx.shadowColor = 'white';
      cx.shadowOffsetX = 0;
      cx.shadowOffsetY = .5;

      cx.beginPath();
      cx.moveTo(left+dims.w,top);
      cx.arcTo(left+dims.w/2, top, left+dims.w/2, top-dims.h/2, dims.w/2);
      cx.stroke();
  }

  public drawWeftBottomLeft(top, left, shuttle){
      //console.log("draw bottom left", top, left);
      var dims = this.render.getCellDims("base");
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;

      top += dims.h/2;


      cx.lineWidth = shuttle.getThickness()/100 * .9*dims.h;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();
      cx.shadowColor = 'white';
      cx.shadowOffsetX = .5;
      cx.shadowOffsetY = 0;

      cx.beginPath();
      cx.moveTo(left+dims.w/2,top+dims.h/2);
      cx.arcTo(left+dims.w/2, top, left, top, dims.w/2);
      cx.stroke();
  }

  public drawWeftBottomRight(top, left, shuttle){
      //console.log("draw bottom right", top, left);
      var dims = this.render.getCellDims("base");
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;

      top += dims.h/2;


      cx.lineWidth = shuttle.getThickness()/100 * .9*dims.h;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();
      cx.shadowColor = 'white';
      cx.shadowOffsetX = .5;
      cx.shadowOffsetY = 0;

      cx.beginPath();
      cx.moveTo(left+dims.w/2,top+dims.h/2);
      cx.arcTo(left+dims.w/2, top, left+dims.w, top, dims.w/2);
              cx.stroke();
  }


  public drawWeftUp(top, left, shuttle){
     //console.log("draw under", top, left);
      var dims = this.render.getCellDims("base");
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;

      left += dims.w/2

      var width = shuttle.getThickness()/100 * .9*dims.w;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor()
      cx.lineWidth = width;
      cx.shadowColor = 'white';
      cx.shadowOffsetX = .5;
      cx.shadowOffsetY = 0;

      cx.beginPath();
      cx.moveTo(left, top);
      cx.lineTo(left, top+dims.h);
      cx.stroke();

  }

  public drawWeftStart(top, left, shuttle){
 //console.log("draw over", top, left);
      var dims = this.render.getCellDims("base");
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;


      top += dims.h/2;


      cx.lineWidth = shuttle.getThickness()/100 * .9*dims.h;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();
      cx.fillStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();


      cx.beginPath();
      var circle = new Path2D();
      circle.arc(left+dims.w/2, top, dims.h/2, 0, 2 * Math.PI);
      cx.fill(circle);


}

public drawWeftEnd(top, left, shuttle){
 //console.log("draw over", top, left);
      var dims = this.render.getCellDims("base");
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;


      top += dims.h/2;


      cx.lineWidth = 1;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();
      cx.fillStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();

      cx.beginPath();
      var circle = new Path2D();
      circle.arc(left+dims.w/2, top, dims.h/2, 0, 2 * Math.PI);
      cx.stroke(circle);


}

 //break down all cells into the various kinds of drawings
  public drawWeftOver(top, left, shuttle){
      //console.log("draw over", top, left);
      var dims = this.render.getCellDims("base");
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;

      top += dims.h/2;


      cx.lineWidth = shuttle.getThickness()/100 * .9*dims.h;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();
      cx.shadowColor = 'white';
      cx.shadowOffsetX = 0;
      cx.shadowOffsetY = .5;

      cx.beginPath();
      cx.moveTo(left, top);
      cx.lineTo(left+dims.w, top);
      cx.stroke();

  }

   //break down all cells into the various kinds of drawings
  public drawWeftUnder(top, left, shuttle){
      //console.log("draw under", top, left);
      var dims = this.render.getCellDims("base");
      var warp_shuttle = this.weave.shuttles[this.weave.colShuttleMapping[left]];
      var cx = this.cx;
      var view = this.render.getCurrentView();

      if(left < -1 || left > this.weave.warps) return;

      left = (left+1)*dims.w;
      top =  (top + 1) * dims.h;

      top += dims.h/2

      var warp_width = warp_shuttle.getThickness()/100 * .9*dims.w;
      var stroke_width = shuttle.getThickness()/100 * .9*dims.h;
      var margin = (.9*dims.w - warp_width)/2;

      cx.lineWidth = stroke_width;
      cx.strokeStyle = (view === "yarn" && shuttle.type === 0) ? shuttle.getColor()+"10" : shuttle.getColor();
      cx.shadowColor = 'white';
      cx.shadowOffsetX = 0;
      cx.shadowOffsetY = .5;

      cx.fillStyle = "#393939";
      cx.fillRect(left, top-dims.h/2, dims.w, dims.h);

      cx.beginPath();
      cx.moveTo(left, top);
      cx.lineTo(left+margin, top);
      cx.stroke();
  
      cx.beginPath();
      cx.moveTo(left+margin+warp_width, top);
      cx.lineTo(left+dims.w, top);
      cx.stroke();
     
      cx.lineWidth = warp_width;
      cx.strokeStyle = (view === "yarn" && warp_shuttle.type === 0) ? warp_shuttle.getColor()+"10" : warp_shuttle.getColor();

      cx.beginPath();
      cx.moveTo(left+dims.w/2, top-dims.h/2);
      cx.lineTo(left+dims.w/2, top+dims.h/2);
      cx.stroke();

  }

  /**
   * called on scroll
   * @param scroll_top 
   * @param scroll_left 
   */
  public reposition(scroll_top: number, scroll_left: number){

  }

  //flips the view from front to back
  public flip(){
    console.log('flip');
    const container: HTMLElement = document.getElementById('draft-scale-container');
    container.style.transformOrigin = '50% 50%';
    if(this.render.view_front) container.style.transform = "matrix(1, 0, 0, 1, 0, 0) scale(" + this.render.getZoom() + ')';
    else container.style.transform = "matrix(-1, 0, 0, 1, 0, 0) scale(" + this.render.getZoom() + ')';

  }

  /**
   * this rescales the canvas and updates the view from scroll events
   * receives offset of the scroll from the CDKScrollable created when the scroll was initiated
   */
  //this does not draw on canvas but just rescales the canvas
  public rescale(zoom: number){
    console.log("rescale");

  //   //var dims = this.render.getCellDims("base");
    const container: HTMLElement = document.getElementById('draft-scale-container');
    container.style.transformOrigin = 'top center';
    container.style.transform = 'scale(' + zoom + ')';

   
   }


  public drawWarpsOver(){


    for (var i = 0; i < this.render.visibleRows.length ; i++) {
       
        const row_index = this.render.visibleRows[i];
        const row_values = this.weave.pattern[row_index];
        

        let overs = [];
        if(this.render.isFront()){
          overs = row_values.reduce((overs, v, idx) => v.isUp() ? overs.concat([idx]) : overs, []);
        }else{
          overs = row_values.reduce((overs, v, idx) => !v.isUp() ? overs.concat([idx]) : overs, []);
        }

        for(var o in overs){
            const shuttle_id = this.weave.colShuttleMapping[overs[o]];
            const system_id = this.weave.colSystemMapping[overs[o]];
            if(this.weave.warp_systems[system_id].isVisible()) this.drawWeftUp(i, overs[o], this.weave.shuttles[shuttle_id]);
        }

    }


  }

  


  public redrawYarnView(){

    let started:boolean = false;

    for(let i = 0; i < this.render.visibleRows.length; i++){

      let index_row = this.render.visibleRows[i];

      let row_values = this.weave.pattern[index_row];

      let shuttle_id = this.weave.rowShuttleMapping[index_row];

      let s = this.weave.shuttles[shuttle_id];

      //iterate through the rows
      for(let j = 0; j < row_values.length; j++){
        
        let p = row_values[j];

        if(p.isEastWest())  this.drawWeftOver(i,j,s);
        if(p.isSouthWest()) this.drawWeftBottomLeft(i,j,s);
       // if(p.isNorthSouth())this.drawWeftUp(i, j, s);
        if(p.isSouthEast()) this.drawWeftBottomRight(i,j,s);
        if(p.isNorthWest()) this.drawWeftLeftUp(i,j,s);
        if(p.isNorthEast()) this.drawWeftRightUp(i, j, s);

      }
    }

  }

 


 //draws any updates from a change in a part of the drawdown on the threading, tieup, and treadling
 //will update height if a new row/column is added but for zoom, call redrawLoomSize
  public drawLoomStates(updates) {

    var dims = this.render.getCellDims("base");

    //if the new value in outside of the visible range, redraw the entire loom
    if((this.loom.num_frames)*dims.h > (this.cxThreading.canvas.height)){ 
      this.redrawLoom();
      return;
    }

    for(var u in updates.threading){    
       this.drawCell( this.cxThreading, updates.threading[u].i, updates.threading[u].j, "threading");
    }

   
    if((this.loom.num_treadles)*dims.w > this.cxTreadling.canvas.width){ 
      this.redrawLoom();
      return;
    }

    for(var u in updates.treadling){   
      this.drawCell( this.cxTreadling, updates.treadling[u].i, updates.treadling[u].j, "treadling");
    }

    for(var u in updates.tieup){
      for(var j in updates.tieup[u]){
        this.drawCell( this.cxTieups, updates.tieup[u][j].i, updates.tieup[u][j].j, "tieup");
      }
    }
  }



  public redrawLoom() {

    var base_dims = this.render.getCellDims("base");
    var front = this.render.isFront();

    this.cxThreading.clearRect(0,0, this.cxThreading.canvas.width, this.cxThreading.canvas.height);
    this.cxTreadling.clearRect(0,0, this.cxTreadling.canvas.width, this.cxTreadling.canvas.height);
    this.cxTieups.clearRect(0,0, this.cxTieups.canvas.width, this.cxTieups.canvas.height);


    this.cxThreading.canvas.width = base_dims.w * this.loom.threading.length;
    this.cxThreading.canvas.height = base_dims.h * this.loom.num_frames;
    this.drawGrid(this.cxThreading,this.threadingCanvas);
   // else this.drawBlank(this.cxThreading,this.threadingCanvas);

    this.cxTreadling.canvas.width = base_dims.w * this.loom.num_treadles;
    this.cxTreadling.canvas.height = base_dims.h * this.render.visibleRows.length;
    this.drawGrid(this.cxTreadling,this.treadlingCanvas);
    //else this.drawBlank(this.cxTreadling,this.treadlingCanvas);

    this.cxTieups.canvas.width = base_dims.w * this.loom.tieup[0].length;
    this.cxTieups.canvas.height = base_dims.h * this.loom.tieup.length;
    this.drawGrid(this.cxTieups,this.tieupsCanvas);
    //else this.drawBlank(this.cxTieups,this.tieupsCanvas);
    


    for (var j = 0; j < this.loom.threading.length; j++) {
      this.drawCell(this.cxThreading, this.loom.threading[j], j, "threading");
    }

    //only cycle through the visible rows
    for (var i = 0; i < this.render.visibleRows.length; i++) {
       this.drawCell(this.cxTreadling, i, this.loom.treadling[this.render.visibleRows[i]], "treadling");
    }

    for (var i = 0; i < this.loom.tieup.length; i++) {
      for(var j = 0; j < this.loom.tieup[i].length; j++){
        if(this.loom.tieup[i][j]){
          this.drawCell(this.cxTieups, i, j, "tieup");
        }
      }
    }

  }

//callled when frames become visible or drawdown without frame info is loaded
  public recomputeLoom(){

    this.loom.recomputeLoom(this.weave);
  }


  public unsetSelection(){
    this.selection.unsetParameters();
  }

public drawDrawdown(){
   switch(this.render.getCurrentView()){
      case 'pattern':
      this.redrawDraft();
      break;

      case 'yarn':
      this.redrawVisualView();
      break;

      case 'visual':
      this.redrawVisualView();
      break;
    }
}

//takes inputs about what, exactly to redraw
public redraw(flags:any){

    var base_dims = this.render.getCellDims("base");

    if(flags.drawdown !== undefined){
        this.cx.clearRect(0,0, this.canvasEl.width, this.canvasEl.height);   
        this.cx.canvas.width = base_dims.w * (this.weave.pattern[0].length+2);
        this.cx.canvas.height = base_dims.h * (this.render.visibleRows.length+2);
        this.cx.strokeStyle = "#3d3d3d";

        if(this.source == "weaver") this.cx.fillStyle = "#3d3d3d";
        else this.cx.fillStyle = "#ffffff";
        this.cx.fillRect(0,0,this.canvasEl.width,this.canvasEl.height);
        this.cx.strokeRect(base_dims.w,base_dims.h,this.canvasEl.width-base_dims.w*2,this.canvasEl.height-base_dims.h*2);
        this.drawDrawdown();
    }

    if(flags.weft_systems !== undefined && this.source == "weaver"){
      this.drawWeftSystems(this.cxWeftSystems, this.weftSystemsCanvas);
    }

    if(flags.weft_materials !== undefined && this.source == "weaver"){
      this.drawWeftMaterials(this.cxWeftMaterials, this.weftMaterialsCanvas);
    }

    if(flags.warp_systems !== undefined && this.source == "weaver"){
      this.drawWarpSystems(this.cxWarpSystems, this.warpSystemsCanvas);
    }

    if(flags.warp_materials !== undefined && this.source == "weaver"){
      this.drawWarpMaterials(this.cxWarpMaterials, this.warpMaterialsCanvas);
    }

    if(flags.loom !== undefined && this.render.showingFrames()){
       this.redrawLoom();
    }

  }
  

  /**
   * Redraws the entire canvas based on weave pattern.
   * @extends WeaveDirective
   * @returns {void}
   */
  public redrawDraft() {
    
    var base_dims = this.render.getCellDims("base");
    this.cx.fillStyle = "white";
    this.cx.fillRect(base_dims.w,base_dims.h,this.canvasEl.width - base_dims.w*2,this.canvasEl.height-base_dims.h*2);

    var i,j;

    this.drawGrid(this.cx,this.canvasEl);
    

    var color = '#000000';
    this.cx.fillStyle = color;
    for (i = 0; i < this.render.visibleRows.length; i++) {
      this.redrawRow(i * base_dims.h, i, this.cx);
    }


     for (var x = 0; x < this.weave.colShuttleMapping.length; x++) {
     
      var id = this.weave.colShuttleMapping[x];
      var system = this.weave.warp_systems[this.weave.colSystemMapping[x]];
      var shuttle = this.weave.shuttles[id];

        if(!system.visible){
          var c = "#3d3d3d";
          var t = 100;

          var width = base_dims.w;
          var w_margin = base_dims.w;
          this.cx.fillStyle = c;
          this.cx.fillRect(x*base_dims.w+w_margin, 0, width, base_dims.h*this.render.visibleRows.length);

        }
    }   
  }






  public drawWarps(cx){
    //draw all the warps

    var base_dims = this.render.getCellDims("base");
    var schematic = (this.render.getCurrentView() === "yarn");
    for (var x = 0; x < this.weave.colShuttleMapping.length; x++) {
     
      var id = this.weave.colShuttleMapping[x];
      var system = this.weave.warp_systems[this.weave.colSystemMapping[x]];
      var shuttle = this.weave.shuttles[id];

      if(system.visible){
          var c = shuttle.getColor();
          var t = shuttle.getThickness();
          var center = base_dims.w/2;


          cx.lineWidth = t/100 * .9*base_dims.w;
          cx.strokeStyle = (shuttle.type > 0 || !schematic) ? c : c+"10";
          cx.shadowColor = 'white';
          cx.shadowOffsetX = 0.5;
          cx.shadowOffsetY = 0;

          cx.beginPath();
          cx.moveTo((x+1)*base_dims.w + center, 0);
          cx.lineTo((x+1)*base_dims.w + center, base_dims.h*(this.render.visibleRows.length+2));
          cx.stroke();

      }
    }
  }





  /**
   * Simulates the visual look of the weave pattern.
   * @extends WeaveDirective
   * @returns {void}
   */
  public redrawVisualView() {

    this.cx.fillStyle = "#3d3d3d";
    this.cx.fillRect(0,0,this.canvasEl.width,this.canvasEl.height);

    this.drawWarps(this.cx);
    
    this.redrawYarnView();

    if(this.render.getCurrentView() === 'visual'){
      this.drawWarpsOver();
    }

    this.cx.strokeStyle = "#000";
    this.cx.fillStyle = "#000";
  }

  /**
   * Resizes and then redraws the canvas on a change to the wefts or warps. 
   * @extends WeaveDirective
   * @returns {void}
   */
  // public updateSize() {
  //   var base_dims = this.render.getCellDims("base");

  //   // set the updated width and height
  //   this.canvasEl.width = this.weave.warps * base_dims.h;
  //   this.canvasEl.height = this.render.visibleRows.length * base_dims.w;
  // }



  public onUndoRedo() {

  }

  /**
   * Prints the pattern to the console.
   * @extends WeaveDirective
   * @param {Array<Array<boolean>>} pattern - 2D pattern array.
   * @returns {void}
   */
  public printPattern(pattern) {
    for (var i = 0; i < pattern.length; i++) {
      var s = "";
      for (var j = 0; j < pattern[0].length; j++) {
        if (pattern[i][j]) {
          s += 'x';
        } else {
          s += 'o'
        }
      }
      console.log(s);
    }
  }


   /**
   * Saves the draft as a bitmap file
   * @extends WeaveDirective
   * @param {string} fileName - name to save file as
   * @returns {void}
   */
  public getPrintableCanvas(obj) : HTMLCanvasElement {


    let dims = this.render.getCellDims("base");

    let b = obj.bitmap.nativeElement;
    let context = b.getContext('2d');

    b.width = (this.weave.warps + this.loom.num_treadles + 6) * dims.w;
    b.height = (this.weave.wefts + this.loom.num_frames + 6) * dims.h;
    
    context.fillStyle = "white";
    context.fillRect(0,0,b.width,b.height);
    
    //use this to solve 0 width errors on drawIMage
    if(this.render.showingFrames()){

      context.drawImage(this.threadingCanvas, 0, dims.h*3);
      context.drawImage(this.tieupsCanvas, (this.weave.warps +1)* dims.w, 3*dims.h);
      context.drawImage(this.treadlingCanvas, (this.weave.warps +1)* dims.w, (this.loom.num_frames + 4)*dims.h);

    }

    //systems
    context.drawImage(this.warpSystemsCanvas, 0, 0);
    context.drawImage(this.warpMaterialsCanvas, 0, dims.h);

    context.drawImage(this.canvasEl, -dims.w, (this.loom.num_frames+3)*dims.h);
   
    context.drawImage(this.weftMaterialsCanvas,(this.weave.warps+ this.loom.num_treadles +1)* dims.w, (this.loom.num_frames + 4)*dims.h);
    context.drawImage(this.weftSystemsCanvas,(this.weave.warps+ this.loom.num_treadles +2)* dims.w, (this.loom.num_frames + 4)*dims.h);
    return b;
  }

  /**
   * Saves the draft as a bitmap file
   * @extends WeaveDirective
   * @param {string} fileName - name to save file as
   * @returns {void}
   */
  public getBMPCanvas(obj) : HTMLCanvasElement {
    let b = obj.bitmap.nativeElement;
    let context = b.getContext('2d');
    let draft = this.weave.pattern;
    var i,j;

    b.width = this.weave.warps;
    b.height = this.weave.wefts;
    context.fillStyle = "white";
    context.fillRect(0,0,b.width,b.height);

    context.fillStyle = "black";

    for( i = 0; i < b.height; i++) {
      for( j=0; j < b.width; j++) {
        let up = draft[i][j].isUp();
        if(up) {
          context.fillRect(j,i,1,1)
        }
      }
    }
    return b;
  }

   /**
   *
   *
   */
    public onSave(e: any) {

      e.bitmap = this.bitmap;
  
      if (e.type === "bmp"){
        let link = e.downloadLink.nativeElement;
        link.href = this.fs.saver.bmp(this.getBMPCanvas(e));
        link.download = e.name + ".jpg"; //Canvas2Bitmap  seems to be broken now
      } 
      else if (e.type === "ada"){
        let link = e.downloadLink.nativeElement;
        link.href = this.fs.saver.ada('draft', [this.weave], [this.loom], [], this.weave.notes, false);
        link.download = e.name + ".ada";
      } 
      else if (e.type === "wif"){
        let link = e.downloadLink.nativeElement;
        link.href= this.fs.saver.wif(this.weave, this.loom);
        link.download = e.filename +".wif";
  
      } 
      else if (e.type === "jpg"){
        let link = e.downloadLink.nativeElement;
        link.href = this.fs.saver.jpg(this.getPrintableCanvas(e));
        link.download = e.name + ".jpg";
      } 
      
    }

    /**
   * inserts an empty row just below the clicked row
   * @param si the screen index of the row we'll insert
   * @param i the absolute (not screen) index of the row we'll insert
   */
  public insertRow(si:number, i:number) {

    const shuttle: number = this.weave.rowToShuttle(this.render.visibleRows, si);
    const system: number = this.weave.rowToSystem(this.render.visibleRows, si);

    this.weave.insertRow(i, shuttle, system);
    this.loom.insertRow(i);
    this.render.updateVisible(this.weave);
    this.redraw({drawdown: true, loom:true, weft_systems: true, weft_materials:true});
    this.timeline.addHistoryState(this.weave);

  }
    /**
   * clones the selected row and pastes into next visible row
   * @param si the screen index of the row we'll insert
   * @param i the absolute (not screen) index of the row we'll insert
   */
  public cloneRow(si: number, i:number) {

    const shuttle: number = this.weave.rowToShuttle(this.render.visibleRows, si);
    const system: number = this.weave.rowToSystem(this.render.visibleRows, si);
    this.weave.cloneRow(i, shuttle, system);
    this.loom.cloneRow(i);
  

    this.render.updateVisible(this.weave);
    this.redraw({drawdown: true, loom:true, weft_systems: true, weft_materials:true});
    this.timeline.addHistoryState(this.weave);

  }

  public deleteRow(i) {
    this.weave.deleteRow(i);
    this.loom.deleteRow(i);
    this.render.updateVisible(this.weave);
    this.redraw({drawdown: true, loom:true, weft_systems: true, weft_materials:true});
    this.timeline.addHistoryState(this.weave);
  }

    /**
   * In
   * @extends WeaveComponent
   * @returns {void}
   */
  public insertCol(i, shuttle,system) {
    console.log(i, shuttle, system);
    this.weave.insertCol(i, shuttle,system);
    this.loom.insertCol(i);
    this.redraw({drawdown: true, loom:true, warp_systems: true, warp_materials:true});
    this.weave.computeYarnPaths();
    this.timeline.addHistoryState(this.weave);

  }

  public cloneCol(i, shuttle,system) {
    this.weave.cloneCol(i, shuttle,system);
    this.loom.cloneCol(i);
    this.redraw({drawdown: true, loom:true, warp_systems: true, warp_materials:true});
    this.weave.computeYarnPaths();
    this.timeline.addHistoryState(this.weave);

  }


  public deleteCol(i) {
    this.weave.deleteCol(i);
    this.loom.deleteCol(i);
    this.redraw({drawdown: true, loom:true, warp_systems: true, warp_materials:true});
    this.weave.computeYarnPaths();
    this.timeline.addHistoryState(this.weave);
  }

  public toggleViewFrames(){

    this.render.toggleViewFrames();

    if(this.render.view_frames && this.loom.type == "frame"){
      this.recomputeLoom();
    }

    this.redraw({loom:true});
   
  }



}
