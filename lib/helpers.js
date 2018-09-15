/**
 * Helpers for varios tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const util = require('util');
const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Debug to log
const debug = util.debuglog('debug');

// Container for all the helpers

const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
  if (typeof (str) === 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  }
  return false;
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    debug(err);
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (len) => {
  const strLength = typeof (len) === 'number' && len > 0 ? len : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (let i = 0; i < strLength; i += 1) {
      // Get a random character from the possibleCharacters string
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()
        * possibleCharacters.length));
      // Append this characters to the final string
      str += randomCharacter;
    }

    // Return the final string
    return str;
  }
  return false;
};

// Test email validation
helpers.testEmail = (email) => {
  const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
  return reg.test(email);
};

// Pay for order with Stripe service
helpers.payForOrder = (card, charge, amount, callback) => {
  const cardData = card;
  const chargeData = charge;
  //const dataForm = querystring.stringify(data);

  const optionsToken = {
    hostname: 'api.stripe.com',
    path: '/v1/tokens',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(querystring.stringify(cardData)),
      Authorization: `Bearer ${config.stripe.publicKey}`,
    },
  };
  const optionsCharge = {
    hostname: 'api.stripe.com',
    path: '/v1/charges',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${config.stripe.privateKey}`,
    },
  };

  const req = https.request(optionsToken, (resToken) => {
    resToken.on('data', (dataToken) => {
      try {
        const dataTokenJson = JSON.parse(dataToken);
        chargeData.source = dataTokenJson.id;
        chargeData.amount = amount;
        optionsCharge.headers['Content-Length'] = Buffer.byteLength(querystring.stringify(chargeData));
        // Charge
        const reqCharge = https.request(optionsCharge, (resCharge) => {
          callback(resCharge.statusCode);
        });
        reqCharge.write(querystring.stringify(chargeData));
        reqCharge.end();
      } catch (e) {
        console(e);
        callback(false);
      }
    });
  });
  req.write(querystring.stringify(cardData));
  req.end();
};

// Send email with mailgun
helpers.sendEmailViaMailgun = (data, callback) => {
  const dataForm = querystring.stringify(data);
  const auth = `api:${config.mailgun.apiKey}`;
  const optionsMailgun = {
    hostname: 'api.mailgun.net',
    port: 443,
    method: 'POST',
    path: `/v3/${config.mailgun.domain}/messages`,
    protocol: 'https:',
    headers: {
      Authorization: `Basic ${Buffer.from(auth).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(dataForm),
    },
  };

  const req = https.request(optionsMailgun, (res) => {
    res.on('data', (d) => {
      debug(res.statusCode);
      callback(res.statusCode);
    });
  });
  req.on('error', (e) => {
    console.log(e);
    debug(e);
    callback(false);
  });
  req.write(dataForm);
  req.end();
};

// Return receipt
helpers.getReceipt = (orderObject) => {
  let receipt = '';
  const items = Object.keys(orderObject.order);
  items.forEach((item) => {
    receipt += `${item}-${orderObject.order[item]} pcs \n`;
  });
  receipt += `Amount ${orderObject.amount / 100} dollars`;
  return receipt;
};

// Get the string content of a template
helpers.getTemplate = (templateName, data, callback) => {
  templateName = typeof (templateName) === 'string' && templateName.length > 0 ? templateName : false;
  data = typeof (data) === 'object' && data !== null ? data : {};

  if (templateName) {
    const templatesDir = path.join(__dirname, '../templates/');
    fs.readFile(`${templatesDir}${templateName}.html`, 'utf8', (err, str) => {
      if (!err && str && str.length > 0) {
        // Do interpolation on the string
        const finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};

// Add the universal header and footer to a string,
// and pass provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
  str = typeof (str) === 'string' && str.length > 0 ? str : '';
  data = typeof (data) === 'object' && data !== null ? data : {};

  // Get the header
  helpers.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, (errFooter, footerString) => {
        if (!errFooter && footerString) {
          // Add them all together
          const fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
  // Get the footer
};

// Take a given string and a data object and find/replace tje leyes with it
helpers.interpolate = (str, data) => {
  let strInterpolate = typeof (str) === 'string' && str.length > 0 ? str : '';
  const dataInterpolate = typeof (data) === 'object' && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepanding their key name with "globals"
  Object.keys(config.templateGlobals).forEach((keyName) => {
    dataInterpolate[`global.${keyName}`] = config.templateGlobals[keyName];
  });
  // For each key in the data object,
  // insert its value into the string at the corresponding placeholder
  Object.keys(dataInterpolate).forEach((key) => {
    if (typeof (dataInterpolate[key]) === 'string') {
      const replace = dataInterpolate[key];
      const find = `{${key}}`;
      strInterpolate = strInterpolate.replace(find, replace);
    }
  });
  return strInterpolate;
};

// Get the contents of a static (public) assets
helpers.getStaticAsset = (fileName, callback) => {
  fileName = typeof (fileName) === 'string' && fileName.length > 0 ? fileName : false;
  if (fileName) {
    const publicDir = path.join(__dirname, '/../public/');
    fs.readFile(publicDir + fileName, (err, data) => {
      if (!err && data) {
        callback(false, data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid filename was not specified');
  }
};

// Export the module
module.exports = helpers;
