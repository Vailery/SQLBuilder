export const selectAggregationValues = ["none", "avg", "count", "sum"] as const;

export type SelectAggregation = (typeof selectAggregationValues)[number];
