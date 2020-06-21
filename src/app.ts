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
    @PositiveValueDecorator()
    public id: number;
    public status: ProjectStatus;

    constructor(title: string, description: string, people: number, id: number, status: ProjectStatus) {
        this.description = description;
        this.title = title;
        this.people = people;
        this.id = id;
        this.status = status;
    }
}

// note : type ValidatorInfo = { isValid: boolean, inValid: { propertyName: string, error: string } }
class ValidatorInfoModel {
    constructor(public isValid: boolean, public inValidProperty: InValid[]) {
    }
}

// Section : Classes
/*
* note  : base class which contain the common method & property
*   abstract make the class just for inheritance
*
* */
abstract class ComponentProject<T extends HTMLElement, U extends HTMLElement> {
    protected templateEl: HTMLTemplateElement;
    protected hostingEl: T;
    protected templateContent: U;
    protected insertAtBegin: boolean;


    constructor(protected templateId: string, protected hostingId: string, insertAtBegin: boolean, protected assignId?: string) {
        this.insertAtBegin = insertAtBegin;
        // note : get the html elements for template & target
        this.templateEl = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostingEl = document.getElementById(hostingId)! as T;

        // note : get the Fragment of the template, true mean get all the element
        const importedNode: DocumentFragment = document.importNode(this.templateEl.content, true);

        // note:get the elements from the node
        this.templateContent = importedNode.firstElementChild as U;
        // note : add the ID
        if (assignId) {
            this.templateContent.id = assignId && assignId;
        }

        // note : render the content
        this.attach();

    }

    protected attach(): void {
        const position = (this.insertAtBegin) ? 'afterbegin' : 'beforeend';
        this.hostingEl.insertAdjacentElement(position, this.templateContent);
    }

    abstract configContent(): void;

    abstract renderContent(): void;

}

/*
* note  : state class which contain the common method & property
*   abstract make the class just for inheritance
*
* */
abstract class State<T extends Function> {
    // note : projectListener is a functions will be call at any update
    protected projectListeners: T [];

    constructor() {
        this.projectListeners = [];
    }

    addEventListener(fn: T) {
        this.projectListeners.push(fn);
    }

}

/*
* note 1 : you need to inform ts what is you going to select (document.getElementById) & not null
*  ProjectInput class to render the form & control it
* */
class ProjectInput extends ComponentProject<HTMLDivElement, HTMLFormElement> {

    private titleInput: HTMLInputElement;
    private descriptionInput: HTMLInputElement;
    private peopleInput: HTMLInputElement;
    private errorLists: HTMLUListElement;


    constructor(templateId: string, hostingId: string) {
        super(templateId, hostingId, true, 'user-input');
        this.titleInput = this.templateContent.querySelector('#title')! as HTMLInputElement;
        this.descriptionInput = this.templateContent.querySelector('#description')! as HTMLInputElement;
        this.peopleInput = this.templateContent.querySelector('#people')! as HTMLInputElement;
        this.errorLists = this.templateContent.querySelector('#errorMessages')! as HTMLUListElement;

        // note : add the event
        this.configContent()
    }


    configContent() {
        // note : addEventListener will missing the context , we can fix by using bind or decorator
        this.templateContent.addEventListener('submit', this.submitForm);
    }

    renderContent() {
    }

    @AutoBindingDecorator
    private submitForm(event: Event) {
        event.preventDefault();
        const input: UserInputType = this.getUserInput();
        const [title, desc, people] = input;
        const project: ProjectModel = new ProjectModel(title, desc, people, applicationState.generateId(), ProjectStatus.Active);
        const validatorResult = validator(project);
        console.log(registerValidator);
        console.log("validator", validatorResult);
        if (validatorResult.isValid) {
            applicationState.addProject(project);
            this.clearInput();
            return;
        }

        this.showErrorMessages(validatorResult.inValidProperty);
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
        this.errorLists.innerHTML = '';
    }

    //note : show error messages
    private showErrorMessages(errorMessages: InValid[]): void {
        let lists = ``;
        errorMessages.map((value, _index) => {
            lists = lists + `<li>${value.error}</li>`
        })
        this.errorLists.innerHTML = lists;
    }

}

/*
* note : project list class to render the projects on the dom , active:active project, finished:finished project
*
* */
class ProjectList extends ComponentProject<HTMLDivElement, HTMLElement> {
    private projects: ProjectModel[];


//note templateId:project-list hostingId:app
    constructor(templateId: string, hostingId: string, private type: 'active' | 'finished') {

        super(templateId, hostingId, false, `${type}-projects`);
        this.projects = [];


        this.configContent();

    }


    configContent() {
        // add event listener
        applicationState.addEventListener((projects: ProjectModel[]) => {
            this.projects = projects.filter((value) => {
                if (this.type === 'active') {
                    return value.status === ProjectStatus.Active;
                }
                return value.status === ProjectStatus.Finished;
            });
            this.renderContent();
        });

        this.templateContent.querySelector('ul')!.id = `${this.type}-projects-list`
        this.templateContent.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    renderContent() {
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        listEl.innerHTML = "";
        this.projects.map((project) => {
            const item = document.createElement('li');
            item.textContent = project.title;
            listEl.appendChild(item);
        })

    }
}

/*
* note : project Item class to render the projects details inside the list
*
* */

class ProjectItem {

}

/*
* note : state management class to mange the application state
*  we using private constructor to apply the singleton pattern
* note : we're guaranteed to always work with the exact same object and we'll always only have one object of the type in the entire application
*   which is the idea here because I only want to have one state management object for our project
* */

class ProjectState extends State<ListenerFn> {

    private projects: ProjectModel[];
    private id: number;
    private static instance: ProjectState;

    private constructor(startingId: number = 1) {
        super();
        this.id = startingId;
        this.projects = [];
        this.projectListeners = [];
    }

    static createInstance(startingId: number): ProjectState {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState(startingId);
        return this.instance;
    }

    addProject(project: ProjectModel) {
        this.projects.push(project);
        this.runListenerFun();
    }

    generateId() {
        const newId = this.id;
        this.id++;
        return newId;
    }

    private runListenerFun() {
        this.projectListeners.map((fn: Function) => {
            fn(this.projects.slice());
        })
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
type ListenerFn = (items: ProjectModel[]) => void;

// section : enum
enum ProjectStatus {Active, Finished}


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
                        inValidProperty.push({
                            propertyName: propertyName,
                            error: `The ${propertyName.toLocaleUpperCase()} is required!`
                        })
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
                            error: `The Value For ${propertyName} Is Not Valid : ${validatorObj.value}`
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
const applicationState = ProjectState.createInstance(1);
const projectInput = new ProjectInput('project-input', 'app');
const activeProjects = new ProjectList('project-list', 'app', 'active');
const finishedProjects = new ProjectList('project-list', 'app', 'finished');


