/// <reference path="decorators/app.decorators.ts"/>
/// <reference path="storage/storage.ts"/>
/// <reference path="models/validator.model.ts"/>
/// <reference path="models/validatorInfo.model.ts"/>
/// <reference path="models/project.model.ts"/>
/// <reference path="type/app.type.ts"/>
/// <reference path="interfaces/dragDrop.interface.ts"/>
/// <reference path="enums/app.enums.ts"/>
/// <reference path="utility/app.utilities.ts"/>
/// <reference path="classes/app.classes.ts"/>
/// <reference path="main.ts"/>

namespace App {
  // section : code
  const projectInput = new ProjectInput("project-input", "app");
  const activeProjects = new ProjectList("project-list", "app", "active");
  const finishedProjects = new ProjectList("project-list", "app", "finished");
}
