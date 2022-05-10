import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { OpNode, TreeService } from '../../../provider/tree.service';
import { BoolParam, FileParam, NumParam, OperationParam, SelectParam, StringParam } from '../../../provider/operation.service';


export function regexValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid =  nameRe.test(control.value);
    console.log("testing", control.value, valid, nameRe);
    return !valid ? {forbiddenInput: {value: control.value}} : null;
  };
}



@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.scss']
})
export class ParameterComponent implements OnInit {
  
  fc: FormControl;
  opnode: OpNode;
  name: any;

  @Input() param:  NumParam | StringParam | SelectParam | BoolParam | FileParam;
  @Input() opid:  number;
  @Input() paramid:  number;
  @Output() onOperationParamChange = new EventEmitter <any>(); 
  @Output() onFileUpload = new EventEmitter <any>(); 

  //you need these to access values unique to each type.
  numparam: NumParam;
  boolparam: BoolParam;
  stringparam: StringParam;
  selectparam: SelectParam;
  fileparam: FileParam;


  constructor(public tree: TreeService) { 
  }

  ngOnInit(): void {

    this.opnode = this.tree.getOpNode(this.opid);

     //initalize the form controls for the parameters: 

      switch(this.param.type){
        case 'number':
          this.numparam = <NumParam> this.param;
          this.fc = new FormControl(this.param.value);
          break;

        case 'boolean':
          this.boolparam = <BoolParam> this.param;
          this.fc = new FormControl(this.param.value);
          break;

        case 'select':
          
          this.selectparam = <SelectParam> this.param;
          this.fc = new FormControl(this.param.value);
          break;

        case 'file':
          this.fileparam = <FileParam> this.param;
          this.fc = new FormControl(this.param.value);
          break;

        case 'string':
          console.log("regex", (<StringParam>this.param).regex);
          this.stringparam = <StringParam> this.param;
          this.fc = new FormControl(this.stringparam.value, [Validators.required, regexValidator((<StringParam>this.param).regex)]);
          break;
       
      }
  

  }



  /**
   * changes the view and updates the tree with the new value
   * @param value 
   */
  onParamChange(value: number){

    console.log("fc", this.fc)

    const opnode: OpNode = <OpNode> this.tree.getNode(this.opid);

    switch(this.param.type){
      case 'number': 
        opnode.params[this.paramid] = value;
        this.fc.setValue(value);
        break;

      case 'boolean':
        opnode.params[this.paramid] = (value) ? 1 : 0;
        this.fc.setValue(value);
        break;

      case 'string':
        opnode.params[this.paramid] = value;
        this.fc.setValue(value);
        break;

      case 'select':
        opnode.params[this.paramid] = value;
        this.fc.setValue(value);
        break;
    }

    this.onOperationParamChange.emit({id: this.paramid});
   
  }

  handleFile(obj: any){
    this.fc.setValue(obj.data.name);
    this.opnode.params[this.paramid] = obj.id;
    this.onFileUpload.emit({id: obj.id, data: obj.data});
  }


}
