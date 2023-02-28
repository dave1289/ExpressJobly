const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
//  creating a group of keys and a group of indexes corresponding for SQL data handling

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
//   Returns the data to create the references and values for SQL updates
// combines return value with prebuilt SQL query within the patch route from ../routes/companies.js
}

module.exports = { sqlForPartialUpdate };
