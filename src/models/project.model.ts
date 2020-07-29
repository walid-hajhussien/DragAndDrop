namespace App {
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
}
