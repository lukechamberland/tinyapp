// checks if email is already in database

const getUserByEmail = function(userDB, email) {
  for (let userID in userDB) {
    const userObj = userDB[userID];
    if (userObj.email === email) {
      return userObj;
    } 
  }
  return undefined;
}

const getUserUrls = function(urlDatabase, userId) {
  const newUrlObj = {};
  for (let shortId in urlDatabase) {
    if (urlDatabase[shortId].userID === userId) {
      newUrlObj[shortId] = urlDatabase[shortId];
    }
  }
  return newUrlObj;
}
// generates random 6 digit string
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

module.exports = { getUserByEmail, getUserUrls, generateRandomString };