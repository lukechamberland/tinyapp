// checks if email is already in database

const getUserByEmail = function(userDB, email) {
  for (const userID in userDB) {
    const userObj = userDB[userID];
    if (userObj.email === email) {
      return userObj;
    } 
  }
}

const getUserUrls = function(urlDatabase, userId) {
  const newUrlObj = {};
  for (const shortId in urlDatabase) {
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