import { Shuttle } from './shuttle';
import { Threading } from './threading';
import { Treadling } from './treadling';
import { TieUps }  from "./tieups";
import { Pattern } from './pattern';

import * as _ from 'lodash';
import { active } from 'd3';

/**
 * Definition of draft interface.
 * @interface
 */
export interface DraftInterface {
  pattern: Array<Array<boolean>>; // the single design pattern
  patterns: Array<Pattern>; //the collection of smaller subpatterns from the pattern bar
  shuttles: Array<Shuttle>;
  warp_systems: Array<Shuttle>;
  rowShuttleMapping: Array<number>;
  colShuttleMapping: Array<number>;
  visibleRows: Array<number>;
  connections: Array<any>;
  labels: Array<any>;
  wefts: number;
  warps: number;
  epi: number;
  threading: Threading;
  treadling: Treadling;
  tieups: TieUps;
}

/**
 * Definition and implementation of draft object.
 * @class
 */
export class Draft implements DraftInterface {
  pattern: Array<Array<boolean>>;
  patterns: Array<Pattern>;
  shuttles: Array<Shuttle>;
  warp_systems: Array<Shuttle>;
  rowShuttleMapping: Array<number>;
  colShuttleMapping: Array<number>;
  visibleRows: Array<number>;
  connections: Array<any>;
  labels: Array<any>;
  wefts: number;
  warps: number;
  epi: number;
  threading: Threading;
  treadling: Treadling;
  tieups: TieUps;

  constructor({...params}) {
    console.log("Draft Constructor", params);

    this.wefts = (params.wefts === undefined) ?  30 : params.wefts;
    this.warps = (params.warps === undefined) ? 20 : params.warps;
    this.epi = (params.warps === undefined) ? 10 : params.epi;
    this.visibleRows = (params.visibleRows === undefined) ? [] : params.visibleRows;
    this.pattern = (params.pattern === undefined) ? [] : params.pattern;
    this.connections = (params.connections === undefined)? [] : params.connections;
    this.labels = (params.labels === undefined)? [] : params.labels;

    if(params.shuttles === undefined){
      let s = new Shuttle({id: 0, name: 'Weft System 1', visible: true, color: '#3d3d3d'});
      this.shuttles = [s];
    }else{
      var shuttles = params.shuttles
          var sd = [];
          for (var i in shuttles) {
            var s = new Shuttle(shuttles[i]);
            sd.push(s);
          }

        this.shuttles = sd;
    }


    if(params.warp_systems === undefined){
      let s = new Shuttle({id: 0, name: 'Warp System 1', visible: true, color: '#3d3d3d'});
      this.warp_systems = [s];
    }else{
      var systems = params.warp_systems
          var sd = [];
          for (var i in systems) {
            var s = new Shuttle(systems[i]);
            sd.push(s);
          }

        this.warp_systems = sd;
    }


    if(params.rowShuttleMapping === undefined){
      this.rowShuttleMapping = [];
    for(var ii = 0; ii < this.wefts; ii++) {
          this.rowShuttleMapping.push(0);
          this.visibleRows.push(ii);
        }
      }else{
        this.rowShuttleMapping = params.rowShuttleMapping;
      }

    if(params.colShuttleMapping === undefined){
      this. colShuttleMapping = [];
    for(var ii = 0; ii < this.warps; ii++) {
          this.colShuttleMapping.push(0);
        }
      }else{
        this.colShuttleMapping = params.colShuttleMapping;
      }


    if(params.patterns !== undefined){
          var patterns = params.patterns
          var pts = [];
          for (i in patterns) {
            pts.push(patterns[i]);
          }
        this.patterns = pts;
    }


    if (params.pattern === undefined) {
      this.pattern = [];
      for(var ii = 0; ii < this.wefts; ii++) {
        this.pattern.push([]);
        for (var j = 0; j < this.warps; j++)
          this.pattern[ii].push(false);
      }
    }
    else{
      this.pattern = params.pattern;
    } 

    //Creating the Threading, Treadling, and TieUps objects
    this.threading = new Threading(this.wefts, this.warps);
    this.treadling = new Treadling(this.wefts, this.pattern);
    this.tieups = new TieUps(this.threading.threading, this.threading.usedFrames.length, this.treadling.treadling, this.pattern, this.treadling.treadle_count);

    console.log(this);

  }

