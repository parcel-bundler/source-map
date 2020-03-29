// @flow
import type { IndexedMapping } from "./types";

export default class MappingLine {
  isSorted: boolean;
  mappings: Array<IndexedMapping<number>>;
  lineNumber: number;
  lastColumn: number;

  constructor(lineNumber: number) {
    this.lineNumber = lineNumber;
    this.isSorted = true;
    this.mappings = [];
    this.lastColumn = 0;
  }

  addMapping(mapping: IndexedMapping<number>) {
    this.mappings.push(mapping);
    if (this.isSorted && this.lastColumn > mapping.generated.column) {
      this.isSorted = false;
    }
    this.lastColumn = mapping.generated.column;
  }

  sort() {
    if (!this.isSorted) {
      // TODO: Sort the mappings...
    }
  }
}
