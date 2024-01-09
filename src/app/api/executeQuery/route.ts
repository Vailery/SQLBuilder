import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ExecuteQueryRequest,
  SelectField,
} from "@/lib/types/ExecuteQueryRequest";
import {
  ExecuteQueryErrorResponse,
  ExecuteQueryResponse,
} from "@/lib/types/ExecuteQueryResponse";
import { selectAggregationValues } from "@/lib/types/SelectAggregation";
import {
  ComplexOpeartion,
  SimpleOperation,
  WhereOperation,
} from "@/lib/types/WhereClause";
import {
  combiningWhereOperations,
  comparisonOperations,
} from "@/lib/types/WhereOperations";
import {
  posrgreSQLQueryClauseValidator,
  postgreSQLNameValidator,
  postgreSQLTableNameValidator,
} from "@/lib/validators";

export async function POST(req: NextRequest) {
  const data = (await req.json()) as ExecuteQueryRequest;

  const validationError = validateInput(data);
  if (validationError !== null) {
    return validationError;
  }

  let query = "SELECT ";

  const selectQuery = data.selectFields
    .map((it) => ({ ...it, value: it.value === "*" ? "*" : `"${it.value}"` }))
    .map((it) => {
      switch (it.type) {
        case "none":
          return `${it.value}`;
        case "avg":
          return generateAggregateSelectQuery("AVG", it.value);
        case "count":
          return generateAggregateSelectQuery("COUNT", it.value);
        case "sum":
          return generateAggregateSelectQuery("SUM", it.value);
        default:
          exhaustiveSwitch(it.type);
      }
    })
    .join(",");

  query += selectQuery;

  query += " FROM ";
  query += `"${data.tableName}" `;

  query += generateWhereClause(data);

  try {
    const queryResponse = (await prisma.$queryRawUnsafe(query)) as any[];

    const responseData: ExecuteQueryResponse = {
      data: queryResponse,
    };

    const queryResponseString = JSON.stringify(responseData, (_key, value) => {
      return typeof value === "bigint" ? (value = value.toString()) : value;
    });

    return new NextResponse(queryResponseString, { status: 200 });
  } catch (e) {
    return generateError((e as any).meta.message);
  }
}

const generateAggregateSelectQuery = (
  operator: string,
  field: string
): string => {
  return `${operator}(${field}) as "${operator}(${field.replaceAll('"', "")})"`;
};

const generateWhereClause = (data: ExecuteQueryRequest): string => {
  if (data.whereClause === null) {
    return "";
  }

  return ` WHERE ${generateCondition(data.whereClause)}`;
};

const generateCondition = (op: WhereOperation): string => {
  if (op.type === "simple") {
    return generateSimpleCondition(op);
  } else {
    return generateComplexCondition(op);
  }
};
const generateSimpleCondition = (op: SimpleOperation): string => {
  const value1 = op.value1.startsWith("'") ? op.value1 : `"${op.value1}"`;
  const value2 = op.value2.startsWith("'") ? op.value2 : `"${op.value2}"`;
  return `(${value1} ${op.operator} ${value2})`;
};
const generateComplexCondition = (op: ComplexOpeartion): string => {
  return (
    "(" +
    op.operations
      .map((operation) => {
        return generateCondition(operation);
      })
      .join(` ${op.operator} `) +
    ")"
  );
};

const validateInput = (data: ExecuteQueryRequest): NextResponse | null => {
  const selectRes = validateSelectFields(data.selectFields);
  if (selectRes !== null) {
    return selectRes;
  }

  const tableNameRes = validateTableName(data.tableName);
  if (tableNameRes !== null) {
    return tableNameRes;
  }

  const whereRes = validateWhereClause(data.whereClause);
  if (whereRes !== null) {
    return whereRes;
  }

  return null;
};

const validateSelectFields = (select: SelectField[]): NextResponse | null => {
  for (const selectField of select) {
    if (!selectAggregationValues.includes(selectField.type)) {
      return generateError(
        `Aggreagaction function '${selectField.type}' is not supported`
      );
    }

    if (selectField.value.length === 0) {
      return generateError(`Empty fields are not allowed in PostgreSQL`);
    }
    if (!postgreSQLNameValidator.test(selectField.value)) {
      return generateError(
        `Field '${selectField.value}' is not a valid PostgreSQL field`
      );
    }
  }
  return null;
};

const validateTableName = (tableName: string): NextResponse | null => {
  if (tableName.length === 0) {
    return generateError(`Empty Table name are not allowed in PostgreSQL`);
  }
  if (!postgreSQLTableNameValidator.test(tableName)) {
    return generateError(
      `Table name '${tableName}' is not a valid PostgreSQL table name`
    );
  }

  return null;
};

const validateWhereClause = (
  where: WhereOperation | null
): NextResponse | null => {
  if (where === null) {
    return null;
  }

  if (where.type === "simple") {
    return validateSimpleWhere(where);
  } else {
    return validateComplexWhere(where);
  }
};

const validateSimpleWhere = (where: SimpleOperation): NextResponse | null => {
  if (!comparisonOperations.includes(where.operator)) {
    return generateError(
      `Comparison operator '${where.operator}' is not supported`
    );
  }

  if (where.value1.length === 0 || where.value2.length === 0) {
    return generateError(
      `Query clause should not be empty or should be literal`
    );
  }
  if (!posrgreSQLQueryClauseValidator.test(where.value1)) {
    return generateError(
      `Query clause '${where.value1}' is malformed. Maybe you ment to use literal?`
    );
  }
  if (!posrgreSQLQueryClauseValidator.test(where.value2)) {
    return generateError(
      `Query clause '${where.value2}' is malformed. Maybe you ment to use literal?`
    );
  }

  return null;
};

const validateComplexWhere = (where: ComplexOpeartion): NextResponse | null => {
  if (!combiningWhereOperations.includes(where.operator)) {
    return generateError(
      `Combining operator '${where.operator}' is not supported`
    );
  }

  if (where.operations.length <= 1) {
    return generateError(
      `Combination of conditions should containt at least 2 entries`
    );
  }

  for (const op of where.operations) {
    const validationRes = validateWhereClause(op);
    if (validationRes !== null) {
      return validationRes;
    }
  }

  return null;
};

const generateError = (message: string) => {
  return NextResponse.json(
    {
      errorMessage: message,
    } as ExecuteQueryErrorResponse,
    { status: 400 }
  );
};

function exhaustiveSwitch(a: never): never {
  throw "will never throw";
}
