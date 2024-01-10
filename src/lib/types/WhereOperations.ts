export const combiningWhereOperations = ["or", "and"] as const;

export type CombiningWhereOperation = (typeof combiningWhereOperations)[number];

export const comparisonOperations = ["<", ">", "<=", ">=", "=", "!="] as const;

export type ComparisonOperation = (typeof comparisonOperations)[number];
