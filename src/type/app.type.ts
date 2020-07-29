namespace App {
  // section : Type
  export type UserInputType = [string, string, number];
  export type PropertyDecoratorType = (target: any, name: string) => void;
  export type InValid = { propertyName: string; error: string };
  export type ListenerFn = (items: ProjectModel[]) => void;
}
