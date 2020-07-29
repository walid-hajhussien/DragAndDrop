namespace App {
  // note : type ValidatorInfo = { isValid: boolean, inValid: { propertyName: string, error: string } }
  export class ValidatorInfoModel {
    constructor(public isValid: boolean, public inValidProperty: InValid[]) {}
  }
}
