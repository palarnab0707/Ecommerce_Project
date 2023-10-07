import { FormControl, ValidationErrors } from "@angular/forms";

export class MyValidators {
    static Whitespace(control: FormControl):ValidationErrors{
        //check if strin only contain white space
        if(control.value !=null && (control.value.trim().length === 0)){
            //invalid return error object
            return {'Whitespace' : true};
        }
        else{
            //valid return null
            return null;
        }
    }
}


