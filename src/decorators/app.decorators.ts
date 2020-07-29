namespace App {
  // section : Decorator

  /*
   * note: (_)  means I will not use but don't complain
   *  target : class , name : method name , descriptor : PropertyDescriptor
   *
   * */
  export function AutoBindingDecorator(
    _target: any,
    _name: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const newDescriptor: PropertyDescriptor = {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      get() {
        const newValue = descriptor.value.bind(this);
        return newValue;
      },
    };
    return newDescriptor;
  }

  /*
   * note : required decorator
   *  target : class , name: property name
   * */
  export function RequiredDecorator(): PropertyDecoratorType {
    return function (target: any, name: string): void {
      const className = target.constructor.name;
      if (registerValidator.hasOwnProperty(className)) {
        // note : check if the property name validator register
        if (registerValidator[className].hasOwnProperty(name)) {
          registerValidator[className][name].push(
            new ValidatorModel("required", 0)
          );
        } else {
          registerValidator[className][name] = [
            new ValidatorModel("required", 0),
          ];
        }
      } else {
        // note : class validation not register
        registerValidator[className] = {
          [name]: [new ValidatorModel("required", 0)],
        };
      }
    };
  }

  /*
   * note : minLength decorator
   *  target : class , name: property name
   * */
  export function MinLengthDecorator(minLength: number): PropertyDecoratorType {
    return function (target: any, name: string): void {
      const className = target.constructor.name;
      if (registerValidator.hasOwnProperty(className)) {
        // note : check if the property name validator register
        if (registerValidator[className].hasOwnProperty(name)) {
          registerValidator[className][name].push(
            new ValidatorModel("minLength", minLength)
          );
        } else {
          registerValidator[className][name] = [
            new ValidatorModel("minLength", minLength),
          ];
        }
      } else {
        // note : class validation not register
        registerValidator[className] = {
          [name]: [new ValidatorModel("minLength", minLength)],
        };
      }
    };
  }

  /*
   * note : PositiveValue decorator to validate positive number
   *  target : class , name: property name
   * */
  export function PositiveValueDecorator(): PropertyDecoratorType {
    return function (target: any, name: string): void {
      const className = target.constructor.name;
      if (registerValidator.hasOwnProperty(className)) {
        // note : check if the property name validator register
        if (registerValidator[className].hasOwnProperty(name)) {
          registerValidator[className][name].push(
            new ValidatorModel("positive", 0)
          );
        } else {
          registerValidator[className][name] = [
            new ValidatorModel("positive", 0),
          ];
        }
      } else {
        // note : class validation not register
        registerValidator[className] = {
          [name]: [new ValidatorModel("minLength", 0)],
        };
      }
    };
  }
}