  // loadAdaFile(draft) {
  //   this.shuttles = draft.shuttles;
  //   this.rowShuttleMapping = draft.rowShuttleMapping;
  //   this.wefts = draft.wefts;
  //   this.warps = draft.warps;
  //   this.visibleRows = draft.visibleRows;
  //   this.epi = draft.epi;
  //   this.pattern = draft.pattern;
  //   this.patterns = draft.patterns;
  //   this.connections = draft.connections;
  //   this.labels = draft.labels;
  //   return this.pattern;
  // }

  isUp(i:number, j:number) : boolean{
    var row = this.visibleRows[i];
    if ( row > -1 && row < this.pattern.length && j > -1 && j < this.pattern[0].length) {
      return this.pattern[row][j];
    } else {
      return false;
    }
  }
  
  setHeddle(i:number, j:number, bool:boolean) {
    var row = this.visibleRows[i];
    this.pattern[row][j] = bool;
    this.threading.updateFlippedPattern(row, j, bool);
    this.threading.updateThreading();
    this.treadling.updatePattern(this.pattern);
    this.treadling.updateTreadling();
    this.tieups.updatePattern(this.pattern);
    this.tieups.updateThreading(this.threading.threading);
    this.tieups.updateTreadling(this.treadling.treadling);
    this.tieups.updateTreadleCount(this.treadling.treadle_count);
    //assuming frames will be used without gaps of unused frames (i.e. all unused_frames would be later frames)
    this.tieups.updateUsedFrames(this.threading.usedFrames.length);
    this.tieups.updateTieUps();
  }

  updateDrawDown() {
    var updates =[]
    for (var i =0; i < this.treadling.treadling.length;i++) {
      var active_treadle =-1;
      for (var j =0; j <this.treadling.treadling[i].length; j++) {
        if (this.treadling.treadling[i][j]) {
          active_treadle= j;
          break;
        }
      }
      if (active_treadle != -1) {
        for (var j = 0; j < this.tieups.tieups[active_treadle].length; j++) {
          if (this.tieups.tieups[active_treadle][j]) {
            for (var k = 0; k < this.threading.threading[j].length;k++) {
              if (this.threading.threading[j][k]) {
                this.pattern[i][k] =true;
                var coordinatesArr = [i,k]; 
                updates.push(coordinatesArr);
              }
            }
          }
        }
      }
    }
    return updates;
  }

  rowToShuttle(row: number) {
    return this.rowShuttleMapping[row];
  }


  colToShuttle(col: number) {
    return this.colShuttleMapping[col];
  }

  updateVisible() {
    var i = 0;
    var shuttles = [];
    var visible = [];
    for (i = 0; i < this.shuttles.length; i++) {
      shuttles.push(this.shuttles[i].visible);
    }

    for (i = 0; i< this.rowShuttleMapping.length; i++) {
      var show = shuttles[this.rowShuttleMapping[i]];

      if (show) {
        visible.push(i);
      }
    }

    this.visibleRows = visible;
  }

  addLabel(row: number, label: any) {

  }

  createConnection(shuttle: Shuttle, line: any) {

  }

  deleteConnection(lineId: number) {

  }

