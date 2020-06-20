// section: storage
const registerValidator: ValidatorStorage = {};


// section: models

// note : ValidatorModel to create validator object
class ValidatorModel {
    constructor(public type: string, public value: number) {
    }
}

// note : ProjectModel to create project
class ProjectModel {
    @RequiredDecorator()
    public title: string;
    @MinLengthDecorator(6)
    public description: string;
    @PositiveValueDecorator()
    public people: number;

    constructor(title: string, description: string, people: number) {
        this.description = description;
        this.title = title;
        this.people = people;
    }
}

// note : type ValidatorInfo = { isValid: boolean, inValid: { propertyName: string, error: string } }
class ValidatorInfoModel {
    constructor(public isValid: boolean, public inValidProperty: InValid[]) {
    }
}

// Section : Classes
/*
* note 1 : you need to inform ts what is you going to select (document.getElementById) & not null
* */
class ProjectInput {
    private template: HTMLTemplateElement;
    private hostingEl: HTMLDivElement;
    private templateContent: HTMLFormElement;
    private titleInput: HTMLInputElement;
    private descriptionInput: HTMLInputElement;
    private peopleInput: HTMLInputElement;


    constructor(templateId: string, hostingId: string) {

        this.template = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostingEl = document.getElementById(hostingId)! as HTMLDivElement;
        // note : get the Fragment of the template
        // note : true mean get all the element
        const importedNode: DocumentFragment = document.importNode(this.template.content, true);
        // note:get the elements from the node
        this.templateContent = importedNode.firstElementChild as HTMLFormElement;
        // note: interact with the element & the parent which is form
        this.templateContent.id = 'user-input';
        this.titleInput = this.templateContent.querySelector('#title')! as HTMLInputElement;
        this.descriptionInput = this.templateContent.querySelector('#description')! as HTMLInputElement;
        this.peopleInput = this.templateContent.querySelector('#people')! as HTMLInputElement;
        // note : render the content
        this.attach();
        // note : add the event
        this.configForm()
    }

    private attach(): void {
        this.hostingEl.insertAdjacentElement('afterbegin', this.templateContent);
    }


    private configForm() {
        // note : addEventListener will missing the context , we can fix by using bind or decorator
        this.templateContent.addEventListener('submit', this.submitForm);
    }

    @AutoBindingDecorator
    private submitForm(event: Event) {
        event.preventDefault();
        const input: UserInputType = this.getUserInput();
        const [title, desc, people] = input;
        const project: ProjectModel = new ProjectModel(title, desc, people);
        console.log(registerValidator);
        console.log("validator", validator(project));
        this.clearInput();

    }

    // note : return tuple
    getUserInput(): UserInputType {
        const title: string = this.titleInput.value;
        const description: string = this.descriptionInput.value;
        const pepole: number = +this.peopleInput.value;
        return [title, description, pepole]
    }

    //note : clear all the input
    private clearInput(): void {
        this.titleInput.value = '';
        this.descriptionInput.value = '';
        this.peopleInput.value = '';
    }

}

// section : Decorator

/*
* note: (_)  means I will not use but don't complain
*  target : class , name : method name , descriptor : PropertyDescriptor
*
* */
function AutoBindingDecorator(_target: any, _name: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const newDescriptor: PropertyDescriptor = {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        get() {
            const newValue = descriptor.value.bind(this);
            return newValue
        }
    }
    return (newDescriptor)
}

/*
* note : required decorator
*  target : class , name: property name
* */
function RequiredDecorator(): PropertyDecoratorType {
    return function (target: any, name: string): void {
        const className = target.constructor.name;
        if (registerValidator.hasOwnProperty(className)) {
            // note : check if the property name validator register
            if (registerValidator[className].hasOwnProperty(name)) {
                registerValidator[className][name].push(new ValidatorModel('required', 0));
            } else {
                registerValidator[className][name] = [new ValidatorModel('required', 0)];
            }

        } else {
            // note : class validation not register
            registerValidator[className] = {
                [name]: [new ValidatorModel('required', 0)]
            }
        }
    }
}

/*
* note : minLength decorator
*  target : class , name: property name
* */
function MinLengthDecorator(minLength: number): PropertyDecoratorType {
    return function (target: any, name: string): void {
        const className = target.constructor.name;
        if (registerValidator.hasOwnProperty(className)) {
            // note : check if the property name validator register
            if (registerValidator[className].hasOwnProperty(name)) {
                registerValidator[className][name].push(new ValidatorModel('minLength', minLength));
            } else {
                registerValidator[className][name] = [new ValidatorModel('minLength', minLength)];
            }

        } else {
            // note : class validation not register
            registerValidator[className] = {
                [name]: [new ValidatorModel('minLength', minLength)]
            }
        }
    }
}

/*
* note : PositiveValue decorator to validate positive number
*  target : class , name: property name
* */
function PositiveValueDecorator(): PropertyDecoratorType {
    return function (target: any, name: string): void {
        const className = target.constructor.name;
        if (registerValidator.hasOwnProperty(className)) {
            // note : check if the property name validator register
            if (registerValidator[className].hasOwnProperty(name)) {
                registerValidator[className][name].push(new ValidatorModel('positive', 0));
            } else {
                registerValidator[className][name] = [new ValidatorModel('positive', 0)];
            }

        } else {
            // note : class validation not register
            registerValidator[className] = {
                [name]: [new ValidatorModel('minLength', 0)]
            }
        }
    }
}

// section : Type
type UserInputType = [string, string, number];
type PropertyDecoratorType = (target: any, name: string) => void;
type InValid = { propertyName: string, error: string } ;


// section: interface
// note : to validate the register storage
interface ValidatorStorage {
    [className: string]: {
        [propertyName: string]: ValidatorModel[];
    }
}

// section : utility 
function validator(obj: any): ValidatorInfoModel {
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
                case 'required': {
                    const isValidProperty = obj[propertyName].length > 0;
                    if (!isValidProperty) {
                        isValid = false;
                        inValidProperty.push({propertyName: propertyName, error: `${propertyName} is required!`})
                    }
                    break;
                }
                case 'minLength': {
                    const isValidProperty = obj[propertyName].length > validatorObj.value;
                    if (!isValidProperty) {
                        isValid = false;
                        inValidProperty.push({
                            propertyName: propertyName,
                            error: `The Minimum Length For ${propertyName} is ${validatorObj.value}`
                        })
                    }
                    break;
                }
                case 'positive': {
                    const isValidProperty = obj[propertyName] > 0;
                    if (!isValidProperty) {
                        isValid = false;
                        inValidProperty.push({
                            propertyName: propertyName,
                            error: `The Value For ${propertyName} Not Valid : ${validatorObj.value}`
                        })
                    }
                    break;
                }


            }
        })
    }

    return new ValidatorInfoModel(isValid, inValidProperty);
}


// section : code
const _projInput = new ProjectInput('project-input', 'app');


