/**
 * Request handlers
 *
 */

/* eslint no-underscore-dangle: 0, no-console: 0 */

// Dependencies
// const util = require('util');
const codes = require('./codes');
const helpers = require('./helpers');
const _data = require('./data');
const _menuItems = require('./menu');

// Debug to log
// const debug = util.debuglog('handlers');

// Define the handlers
const handlers = {};

/*
 * HTML Handlers
 *
 */

// Index
handlers.index = (data, callback) => {
  // Reject any request isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Pizza delivery - fast and reability',
      'head.description': 'Pizza delivery application - choose, pay and get in an hour your pizza.',
      'body.class': 'index',
    };
    // Read in a template as a string
    helpers.getTemplate('index', templateData, (err, string) => {
      if (!err && string) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(
          string,
          templateData,
          (errUniversalTemplates, strUniversalTemplates) => {
            if (!errUniversalTemplates && strUniversalTemplates) {
              callback(200, strUniversalTemplates, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          }
        );
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Favicon
handlers.favicon = (data, callback) => {
  // Reject any request isn't a GET
  if (data.method === 'get') {
    // Read in the favicon's data
    helpers.getStaticAsset('img/favicon/favicon.ico', (err, dataFavicon) => {
      if (!err && dataFavicon) {
        // Callback the data
        callback(200, dataFavicon, 'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Public assets
handlers.public = (data, callback) => {
  // Reject any request isn't a GET
  if (data.method === 'get') {
    // Get the filename being requested
    const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    if (trimmedAssetName.length > 0) {
      // Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (err, dataStaticAsset) => {
        if (!err && dataStaticAsset) {
          // Determine the content type (default to plain text)
          let contentType = 'plain';
          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css';
          }
          if (trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png';
          }
          if (trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg';
          }
          if (trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon';
          }
          // Callback the data
          callback(codes.OK, dataStaticAsset, contentType);
        } else {
          callback(codes.NOT_FOUND);
        }
      });
    } else {
      callback(codes.NOT_FOUND);
    }
  } else {
    callback(codes.NOT_ALLOWED);
  }
};

// Universal handler
// Required: templateName - name of template,
// templateData - object with head.title,
// description, class and etc, callback
// Optional: none
handlers.universalHandler = (templateName, templateData, callback) => {
  // Read in a template as a string
  helpers.getTemplate(templateName, templateData, (errCreate, strCreate) => {
    if (!errCreate && strCreate) {
      // Add the universal header and footer
      helpers.addUniversalTemplates(strCreate, templateData, (errAddUniversal, strAddUniversal) => {
        if (!errAddUniversal && strAddUniversal) {
          // Return that page as HTML
          callback(codes.OK, strAddUniversal, 'html');
        } else {
          callback(codes.INTERNAL_SERVER_ERROR, undefined, 'html');
        }
      });
    } else {
      callback(codes.INTERNAL_SERVER_ERROR, undefined, 'html');
    }
  });
};

// Create Session
handlers.sessionCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Log in to your Account',
      // 'head.description': 'Please enter your email and password to access your account.',
      'body.class': 'sessionCreate',
    };
    handlers.universalHandler('sessionCreate', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};


// Delete session
handlers.sessionDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Logged Out',
      'head.description': 'You have been logged out of your account.',
      'body.class': 'sessionDeleted',
    };
    handlers.universalHandler('sessionDeleted', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Create Account
handlers.accountCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Create new account',
      'head.description': 'Please enter your email, address and password to create new account.',
      'body.class': 'accountCreate',
    };
    handlers.universalHandler('accountCreate', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Account edit
handlers.accountEdit = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Edit your account information',
      'head.description': 'Edit your account information',
      'body.class': 'accountEdit',
    };
    handlers.universalHandler('accountEdit', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Account updated
handlers.accountUpdated = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Your account has been updated',
      'head.description': 'Continue your choosing of pizza to delivery',
      'body.class': 'accountUpdated',
    };
    handlers.universalHandler('accountUpdated', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Menu
handlers.menuList = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Menu',
      'head.description': 'Choose your pizza',
      'body.class': 'menuList',
    };
    handlers.universalHandler('menuList', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Cart
handlers.cartList = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Cart',
      'head.description': 'Your cart',
      'body.class': 'cartList',
    };
    handlers.universalHandler('cartList', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Empty cart
handlers.cartEmpty = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Cart',
      'head.description': 'Your cart is empty. Goto the menu and choose your pizza.',
      'body.class': 'cartEmpty',
    };
    handlers.universalHandler('cartEmpty', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// List all user's orders
handlers.ordersList = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Your orders',
      'head.description': 'List of your orders.',
      'body.class': 'ordersList',
    };
    handlers.universalHandler('ordersList', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Empty orders
handlers.ordersEmpty = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Orders',
      'head.description': 'You have no any orders. Goto the menu and choose your pizza.',
      'body.class': 'ordersEmpty',
    };
    handlers.universalHandler('ordersEmpty', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Payment order
handlers.ordersPayment = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Payment',
      'head.description': 'Input your credit card data to pay the order.',
      'body.class': 'ordersPayment',
    };
    handlers.universalHandler('ordersPayment', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Orders detail
handlers.ordersDetail = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Detail order#',
      'head.description': 'Your order detail information',
      'body.class': 'ordersDetail',
    };
    handlers.universalHandler('ordersDetail', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// Orders done
handlers.ordersDone = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Your order is accepted',
      'head.description': 'We have started your order delivering',
      'body.class': 'ordersDone',
    };
    handlers.universalHandler('ordersDone', templateData, callback);
  } else {
    callback(codes.NOT_ALLOWED, undefined, 'html');
  }
};

// JSON API handlers

// Users
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(codes.NOT_ALLOWED);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: name, email, address, password
// Optional data: none
handlers._users.post = (data, callback) => {
  // Check that all required fields are filled out
  const name = typeof (data.payload.name) === 'string'
    && data.payload.name.trim().length > 0
    ? data.payload.name.trim() : false;
  const email = typeof (data.payload.email) === 'string'
    && data.payload.email.trim().length > 0
    && helpers.testEmail(data.payload.email)
    ? data.payload.email.trim() : false;
  const address = typeof (data.payload.address) === 'string'
    && data.payload.address.trim().length > 0
    ? data.payload.address.trim() : false;
  const password = typeof (data.payload.password) === 'string'
    && data.payload.password.trim().length > 0
    ? data.payload.password.trim() : false;
  // Check that all values are correct
  if (name && email && address && password) {
    // Make sure that the user doesn't already exist
    _data.read('users', email, (errRead, data) => {
      if (errRead) {
        // Hash the password
        const hashedPassword = helpers.hash(password);
        // Create the user object
        if (hashedPassword) {
          const userObject = {
            name,
            email,
            address,
            hashedPassword,
          };
          // Store the user
          _data.create('users', email, userObject, (errCreate) => {
            if (!errCreate) {
              callback(codes.OK);
            } else {
              callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not create the new user' });
            }
          });
        } else {
          callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not hash the user password' });
        }
      } else {
        // User already exists
        callback(codes.BAD_REQUEST, { Error: 'A user with that email already exists' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required fields or they are not correct (check email)' });
  }
};

// Users - get
// Required data: email, token
// Optional data: none
handlers._users.get = (data, callback) => {
  // Check that the email is valid
  const email = typeof (data.queryStringObject.email) === 'string'
    && data.queryStringObject.email.trim().length > 0
    && helpers.testEmail(data.queryStringObject.email)
    ? data.queryStringObject.email.trim() : false;
  // Get the token from the headers
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token : false;
  if (email && token) {
    // Verify that the given token is valid for the email
    _data.read('users', email, (errRead, userData) => {
      if (!errRead && userData) {
        if (typeof (userData.tokens) === 'object' && userData.tokens.indexOf(token) > -1) {
          handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
            if (tokenIsValid) {
              delete userData.hashedPassword;
              callback(codes.OK, userData);
            } else {
              callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
            }
          });
        } else {
          callback(codes.BAD_REQUEST, { Error: 'The token is invalid' });
        }
      } else {
        callback(codes.BAD_REQUEST, { Error: 'User with the email doesn\'t exist' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Users - put
// Required data: email
// Optional data: name, address, password (at least one must be specified)
handlers._users.put = (data, callback) => {
  // Check for the required field
  const email = typeof (data.payload.email) === 'string'
    && data.payload.email.trim().length > 0
    && helpers.testEmail(data.payload.email)
    ? data.payload.email.trim() : false;
  // Check for the optional fields
  const name = typeof (data.payload.name) === 'string'
    && data.payload.name.trim().length > 0
    ? data.payload.name.trim() : false;
  const address = typeof (data.payload.address) === 'string'
    && data.payload.address.trim().length > 0
    ? data.payload.address.trim() : false;
  const password = typeof (data.payload.password) === 'string'
    && data.payload.password.trim().length > 0
    ? data.payload.password.trim() : false;
  // Error if the email is invalid
  if (email) {
    // Error if nothing is sent to update
    if (name || address || password) {
      // Get the token from the headers
      const token = typeof (data.headers.token) === 'string'
        && data.headers.token.trim().length === 20
        ? data.headers.token : false;
      // Verify that the given token is valid for the email
      handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', email, (err, userData) => {
            if (!err && userData) {
              // Update the fields necessary
              // store new values in updatedUserData for clear function
              const updatedUserData = { ...userData };
              if (name) {
                updatedUserData.name = name;
              }
              if (address) {
                updatedUserData.address = address;
              }
              if (password) {
                updatedUserData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              _data.update('users', email, updatedUserData, (errUpdate) => {
                if (!errUpdate) {
                  callback(codes.OK);
                } else {
                  callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not update the user' });
                }
              });
            } else {
              callback(codes.BAD_REQUEST, { Error: 'The specified user does not exist' });
            }
          });
        } else {
          callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
        }
      });
    } else {
      callback(codes.BAD_REQUEST, { Error: 'Missing fields to update' });
    }
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Users - delete
// Required field : email
handlers._users.delete = (data, callback) => {
  // Check that email is valid
  const email = typeof (data.queryStringObject.email) === 'string'
    && data.queryStringObject.email.trim().length > 0
    && helpers.testEmail(data.queryStringObject.email)
    ? data.queryStringObject.email.trim() : false;
  if (email) {
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string'
      && data.headers.token.trim().length === 20
      ? data.headers.token : false;
    // Verify that the given token is valid for the email
    handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', email, (errRead, userData) => {
          if (!errRead && userData) {
            _data.delete('users', email, (errDelete) => {
              if (!errDelete) {
                // Delete each of the check associated with the user
                const userTokens = typeof (userData.tokens) === 'object'
                  && userData.tokens instanceof (Array)
                  ? userData.tokens : [];
                const tokensToDelete = userTokens.length;
                if (tokensToDelete > 0) {
                  let tokensDeleted = 0;
                  let deletionError = false;
                  // Loop through the checks
                  userTokens.forEach((tokenId) => {
                    // Delete the check with checkId
                    _data.delete('tokens', tokenId, (errToken) => {
                      if (errToken) {
                        deletionError = true;
                      }
                      tokensDeleted += 1;
                      if (tokensDeleted === tokensToDelete) {
                        if (!deletionError) {
                          callback(codes.OK);
                        } else {
                          callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Errors encountered while attempting to delete all of the user\'s checks. All checks may not have deleted from the system successfully' })
                        }
                      }
                    });
                  });
                } else {
                  callback(codes.OK);
                }
              } else {
                callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not delete the specified user' });
              }
            });
          } else {
            callback(codes.BAD_REQUEST, { Error: 'Could not find the specified user' });
          }
        });
      } else {
        callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};


// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(codes.NOT_ALLOWED);
  }
};

// Container for the tokens submethods
handlers._tokens = {};

// Tokens - post
// Required data : email, password
// Optional data : none
handlers._tokens.post = (data, callback) => {
  const email = typeof (data.payload.email) === 'string'
    && data.payload.email.trim().length > 0
    && helpers.testEmail(data.payload.email)
    ? data.payload.email.trim() : false;
  const password = typeof (data.payload.password) === 'string'
    && data.payload.password.trim().length > 0
    ? data.payload.password.trim() : false;
  if (email && password) {
    // Lookup the user who mathes that email
    _data.read('users', email, (errRead, userData) => {
      if (!errRead && userData) {
        // Hash the sent password, and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // If valid, create a new token with a random name.
          // Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            email,
            expires,
            id: tokenId,
          };
          // Store the token
          _data.create('tokens', tokenId, tokenObject, (errCreate) => {
            if (!errCreate) {
              // Update the user for new token
              // Update tokens array in userData
              const userTokens = typeof (userData.tokens) !== 'undefined'
                && userData.tokens instanceof (Array)
                ? userData.tokens
                : [];
              userTokens.push(tokenObject.id);
              userData.tokens = userTokens;
              // Store the new token in the user
              _data.update('users', email, userData, (errUpdate) => {
                if (!errUpdate) {
                  // Return new tokenObject
                  callback(codes.OK, tokenObject);
                } else {
                  callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Internal server error' });
                }
              });
            } else {
              callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not create the new token' });
            }
          });
        } else {
          callback(codes.FORBIDDEN, { Error: 'Password is incorrect' });
        }
      } else {
        callback(codes.BAD_REQUEST, { Error: 'Could not find the specified user' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Tokens - get
// Required data : id
// Optional data : none
handlers._tokens.get = (data, callback) => {
  // Check that the id is valid
  const id = typeof (data.queryStringObject.id) === 'string'
    && data.queryStringObject.id.trim().length === 20
    ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Lookup the token
    _data.read('tokens', id, (errRead, tokenData) => {
      if (!errRead && tokenData) {
        callback(codes.OK, tokenData);
      } else {
        callback(codes.BAD_REQUEST);
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Tokens - put
// Required fields : id, extend
// Optional data : none
handlers._tokens.put = (data, callback) => {
  const id = typeof (data.payload.id) === 'string'
    && data.payload.id.trim().length === 20
    ? data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend;
  if (id && extend) {
    // Lookup token
    _data.read('tokens', id, (errRead, tokenData) => {
      if (!errRead && tokenData) {
        // Check to the make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the experation an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Store the new updates
          _data.update('tokens', id, tokenData, (errUpdate) => {
            if (!errUpdate) {
              callback(codes.OK);
            } else {
              callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not update token\'s experataion' });
            }
          });
        } else {
          callback(codes.BAD_REQUEST, { Error: 'The token has already expired, and cannot be extended' });
        }
      } else {
        callback(codes.BAD_REQUEST, { Error: 'Specified token does not exit' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field(s) or field(s) are invalid' });
  }
};

// Tokens - delete
// Required field : id
// Optional field : none
handlers._tokens.delete = (data, callback) => {
  const email = typeof (data.payload.email) === 'string'
    && data.payload.email.trim().length > 0
    && helpers.testEmail(data.payload.email)
    ? data.payload.email.trim() : false;
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token.trim() : false;
  if (email && token) {
    // Lookup the user who mathes that email
    _data.read('users', email, (errRead, userData) => {
      if (!errRead && userData) {
        // Check is there id in the user
        const userTokens = userData.tokens;
        if (typeof (userTokens) === 'object' && userTokens instanceof (Array)) {
          const tokenPosition = userTokens.indexOf(token);
          if (tokenPosition > -1) {
            // Remove the token id from the user
            userTokens.splice(tokenPosition, 1);
            _data.update('users', email, userData, (errUpdate) => {
              if (!errUpdate) {
                // Lookup the token
                _data.read('tokens', token, (errReadToken, dataToken) => {
                  if (!errReadToken && dataToken) {
                    _data.delete('tokens', token, (errDelete) => {
                      if (!errDelete) {
                        callback(codes.OK);
                      } else {
                        callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not delete the specified token' });
                      }
                    });
                  } else {
                    callback(codes.BAD_REQUEST, { Error: 'Could not find the specified token' });
                  }
                });
              } else {
                callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Internal server error' });
              }
            });
          } else {
            callback(codes.BAD_REQUEST, { Error: 'Token with the id doesn\'t exist in the user' });
          }
        } else {
          callback(codes.BAD_REQUEST, { Error: 'The token doesn\'t exist' });
        }
      } else {
        callback(codes.BAD_REQUEST, { Error: 'The user doesn\'t exist' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, email, callback) => {
  // Lookup the token
  _data.read('tokens', id, (errRead, tokenData) => {
    if (!errRead && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.email === email && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Handlers for menu
handlers.menu = (data, callback) => {
  const acceptableMethods = ['get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._menu[data.method](data, callback);
  } else {
    callback(codes.NOT_ALLOWED);
  }
};

// Comtainer for the menu submethods
handlers._menu = {};

// Menu - get (list all kind of pizzas)
// Required field - email, token
// Optional field - none
handlers._menu.get = (data, callback) => {
  // Check that the email is valid
  const email = typeof (data.queryStringObject.email) === 'string'
    && data.queryStringObject.email.trim().length > 0
    && helpers.testEmail(data.queryStringObject.email)
    ? data.queryStringObject.email.trim() : false;
  // Get the token from the headers
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token : false;
  if (email && token) {
    // Verify that the given token is valid for the email
    _data.read('users', email, (errRead, userData) => {
      if (!errRead && userData) {
        if (typeof (userData.tokens) === 'object' && userData.tokens.indexOf(token) > -1) {
          handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
            if (tokenIsValid) {
              // Lookup the user
              callback(codes.OK, _menuItems);
            } else {
              callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
            }
          });
        } else {
          callback(codes.BAD_REQUEST, { Error: 'The token is invalid' });
        }
      } else {
        callback(codes.BAD_REQUEST, { Error: 'User with the email doesn\'t exist' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Handlers to add, update, list and remove pizza from basket
handlers.cart = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._cart[data.method](data, callback);
  } else {
    callback(codes.NOT_ALLOWED);
  }
};

// Container for the tokens submethods
handlers._cart = {};

// Basket - post. Add kind of pizza from menu and quantity into the user's shopping cart
// Required field - email, id (token) and order object contains {pizzaName:quantity}
handlers._cart.post = (data, callback) => {
  // Check that the email is valid
  const email = typeof (data.payload.email) === 'string'
    && data.payload.email.trim().length > 0
    && helpers.testEmail(data.payload.email)
    ? data.payload.email.trim() : false;
  const orderObject = typeof (data.payload.order) === 'object'
    && Object.keys(data.payload.order).length > 0
    ? data.payload.order : false;
  console.log('orderObject=', orderObject);
  // Get the token from the headers
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token : false;
  if (email && orderObject && token) {
    // Verify that the given token is valid for the email
    _data.read('users', email, (errRead, userData) => {
      if (!errRead && userData) {
        if (typeof (userData.tokens) === 'object' && userData.tokens.indexOf(data.headers.token) > -1) {
          handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
            if (tokenIsValid) {
              // Validate order
              let isOrderCorrect = true;
              Object.keys(orderObject).forEach((pizza) => {
                if (typeof (pizza) !== 'string'
                  || !(pizza in _menuItems)
                  || typeof (orderObject[pizza]) !== 'number') {
                  isOrderCorrect = false;
                }
              });
              if (isOrderCorrect) {
                // Calculate amount
                const orderObjectWithAmount = {};
                orderObjectWithAmount.order = orderObject;
                orderObjectWithAmount.amount = handlers._cart.calcAmount(orderObject, _menuItems);

                // Store the order to the user's shopping cart
                _data.update('carts', `${email}_cart`, orderObjectWithAmount, (errUpdate) => {
                  if (!errUpdate) {
                    callback(codes.OK, orderObjectWithAmount);
                  } else {
                    callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not put order into the shopping cart' });
                  }
                });
              } else {
                callback(codes.BAD_REQUEST, { Error: 'Order in the shopping cart is incorrect' });
              }
            } else {
              callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
            }
          });
        } else {
          callback(codes.FORBIDDEN, { Error: 'The token is invalid' });
        }
      } else {
        callback(codes.BAD_REQUEST, { Error: 'User with the email doesn\'t exist' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Basket - get. Show menu from the user's shopping cart
// Required field - email, token
// Return codes and object order: {pizzaName: quantity}, amount: amount of all items quantity * price from menu
/* Example:
{
    "order": {
        "Margherita": 1,
        "Marinara": 2
    },
    "amount": 190
}
*/
handlers._cart.get = (data, callback) => {
  // Check that the email is valid
  const email = typeof (data.queryStringObject.email) === 'string'
    && data.queryStringObject.email.trim().length > 0
    && helpers.testEmail(data.queryStringObject.email)
    ? data.queryStringObject.email.trim() : false;
  // Get the token from the headers
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token : false;
  if (email && token) {
    // Verify that the given token is valid for the email
    _data.read('users', email, (errRead, userData) => {
      if (!errRead && userData) {
        if (typeof (userData.tokens) === 'object' && userData.tokens.indexOf(token) > -1) {
          handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
            if (tokenIsValid) {
              _data.read('carts', `${email}_cart`, (errCart, orderObject) => {
                if (!errCart && orderObject) {
                  // Add price
                  const orderObjectWithPrice = orderObject;
                  // Price
                  orderObjectWithPrice.price = {};
                  // Img
                  orderObjectWithPrice.image = {};
                  Object.keys(orderObject.order).forEach((item) => {
                    orderObjectWithPrice.price[item] = _menuItems[item].price;
                    orderObjectWithPrice.image[item] = _menuItems[item].foto;
                  });
                  callback(codes.OK, orderObjectWithPrice);
                } else {
                  callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could read menu from the shopping cart' });
                }
              });
            } else {
              callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
            }
          });
        } else {
          callback(codes.FORBIDDEN, { Error: 'The token is invalid' });
        }
      } else {
        callback(codes.BAD_REQUEST, { Error: 'User with the email doesn\'t exist' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Basket - delete. Delete all menu items from the user's shopping cart
// Required field - email, id (token)
handlers._cart.delete = (data, callback) => {
  // Check that the email is valid
  const email = typeof (data.queryStringObject.email) === 'string'
    && data.queryStringObject.email.trim().length > 0
    && helpers.testEmail(data.queryStringObject.email)
    ? data.queryStringObject.email.trim() : false;
  // Get the token from the headers
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token : false;
  if (email && token) {
    // Verify that the given token is valid for the email
    _data.read('users', email, (errRead, userData) => {
      if (!errRead && userData) {
        if (typeof (userData.tokens) === 'object' && userData.tokens.indexOf(token) > -1) {
          handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
            if (tokenIsValid) {
              _data.read('carts', `${email}_cart`, (errCart, orderObject) => {
                if (!errCart && orderObject) {
                  _data.delete('carts', `${email}_cart`, (errDelete) => {
                    if (!errDelete) {
                      callback(codes.OK);
                    } else {
                      callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Couldn\'t delete items from the shopping cart' });
                    }
                  });
                } else {
                  callback(codes.ACCEPTED, { Error: 'The shopping cart is already empty' });
                }
              });
            } else {
              callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
            }
          });
        } else {
          callback(codes.FORBIDDEN, { Error: 'The token is invalid' });
        }
      } else {
        callback(codes.BAD_REQUEST, { Error: 'User with the email doesn\'t exist' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Calculate amout for selected menu items
handlers._cart.calcAmount = (orderObject, menuItems) => {
  let amount = 0;
  Object.keys(orderObject).forEach((element) => {
    amount += orderObject[element] * menuItems[element].price;
  });
  return amount;
};

// Handlers to add, list and remove orders for the users
handlers.order = (data, callback) => {
  const acceptableMethods = ['post', 'put', 'get', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._order[data.method](data, callback);
  } else {
    callback(codes.NOT_ALLOWED);
  }
};

// Container for the tokens submethods
handlers._order = {};

// Order post - create order using a data from the shopping cart and then delete the shopping cart
// Required field - email, token
// And payment object
// payment: {cardNumber, expMonth, expYear, cvc}
// Optional - none
// @TODO check payment and send email confirmation to a user
handlers._order.post = (data, callback) => {
  // Check that the email is valid
  const email = typeof (data.payload.email) === 'string'
    && data.payload.email.trim().length > 0
    && helpers.testEmail(data.payload.email)
    ? data.payload.email.trim() : false;
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token.trim() : false;
  const payment = typeof (data.payload.payment) === 'object'
    ? data.payload.payment : false;
  // Check email and token
  if (email && token && payment) {
    // Check user payment card
    const cardNumber = typeof (data.payload.payment.cardNumber) === 'string'
      && data.payload.payment.cardNumber.replace(' ', '').trim().length === 16
      ? data.payload.payment.cardNumber.trim() : false;
    const expMonth = typeof (data.payload.payment.expMonth) === 'string'
      && data.payload.payment.expMonth.trim().length === 2
      ? data.payload.payment.expMonth.trim() : false;
    const expYear = typeof (data.payload.payment.expYear) === 'string'
      && data.payload.payment.expYear.trim().length === 4
      ? data.payload.payment.expYear.trim() : false;
    const cvc = typeof (data.payload.payment.cvc) === 'string'
      && data.payload.payment.cvc.trim().length === 3
      ? data.payload.payment.cvc.trim() : false;

    if (cardNumber && expMonth && expYear && cvc) {
      // Verify that the given token is valid for the email
      _data.read('users', email, (errRead, userData) => {
        if (!errRead && userData) {
          if (typeof (userData.tokens) === 'object' && userData.tokens.indexOf(token) > -1) {
            handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
              if (tokenIsValid) {
                // Get data from the shopping cart
                _data.read('carts', `${email}_cart`, (errCart, dataCart) => {
                  if (!errCart && dataCart) {
                    // Save order
                    const orderObject = {};
                    orderObject.cart = dataCart;
                    orderObject.date = Date.now().toString();
                    orderObject.status = 'active';
                    orderObject.payStatus = 'unpaid';
                    _data.create('orders', `${email}_${orderObject.date}`, orderObject, (errOrder) => {
                      if (!errOrder) {
                        // Delete the shopping cart
                        _data.delete('carts', `${email}_cart`, (errDeleteCart) => {
                          if (!errDeleteCart) {
                            const card = {
                              'card[number]': cardNumber,
                              'card[exp_month]': expMonth,
                              'card[exp_year]': expYear,
                              'card[cvc]': cvc,
                            };
                            const charge = {
                              currency: 'usd',
                              description: `Charge for order ${orderObject.date}`,
                            };
                            helpers.payForOrder(card, charge, dataCart.amount, (res) => {
                              if (res === codes.OK) {
                                orderObject.payStatus = 'paid';
                                _data.update('orders', `${email}_${orderObject.date}`, orderObject, (errOrderUpdate) => {
                                  if (!errOrderUpdate) {
                                    const emailTest = 'sanchonn@gmail.com'; // Prevent to email real user
                                    const emailData = {
                                      from: 'Pizza <pizzaOrder@sandboxe77e4bd9e6144759b2a9682491850ea6.mailgun.org>',
                                      to: emailTest, // @TODO change to email when production
                                      subject: `Your order ${orderObject.date} accepted`,
                                      text: helpers.getReceipt(orderObject.cart),
                                    };
                                    helpers.sendEmailViaMailgun(emailData, (emailErr) => {
                                      console.log(emailErr);
                                      if (emailErr === codes.OK) {
                                        callback(codes.OK);
                                      } else {
                                        callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not send email to the user' });
                                      }
                                    });
                                  } else {
                                    callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not update payment status of order' });
                                  }
                                });
                              } else {
                                console.log(res);
                                callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not create payment' });
                              }
                            });
                          } else {
                            callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not clear the shopping cart' });
                          }
                        });
                      } else {
                        callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not create order' });
                      }
                    });
                  } else {
                    callback(codes.BAD_REQUEST, { Error: 'There is no order in the shopping cart' });
                  }
                });
              } else {
                callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
              }
            });
          } else {
            callback(codes.BAD_REQUEST, { Error: 'The token is invalid' });
          }
        } else {
          callback(codes.BAD_REQUEST, { Error: 'User with the email doesn\'t exist' });
        }
      });
    } else {
      callback(codes.BAD_REQUEST, { Error: 'Your payment card\'s data is incorrect' });
    }
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required fields' });
  }
};

// Order put - update order for the user
// Required fields - email, token, status, date for identity order
// status can be ['active', 'done', 'cancelled']
// payment can be ['paid','unpaid']
handlers._order.put = (data, callback) => {
  // Check for the required field
  const email = typeof (data.payload.email) === 'string'
    && data.payload.email.trim().length > 0
    && helpers.testEmail(data.payload.email)
    ? data.payload.email.trim() : false;
  const paymentStatus = typeof (data.payload.paymentStatus) === 'string'
    && data.payload.paymentStatus.trim().length > 0
    && ['paid', 'unpaid'].indexOf(data.payload.paymentStatus) > -1
    ? data.payload.paymentStatus.trim() : false;
  const status = typeof (data.payload.status) === 'string'
    && data.payload.status.trim().length > 0
    && ['active', 'done', 'cancelled'].indexOf(data.payload.status) > -1
    ? data.payload.status.trim() : false;
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token : false;
  const date = typeof (data.payload.date) === 'string'
    && data.payload.date.trim().length > 0
    ? data.payload.date : false;
  // Error if the required fields are invalid
  if (email && status && date && token) {
    // Verify that the given token is valid for the email
    handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        // Get order for the user
        _data.read('orders', `${email}_${date}`, (errDataOrder, dataOrder) => {
          if (!errDataOrder && dataOrder) {
            const dataOrderUpdated = dataOrder;
            dataOrderUpdated.paymentStatus = paymentStatus;
            dataOrderUpdated.status = status;
            _data.update('orders', `${email}_${date}`, dataOrderUpdated, (errUpdate) => {
              if (!errUpdate) {
                callback(codes.OK);
              } else {
                callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not update order' });
              }
            });
          } else {
            callback(codes.BAD_REQUEST, { Error: 'Could not find the order' });
          }
        });
      } else {
        callback(codes.FORBIDDEN, { Error: 'Missing required token in header, or token is invalid' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required field' });
  }
};

// Order get - get all orders for the user
// Required fields - email. token
// Optional fields - none
handlers._order.get = (data, callback) => {
  // Check for the required field
  const email = typeof (data.queryStringObject.email) === 'string'
    && data.queryStringObject.email.trim().length > 0
    && helpers.testEmail(data.queryStringObject.email)
    ? data.queryStringObject.email.trim() : false;
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token : false;
  if (email && token) {
    // Get all orders in the folder 'orders'
    const listOrders = [];
    // Read order values and put it orders array
    _data.listMask('orders', email, (errList, list) => {
      let i = 0;
      if (!errList && list.length > 0) {
        list.forEach((item) => {
          _data.read('orders', item, (errOrder, dataOrder) => {
            if (!errOrder && dataOrder) {
              // Add price
              const orderObjectWithPrice = dataOrder;
              // Price
              orderObjectWithPrice.price = {};
              // Img
              orderObjectWithPrice.image = {};
              Object.keys(dataOrder.cart.order).forEach((itemOrder) => {
                orderObjectWithPrice.price[itemOrder] = _menuItems[itemOrder].price;
                orderObjectWithPrice.image[itemOrder] = _menuItems[itemOrder].foto;
              });
              listOrders.push(orderObjectWithPrice);
              i += 1;
              if (i === list.length && list.length > 0) {
                callback(codes.OK, listOrders);
              }
            } else {
              callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not read some orders for the user' });
            }
          });
        });
      } else {
        callback(codes.NOT_FOUND, { Error: 'User has no any orders' });
      }
    });
  } else {
    callback(codes.NOT_FOUND, { Error: 'There is no any orders on the server' });
  }
};


// Order delete - cancel order
// Required fields - email, token, date of order
// @TODO - send email about canceling order
handlers._order.delete = (data, callback) => {
  // Check for the required field
  const email = typeof (data.queryStringObject.email) === 'string'
    && data.queryStringObject.email.trim().length > 0
    && helpers.testEmail(data.queryStringObject.email)
    ? data.queryStringObject.email.trim() : false;
  const date = typeof (data.queryStringObject.date) === 'string'
    ? data.queryStringObject.date : false;
  const token = typeof (data.headers.token) === 'string'
    && data.headers.token.trim().length === 20
    ? data.headers.token : false;
  if (email && token && date) {
    // Get all orders in the folder 'orders'
    _data.read('orders', `${email}_${date}`, (errRead, dataOrder) => {
      if (!errRead && dataOrder) {
        const dataOrderUpdated = dataOrder;
        dataOrderUpdated.status = 'cancelled';
        _data.update('orders', `${email}_${date}`, dataOrderUpdated, (errList) => {
          if (!errList) {
            callback(codes.OK);
          } else {
            callback(codes.INTERNAL_SERVER_ERROR, { Error: 'Could not cancel the orders' });
          }
        });
      } else {
        callback(codes.BAD_REQUEST, { Error: 'Order does not exist' });
      }
    });
  } else {
    callback(codes.BAD_REQUEST, { Error: 'Missing required fields' });
  }
};


// Ping service handler
handlers.ping = (data, callback) => {
  // Service ping - returns OK
  callback(codes.OK, { service: 'ping' });
};

// Not found handler
handlers.notFound = (data, callback) => {
  // 404 'Not Found' status code
  callback(codes.NOT_FOUND);
};

// Export the module
module.exports = handlers;
