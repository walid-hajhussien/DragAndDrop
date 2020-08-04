// section: models

import { ProjectStatus } from "../enums/app.enums";
import { InValid } from "../type/app.type";
import {
  RequiredDecorator,
  MinLengthDecorator,
  PositiveValueDecorator,
} from "../decorators/app.decoraters";

// note : ValidatorModel to create validator object
export class ValidatorModel {
  constructor(public type: string, public value: number) {}
}

// note : ProjectModel to create project
export class ProjectModel {
  @RequiredDecorator()
  public title: string;
  @MinLengthDecorator(6)
  public description: string;
  @PositiveValueDecorator()
  public people: number;
  @PositiveValueDecorator()
  public id: number;
  public status: ProjectStatus;

  constructor(
    title: string,
    description: string,
    people: number,
    id: number,
    status: ProjectStatus
  ) {
    this.description = description;
    this.title = title;
    this.people = people;
    this.id = id;
    this.status = status;
  }
}

// note : type ValidatorInfo = { isValid: boolean, inValid: { propertyName: string, error: string } }
export class ValidatorInfoModel {
  constructor(public isValid: boolean, public inValidProperty: InValid[]) {}
}
