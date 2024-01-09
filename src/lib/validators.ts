export const postgreSQLNameValidator = /(^[a-z_][a-z_0-9]*$)|(^\*$)/im;

export const postgreSQLTableNameValidator = /^[a-z_][a-z_0-9]*$/im;

export const posrgreSQLQueryClauseValidator =
  /^(('[^']*')|([a-z_][a-z_0-9]*))$/im;
