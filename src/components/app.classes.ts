namespace App {
  // Section : Classes
  /*
   * note  : base class which contain the common method & property
   *   abstract make the class just for inheritance
   *
   * */
  export abstract class ComponentProject<
    T extends HTMLElement,
    U extends HTMLElement
  > {
    protected templateEl: HTMLTemplateElement;
    protected hostingEl: T;
    protected templateContent: U;
    protected insertAtBegin: boolean;

    constructor(
      protected templateId: string,
      protected hostingId: string,
      insertAtBegin: boolean,
      protected assignId?: string
    ) {
      this.insertAtBegin = insertAtBegin;
      // note : get the html elements for template & target
      this.templateEl = document.getElementById(
        templateId
      )! as HTMLTemplateElement;
      this.hostingEl = document.getElementById(hostingId)! as T;

      // note : get the Fragment of the template, true mean get all the element
      const importedNode: DocumentFragment = document.importNode(
        this.templateEl.content,
        true
      );

      // note:get the elements from the node
      this.templateContent = importedNode.firstElementChild as U;
      // note : add the ID
      if (assignId) {
        this.templateContent.id = assignId;
      }

      // note : render the content
      this.attach();
    }

    protected attach(): void {
      const position = this.insertAtBegin ? "afterbegin" : "beforeend";
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
  export abstract class State<T extends Function> {
    // note : projectListener is a functions will be call at any update
    protected projectListeners: T[];

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
  export class ProjectInput extends ComponentProject<
    HTMLDivElement,
    HTMLFormElement
  > {
    private titleInput: HTMLInputElement;
    private descriptionInput: HTMLInputElement;
    private peopleInput: HTMLInputElement;
    private errorLists: HTMLUListElement;

    constructor(templateId: string, hostingId: string) {
      super(templateId, hostingId, true, "user-input");
      this.titleInput = this.templateContent.querySelector(
        "#title"
      )! as HTMLInputElement;
      this.descriptionInput = this.templateContent.querySelector(
        "#description"
      )! as HTMLInputElement;
      this.peopleInput = this.templateContent.querySelector(
        "#people"
      )! as HTMLInputElement;
      this.errorLists = this.templateContent.querySelector(
        "#errorMessages"
      )! as HTMLUListElement;

      // note : add the event
      this.configContent();
    }

    configContent() {
      // note : addEventListener will missing the context , we can fix by using bind or decorator
      this.templateContent.addEventListener("submit", this.submitForm);
    }

    renderContent() {}

    @AutoBindingDecorator
    private submitForm(event: Event) {
      event.preventDefault();
      const input: UserInputType = this.getUserInput();
      const [title, desc, people] = input;
      const project: ProjectModel = new ProjectModel(
        title,
        desc,
        people,
        applicationState.generateId(),
        ProjectStatus.Active
      );
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
      return [title, description, pepole];
    }

    //note : clear all the input
    private clearInput(): void {
      this.titleInput.value = "";
      this.descriptionInput.value = "";
      this.peopleInput.value = "";
      this.errorLists.innerHTML = "";
    }

    //note : show error messages
    private showErrorMessages(errorMessages: InValid[]): void {
      let lists = ``;
      errorMessages.map((value, _index) => {
        lists = lists + `<li>${value.error}</li>`;
      });
      this.errorLists.innerHTML = lists;
    }
  }

  /*
   * note : project list class to render the projects on the dom , active:active project, finished:finished project
   *
   * */
  export class ProjectList extends ComponentProject<HTMLDivElement, HTMLElement>
    implements DraggableTarget {
    private projects: ProjectModel[];
    // note: list inside element content
    private listEl: HTMLUListElement;

    //note templateId:project-list hostingId:app
    constructor(
      templateId: string,
      hostingId: string,
      private type: "active" | "finished"
    ) {
      super(templateId, hostingId, false, `${type}-projects`);
      this.projects = [];

      this.listEl = this.templateContent.querySelector("ul")!;
      this.templateContent.querySelector(
        "ul"
      )!.id = `${this.type}-projects-list`;
      this.templateContent.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECTS";

      this.configContent();
    }

    configContent() {
      // note: add event listener
      applicationState.addEventListener((projects: ProjectModel[]) => {
        this.projects = projects.filter((value) => {
          if (this.type === "active") {
            return value.status === ProjectStatus.Active;
          }
          return value.status === ProjectStatus.Finished;
        });
        this.renderContent();
      });

      // note: add drop event
      this.templateContent.addEventListener("dragover", this.dragOver);
      this.templateContent.addEventListener("dragleave", this.dragLeave);
      this.templateContent.addEventListener("drop", this.dropElement);
    }

    renderContent() {
      const listEl = document.getElementById(
        `${this.type}-projects-list`
      ) as HTMLUListElement;
      listEl.innerHTML = "";
      this.projects.map((project) => {
        // const item = document.createElement('li');
        // item.textContent = project.title;
        // listEl.appendChild(item);
        new ProjectItem(
          `${this.type}-projects-list`,
          project,
          "single-project"
        );
      });
    }

    @AutoBindingDecorator
    dragOver(event: DragEvent): void {
      // note : check if the element allow to drop & its a text not image
      //   preventDefault because the default is not allow drop & the drop event will not fire
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/id") {
        event.preventDefault();
        this.listEl.classList.add("droppable");
      }
    }

    @AutoBindingDecorator
    dragLeave(_event: DragEvent): void {
      this.listEl.classList.remove("droppable");
    }

    @AutoBindingDecorator
    dropElement(event: DragEvent): void {
      // note : get the project ID
      const projectId: number = +event.dataTransfer!.getData("text/id");
      const projectType = event.dataTransfer!.getData("text/type");

      // note : move to the same place  a to a
      if (this.type === projectType) {
        this.listEl.classList.remove("droppable");
        return;
      }

      if (this.type === "finished") {
        applicationState.changeProjectStatus(projectId, ProjectStatus.Finished);
      } else {
        applicationState.changeProjectStatus(projectId, ProjectStatus.Active);
      }
      this.listEl.classList.remove("droppable");
    }
  }

  /*
   * note : project Item class to render the projects details inside the list
   *
   * */

  export class ProjectItems<T extends HTMLElement> {
    private hostingEl: T;

    constructor(private hostingId: string, private itemTag: string) {
      this.hostingEl = document.getElementById(hostingId) as T;
    }

    render(projects: ProjectModel[]) {
      this.hostingEl.innerHTML = "";
      projects.map((project) => {
        const item = document.createElement(this.itemTag);
        item.textContent = project.title;
        this.hostingEl.appendChild(item);
      });
    }
  }

  /*
   * note : project Item class to render the projects details inside the list
   *
   * */

  export class ProjectItem
    extends ComponentProject<HTMLUListElement, HTMLLIElement>
    implements Draggable {
    private readonly isFinished: boolean;

    get persons() {
      return this.project.people > 1
        ? this.project.people + " Persons Assigns"
        : "1 Person Assigns";
    }

    constructor(
      hostingId: string,
      private project: ProjectModel,
      templateId: string
    ) {
      super(templateId, hostingId, false, project.id.toString());
      this.isFinished = this.project.status === ProjectStatus.Finished;
      this.renderContent();
      this.configContent();
    }

    renderContent(): void {
      this.templateContent.querySelector(
        "h2"
      )!.textContent = this.project.title;
      this.templateContent.querySelector("h3")!.textContent = this.persons;
      this.templateContent.querySelector(
        "p"
      )!.textContent = this.project.description;
      if (this.isFinished) {
        this.templateContent.querySelector("button")!.textContent = "Active";
        this.templateContent.querySelector("button")!.style.backgroundColor =
          "blue";
        this.templateContent.querySelector("button")!.style.border =
          "1px solid blue";
      }
    }

    configContent(): void {
      // note: click Event
      this.templateContent
        .querySelector("button")!
        .addEventListener("click", () => {
          const neStatus = this.isFinished
            ? ProjectStatus.Active
            : ProjectStatus.Finished;
          applicationState.changeProjectStatus(this.project.id, neStatus);
        });

      // note : Drag Event
      this.templateContent.draggable = true;
      this.templateContent.addEventListener("dragstart", this.dragStart);
      this.templateContent.addEventListener("dragend", this.dragEnd);
    }

    @AutoBindingDecorator
    dragStart(event: DragEvent): void {
      // note: add info to the target event
      event.dataTransfer!.setData("text/id", this.project.id.toString());
      event.dataTransfer!.setData(
        "text/type",
        this.isFinished ? "finished" : "active"
      );
      // note : This basically controls how the cursor will look like and tells the browser a little bit about our intention
      //  that we plan to move an element from a to b.
      // Note : move : the element will be remove from a & add to b
      //  copy: the element will be copy from a to b
      event.dataTransfer!.effectAllowed = "move";
    }

    @AutoBindingDecorator
    dragEnd(event: DragEvent): void {
      console.log("dragEnd", event);
    }
  }

  /*
   * note : state management class to mange the application state
   *  we using private constructor to apply the singleton pattern
   * note : we're guaranteed to always work with the exact same object and we'll always only have one object of the type in the entire application
   *   which is the idea here because I only want to have one state management object for our project
   * */

  export class ProjectState extends State<ListenerFn> {
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

    changeProjectStatus(projectId: number, status: ProjectStatus) {
      this.projects.map((project) => {
        if (project.id === projectId) {
          project.status = status;
        }
      });
      this.runListenerFun();
    }

    private runListenerFun() {
      this.projectListeners.map((fn: Function) => {
        fn(this.projects.slice());
      });
    }
  }
}
