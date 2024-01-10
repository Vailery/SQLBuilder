import {
  CombiningWhereOperation,
  ComparisonOperation,
} from "./WhereOperations";

export interface SimpleOperation {
  type: "simple";
  operator: ComparisonOperation;
  value1: string;
  value2: string;
}

export interface ComplexOpeartion {
  type: "complex";
  operator: CombiningWhereOperation;
  operations: WhereOperation[];
}

export type WhereOperation = SimpleOperation | ComplexOpeartion;
