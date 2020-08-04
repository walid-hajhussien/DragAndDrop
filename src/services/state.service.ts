/*
 * note : state management class to mange the application state
 *  we using private constructor to apply the singleton pattern
 * note : we're guaranteed to always work with the exact same object and we'll always only have one object of the type in the entire application
 *   which is the idea here because I only want to have one state management object for our project
 * */

import { ValidatorStorage } from "../interfaces/app.interfaces";
import { State } from "../classes/app.classes";
import { ListenerFn } from "../type/app.type";
import { ProjectModel } from "../models/app.models";
import { ProjectStatus } from "../enums/app.enums";

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

export class ValidatorStorageService {
  private static instance: ValidatorStorageService;
  public registerValidator: ValidatorStorage;

  private constructor() {
    this.registerValidator = {};
  }

  static createInstance(): ValidatorStorageService {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ValidatorStorageService();
    return this.instance;
  }
}
