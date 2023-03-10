const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail( testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(user.email, "user@example.com");
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined of a non existant user', function() {
    const user = getUserByEmail( testUsers, "a@b.c");
    assert.equal(user, undefined)
  });
});
