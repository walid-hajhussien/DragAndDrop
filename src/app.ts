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
        console.log('submit', this.titleInput);
    }

}

// section : Decorator

/*
* note: (_)  means I will not use but don't complain
*  target : class , name : method name , descriptor : PropertyDescriptor
*
* */
function AutoBindingDecorator(_target: any, _name: string, descriptor: PropertyDescriptor): PropertyDescriptor {
   const newDescriptor:PropertyDescriptor = {
       enumerable: descriptor.enumerable,
       configurable: descriptor.configurable,
       get() {
           const newValue = descriptor.value.bind(this);
           return newValue
       }
   }
    return (newDescriptor)
}

// section : code
const _projInput = new ProjectInput('project-input', 'app');
