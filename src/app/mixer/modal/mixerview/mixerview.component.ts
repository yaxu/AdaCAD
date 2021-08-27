import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, Inject } from '@angular/core';
import { Bounds, Point } from '../../../core/model/datatypes';
import { ViewportService } from '../../provider/viewport.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-mixerview',
  templateUrl: './mixerview.component.html',
  styleUrls: ['./mixerview.component.scss']
})
export class MixerViewComponent implements OnInit {
  
  @Output() onZoomChange: any = new EventEmitter();
  @Output() onViewPortMove: any = new EventEmitter();

  //the bounds of the modal window
  bounds: Bounds;

  //the bounds of the draggable "local" view
  local_view:Bounds;

  //the ratio of the local view to the absolute view space
  factor:number;


  //the width and height of the global view
  width: number;
  height: number;

  //current zoom scale
  zoom: number;

  canvas: HTMLCanvasElement;
  div: Element;

 constructor(private viewport: ViewportService,
  private dialog: MatDialog,
    private dialogRef: MatDialogRef<MixerViewComponent>,
             @Inject(MAT_DIALOG_DATA) public data: any) { 
 
  this.local_view = {
    topleft: {x:0, y:0}, 
    width: 100, 
    height:100
  };

  this.zoom = data.zoom;

  this.bounds = {
    topleft:{x: 0, y:0},
    width: 350,
    height: 100
  }

  this.width = 250;
  this.height = 250;

  //ratio of the widow width to the actual width
  this.factor = this.width / viewport.getAbsoluteWidth();

 
}
 
  ngOnInit() {
   // console.log('viewport', this.local_view);

  }



  ngAfterViewInit() {

    this.canvas = <HTMLCanvasElement> document.getElementById("global_canvas");
    this.div = document.getElementById('scrollable-container').offsetParent;

    this.updateLocalDims();
  }


  updateLocalDims(){

    this.local_view.topleft = {
      x: this.div.scrollLeft * this.factor, 
      y: this.div.scrollTop  * this.factor};
   //this.local_view.width = this.div.clientWidth *  this.factor;
   // this.local_view.height = this.div.clientHeight *  this.factor;
    
    // this.local_view.topleft = {
    //   x: this.viewport.getTopLeft().x  * this.factor, 
    //   y: this.viewport.getTopLeft().y * this.factor};
    // this.local_view.width = this.viewport.getWidth() *  this.factor;
    // this.local_view.height = this.viewport.getHeight() * this.factor;

  }


  updateViewPort(data: any){
    this.updateLocalDims();
    // const div:HTMLElement = data.elementRef.nativeElement;
    // this.local_view.topleft = {
    //   x: div.scrollLeft  * this.factor, 
    //   y: div.scrollTop  * this.factor};
    // this.local_view.width = div.clientWidth  * this.factor;
    // this.local_view.height = div.clientHeight  * this.factor;
   // console.log(data, this.local_view);

  }

  updateViewPortFromZoom(){
    const div:Element = document.getElementById('scrollable-container').offsetParent;
    this.local_view.topleft = {
      x: div.scrollLeft * this.factor, 
      y: div.scrollTop  * this.factor};
    this.local_view.width = div.clientWidth /  this.factor;
    this.local_view.height = div.clientHeight /  this.factor;
   // console.log("update from zoom", this.zoom,  this.local_view)

  }


  // viewChange(e:any){
  //   this.onViewChange.emit(e.value);
  // }

  zoomChange(e:any, source: string){
    e.source = source;
    this.zoom = e.value;
    // this.updateViewPortFromZoom();
    this.onZoomChange.emit(e);
  }

  // viewFront(e:any, value:any, source: string){
  //   console.log("value", value, "source", source);
  //   e.source = source;
  //   e.value = value;
  //   this.onViewFront.emit(e);
  // }
  
//  visibleButton(id, visible, type) {
//     console.log("called", id, visible, type);
//     if(type == "weft"){
//       if (visible) {
//         this.onShowWeftSystem.emit({systemId: id});
//       } else {
//         this.onHideWeftSystem.emit({systemId: id});
//       }
//     }else{
//       if (visible) {
//         this.onShowWarpSystem.emit({systemId: id});
//       } else {
//         this.onHideWarpSystem.emit({systemId: id});
//       }
//     }

//   }

dragEnd($event: any) {
  
}

dragStart($event: any) {

}

dragMove($event: any) {

  const delta:Point = $event.delta;
  const adjusted: Point = {x: delta.x / this.factor,y:delta.y / this.factor };
  this.onViewPortMove.emit(adjusted);


}

close() {
  this.dialogRef.close(null);
}


}