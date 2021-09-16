import { Injectable } from '@angular/core';
import { ShuttlesModal } from '../modal/shuttles/shuttles.modal';
import { Shuttle } from '../model/shuttle';


export interface MaterialMap{
  old_id: number,
  new_id: number
 }


@Injectable({
  providedIn: 'root'
})
export class MaterialsService {



  /** array ndx should be the same as shuttle id */
  materials: Array<Shuttle> = [];



  constructor() { 

    this.materials = [
      new Shuttle({id: 0, name: 'shuttle 0', insert: true, visible: true, color: "#333333", thickness: 100, type: 0, notes: ""}), 
      new Shuttle({id: 1, name: 'shuttle 1', insert: true, visible: true, color: "#ffffff", thickness: 100, type: 0, notes: ""}), 
      new Shuttle({id: 2, name: 'conductive', insert: true, visible: true, color: "#ff4081", thickness: 100, type: 1, notes: ""})];
  }



  /**
   * overload shuttles with uploaded data. 
   * check to ensure that ids match array index and return a draft mapping
   * @param shuttles 
   */
  overloadShuttles(shuttles: Array<Shuttle>): Array<MaterialMap>{
    const map: Array<MaterialMap> = [];

    this.materials = [];
    return this.addShuttles(shuttles);
  }

  /**
   * adds a set of shuttles from a file import
   * @param shuttles 
   * @returns the offset of the new ids to the old ones
   */
  addShuttles(shuttles: Array<Shuttle>) : Array<MaterialMap>{
    const map: Array<MaterialMap> = [];

    const offset: number = this.materials.length;

    shuttles.forEach(shuttle => {
      map.push({old_id: shuttle.getId(), new_id: this.materials.length});
      shuttle.setID(this.materials.length);
      this.materials.push(new Shuttle(shuttle))
    });

    return map;
  }

  getColor(index: number,) {

    const s: Shuttle = this.getShuttle(index);
    return s.color;
  }


/**
 * adds a new material to the end of the list and updates the id.
 * @param s 
 */
  addShuttle(s: Shuttle){
    s.setID(this.materials.length);
    this.materials.push(s);
  }


  /**
   * deletes a shuttle and readjustes the id
   * @param id 
   */
  deleteShuttle(id: number) : Array<MaterialMap>{

    const new_list: Array<Shuttle> = this.materials.filter(el => el.id != id);
    return this.overloadShuttles(new_list);

  }

  getShuttle(id: number) : Shuttle{
    const ndx: number = this.materials.findIndex(el => el.id === id);
    if(ndx != -1) return this.materials[ndx];
    return null;
  }

  getShuttles() : Array<Shuttle>{
    return this.materials;
  }

}