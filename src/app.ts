import {
  ProjectState,
  ValidatorStorageService,
} from "./services/state.service";
import { ValidatorStorage } from "./interfaces/app.interfaces";
import { ProjectInput, ProjectList } from "./classes/app.classes";

// section: storage
const registerValidator: ValidatorStorage = ValidatorStorageService.createInstance()
  .registerValidator;

// section : code
const applicationState = ProjectState.createInstance(1);
const projectInput = new ProjectInput("project-input", "app");
const activeProjects = new ProjectList("project-list", "app", "active");
const finishedProjects = new ProjectList("project-list", "app", "finished");
