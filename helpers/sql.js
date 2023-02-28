const { BadRequestError } = require("../expressError");

// This function accepts data for updating and additional params passed in through JS to convert into SQL/JSON
// First we create an array of keys from DB data and check that it has contents
// Secondly we map that into an array of columns to be updated and checks with 'jstosql' that we are using the appropriate name for the DB
// Finally the list of columns to update and their values are returned to our SQL query in progress

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
}

module.exports = { sqlForPartialUpdate };
