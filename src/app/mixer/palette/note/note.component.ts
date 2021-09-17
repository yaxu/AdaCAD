import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import utilInstance from '../../../core/model/util';
import { Bounds, Interlacement, Point } from '../../../core/model/datatypes';
import { Note, NotesService } from '../../../core/provider/notes.service';
import { ViewportService } from '../../provider/viewport.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

  @ViewChild('comment', {static: false}) comment: any;

  //generated by the note service
  @Input()  id: number;
  @Input()  scale:number;
  @Output() deleteNote: any = new EventEmitter();  

  interlacement: Interlacement;
  note: Note;
  bounds: Bounds = {
    topleft: {x:0, y:0},
    width: 200, 
    height: 200
  };

  constructor(private notes: NotesService,private viewport:ViewportService) { 

  }

  ngOnInit() {
    this.note = this.notes.get(this.id);
    this.interlacement = this.note.interlacement;
    this.bounds.topleft = {
      x: this.interlacement.j * this.scale,
      y: this.interlacement.i * this.scale
    }
  }

  delete(id: number){
    this.notes.delete(id);
    this.deleteNote.emit(id);

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
   rescale(scale:number, default_cell: number){

    this.scale = scale;
    const zoom_factor:number = scale/default_cell;


    //redraw at scale
    const container: HTMLElement = document.getElementById('scalenote-'+this.note.id);
    container.style.transformOrigin = 'top left';
    container.style.transform = 'scale(' + zoom_factor + ')';

   
    this.bounds.topleft = {
      x: this.interlacement.j * this.scale,
      y: this.interlacement.i * this.scale
    };

  }



}
