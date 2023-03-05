const {sqlForPartialUpdate} = require('./sql')

const testRequest = {
   password: 'password',
   firstName: 'Steven',
   lastName: 'Stevenson',
   email: 'steve@stevenson.com'
}

const jsonToSQL = {
   firstName: "first_name",
   lastName: "last_name",
   isAdmin: "is_admin",
 }

describe("Test partial sql update method", function () {
  test("Make sure we receive 2 arrays: colnames, values", function () {
    const updateUser = sqlForPartialUpdate(testRequest, jsonToSQL)
    expect(updateUser).toEqual({
      setCols: `\"password\"=$1, \"first_name\"=$2, \"last_name\"=$3, \"email\"=$4`,
      values: [
        "password",
        "Steven",
        "Stevenson",
        "steve@stevenson.com"
      ]
    })
  });
});

// EXPECTED OUTPUT STRUCTURE
// {
//   setCols: `\"password\"=$1, \"first_name\"=$2, \"last_name\"=$3, \"email\"=$4`,
//   values: [
//     "password",
//     "Fname",
//     "Lname",
//     "Email"
//   ]
// }