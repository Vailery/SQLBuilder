import { SelectAggregation } from "./SelectAggregation";
import { WhereOperation } from "./WhereClause";

export interface SelectField {
  type: SelectAggregation;
  value: string;
}

export interface ExecuteQueryRequest {
  selectFields: SelectField[];
  tableName: string;
  whereClause: WhereOperation | null;
}
