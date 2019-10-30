const getUserByEmail = function(email, database) {
  for (let userID in database) {
    if(email === database[userID]["email"])
    return database[userID]["id"]
  }
};

module.exports = {getUserByEmail};