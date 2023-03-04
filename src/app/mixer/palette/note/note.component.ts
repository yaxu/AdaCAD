import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Bounds, Point } from '../../../core/model/datatypes';
import utilInstance from '../../../core/model/util';
import { Note, NotesService } from '../../../core/provider/notes.service';
import { ViewportService } from '../../provider/viewport.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

  //generated by the note service
  @Input()  id: number;
  @Input()  default_cell: number;

  @Input()
  get scale(): number { return this._scale; }
  set scale(value: number) {
    this._scale = value;
    this.rescale();
  }
  private _scale:number = 5;

  @Output() deleteNote: any = new EventEmitter();  
  @Output() saveNoteText: any = new EventEmitter();  

  note: Note;
  bounds: Bounds = {
    topleft: {x:0, y:0},
    width: 200, 
    height: 200
  };


  canvas: HTMLCanvasElement;
  cx: any;
  disable_drag: boolean = false;

  constructor(private notes: NotesService,private viewport:ViewportService) { 

  }

  ngOnInit() {
    this.note = this.notes.get(this.id);
    if(this.note == undefined){
      this.bounds.topleft = {x: 0, y: 0};
      console.error("cound not find note on init ", this.id, this.notes.notes);
    }else{
      this.bounds.topleft = {
        x: this.note.interlacement.j * this.scale,
        y: this.note.interlacement.i * this.scale
      }
    }

   
  }

  ngAfterViewInit(){
    this.canvas = <HTMLCanvasElement> document.getElementById("notecanvas-"+this.note.id.toString());
    this.cx = this.canvas.getContext("2d");
    this.rescale();
    
  }

  delete(){
    console.log("DELETE NOTE EMITTED!")
    this.deleteNote.emit(this.note.id);
  }
    

  dragMove($event: any) {
    const pointer:Point = $event.pointerPosition;
    const relative:Point = utilInstance.getAdjustedPointerPosition(pointer, this.viewport.getBounds());
    const adj:Point = utilInstance.snapToGrid(relative, this.scale);
    this.bounds.topleft = adj;
    this.note.interlacement = utilInstance.resolvePointToAbsoluteNdx(adj, this.scale);
  }


  /**
   * Called when main palette is rescaled and triggers call to rescale this element, and update its position 
   * so it remains at the same coords. 
   * @param scale - the zoom scale of the iterface (e.g. the number of pixels to render each cell)
   */
   rescale(){

    if(this.note === undefined){
      // console.error("note is undefined on rescale");
       return;
    }

    const zoom_factor:number = this.scale/this.default_cell;

    //redraw at scale
    const container: HTMLElement = document.getElementById('scalenote-'+this.note.id);
    container.style.transformOrigin = 'top left';
    container.style.transform = 'scale(' + zoom_factor + ')';
   

    this.bounds.topleft = {
      x: this.note.interlacement.j * this.scale,
      y: this.note.interlacement.i * this.scale
    };

  
  }

  save(){
    this.saveNoteText.emit();
  }


  /**
   * draw onto the supplied canvas, to be used when printing
   * @returns 
   */
   drawForPrint(canvas, cx, scale: number) {

    if(canvas === undefined) return;
   
   

    //draw the supplemental info like size
    cx.fillStyle = "#666666";
    cx.font = scale*2+"px Verdana";
    cx.fillText(this.note.text,this.bounds.topleft.x, this.bounds.topleft.y+this.bounds.height + 20 );

  }

  disableDrag(){
    this.disable_drag = true;
  }

  enableDrag(){
    this.disable_drag = false;
  }



}
