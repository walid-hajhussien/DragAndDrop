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
                registerValidator[className][name].push('required');
            } else {
                registerValidator[className][name] = ['required'];
            }

        } else {
            // note : class validation not register
            registerValidator[className] = {
                [name]: ['required']
            }
        }
    }
}

// section : Type
type UserInputType = [string, string, number];
type PropertyDecoratorType = (target: any, name: string) => void;

// section: interface
// note : to validate the register storage
interface ValidatorStorage {
    [className: string]: {
        [propertyName: string]: string[];
    }
}

// section: storage
const registerValidator: ValidatorStorage = {};


// section: models
class ProjectModel {
    @RequiredDecorator()
    public title: string;
    @RequiredDecorator()
    public description: string;
    public people: number;

    constructor(title: string, description: string, people: number) {
        this.description = description;
        this.title = title;
        this.people = people;
    }
}

// section : code
const _projInput = new ProjectInput('project-input', 'app');
