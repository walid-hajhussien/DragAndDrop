namespace App {
  // section : utility
  export function validator(obj: any): ValidatorInfoModel {
    const className = obj.constructor.name;
    const classValidator = registerValidator[className];
    // note : no validator
    if (!classValidator) {
      return new ValidatorInfoModel(true, []);
    }

    let isValid = true;
    let inValidProperty: InValid[] = [];

    for (let propertyName in classValidator) {
      classValidator[propertyName].map((validatorObj, _index) => {
        switch (validatorObj.type) {
          case "required": {
            const isValidProperty = obj[propertyName].length > 0;
            if (!isValidProperty) {
              isValid = false;
              inValidProperty.push({
                propertyName: propertyName,
                error: `The ${propertyName.toLocaleUpperCase()} is required!`,
              });
            }
            break;
          }
          case "minLength": {
            const isValidProperty =
              obj[propertyName].length > validatorObj.value;
            if (!isValidProperty) {
              isValid = false;
              inValidProperty.push({
                propertyName: propertyName,
                error: `The Minimum Length For ${propertyName} is ${validatorObj.value}`,
              });
            }
            break;
          }
          case "positive": {
            const isValidProperty = obj[propertyName] > 0;
            if (!isValidProperty) {
              isValid = false;
              inValidProperty.push({
                propertyName: propertyName,
                error: `The Value For ${propertyName} Is Not Valid : ${validatorObj.value}`,
              });
            }
            break;
          }
        }
      });
    }

    return new ValidatorInfoModel(isValid, inValidProperty);
  }
}