  updateSelection(selection: any, pattern: any, type: string) {
    console.log("update selection", selection, pattern, type);
    const sj = Math.min(selection.start.j, selection.end.j);
    const si = Math.min(selection.start.i, selection.end.i);

    const rows = pattern.length;
    const cols = pattern[0].length;

    var w,h;

    w = selection.width / 20;
    h = selection.height / 20;

    for (var i = 0; i < h; i++ ) {
      for (var j = 0; j < w; j++ ) {
        var row = this.visibleRows[i + si];
        var temp = pattern[i % rows][j % cols];
        var prev = this.pattern[row][j + sj];

        switch (type) {
          case 'invert':
            this.pattern[row][j + sj] = !temp;
            break;
          case 'mask':
            this.pattern[row][j + sj] = temp && prev;
            break;
          case 'mirrorX':
            temp = pattern[(h - i - 1) % rows][j % cols];
            this.pattern[row][j + sj] = temp;
            break;
          case 'mirrorY':
            temp = pattern[i % rows][(w - j - 1) % cols];
            this.pattern[row][j + sj] = temp;
            break;
          default:
            this.pattern[row][j + sj] = temp;
            break;
        }
      }
    }
  }

  insertRow(i: number, shuttleId: number) {
    var col = [];

    for (var j = 0; j < this.warps; j++) {
      col.push(false);
    }

    this.wefts += 1;

    this.rowShuttleMapping.splice(i,0,shuttleId);
    this.pattern.splice(i,0,col);
    this.updateVisible();

  }

  cloneRow(i: number, c: number, shuttleId: number) {
    var row = this.visibleRows[c];
    const col = _.clone(this.pattern[c]);

    console.log(i, c, shuttleId);

    this.wefts += 1;

    this.rowShuttleMapping.splice(i, 0, shuttleId);
    this.pattern.splice(i, 0, col);

    this.updateVisible();
  }

  deleteRow(i: number) {
    var row = this.visibleRows[i];
    this.wefts -= 1;
    this.rowShuttleMapping.splice(i, 1);
    this.pattern.splice(i, 1);

    this.updateVisible();
  }

  updateConnections(index: number, offset: number) {
    var i = 0;

    for (i = 0; i < this.connections.length; i++) {
      var c = this.connections[i];
      if (c.start.y > index) {
        c.start.y += offset;
      }
      if (c.end.y > index) {
        c.end.y += offset;
      }
    }
  }


//alwasy adds to end
  insertCol() {
    var row = [];

    //push one false to the end of each row
    for (var j = 0; j < this.wefts; j++) {
      this.pattern[j].push(false);
    }

    this.warps += 1;
    this.updateVisible();

  }


//always deletes from end
  deleteCol(i: number) {

    this.warps -= 1;

    //push one false to the end of each row
    for (var j = 0; j < this.wefts; j++) {
      this.pattern[j].splice(i, 1);
    }

    this.updateVisible();
  }

  addShuttle(shuttle) {
    shuttle.setID(this.shuttles.length);
    shuttle.setVisible(true);
    if (!shuttle.thickness) {
      shuttle.setThickness(this.epi);
    }
    this.shuttles.push(shuttle);

    if (shuttle.image) {
      this.insertImage(shuttle);
    }

  }

  addWarpSystem(shuttle) {
    shuttle.setID(this.shuttles.length);
    shuttle.setVisible(true);
    if (!shuttle.thickness) {
      shuttle.setThickness(this.epi);
    }
    this.warp_systems.push(shuttle);

  }

  insertImage(shuttle) {
    var max = this.rowShuttleMapping.length;
    var data = shuttle.image;
    for (var i=data.length; i > 0; i--) {
      var idx = Math.min(max, i);
      this.rowShuttleMapping.splice(idx,0,shuttle.id);
      this.pattern.splice(idx,0,data[i - 1]);
    }
  }

  getColor(index) {
    var row = this.visibleRows[index];
    var id = this.rowShuttleMapping[row];
    var shuttle = this.shuttles[id];

    return shuttle.color;
  }

  getColorCol(index) {
    var row = this.colShuttleMapping[index];
    var shuttle = this.warp_systems[row];

    return shuttle.color;
  }

}
