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

  export interface DraggableTarget {
    // note : to inform js this is a draggable element
    dragOver(event: DragEvent): void;

    // note: to handle the drop
    dropElement(event: DragEvent): void;

    // note : reverse the dragOver feedback like css
    dragLeave(event: DragEvent): void;
  }
}
