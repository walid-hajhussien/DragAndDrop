// section: interface

import { ValidatorModel } from "../models/app.models";

// note : to validate the register storage
export interface ValidatorStorage {
  [className: string]: {
    [propertyName: string]: ValidatorModel[];
  };
}

// note : Draggable interface
export interface Draggable {
  dragStart(event: DragEvent): void;

  dragEnd(event: DragEvent): void;
}

/*
 * note:  DraggableTarget interface
 * */
export interface DraggableTarget {
  // note : to inform js this is a draggable element
  dragOver(event: DragEvent): void;

  // note: to handle the drop
  dropElement(event: DragEvent): void;

  // note : reverse the dragOver feedback like css
  dragLeave(event: DragEvent): void;
}
