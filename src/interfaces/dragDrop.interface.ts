namespace App {
  export interface ValidatorStorage {
    [className: string]: {
      [propertyName: string]: ValidatorModel[];
    };
  }

  export interface Draggable {
    dragStart(event: DragEvent): void;

    dragEnd(event: DragEvent): void;
  }
}
