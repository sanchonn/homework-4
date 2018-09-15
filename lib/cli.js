/**
 * CLI-related tasks
 *
 */

// Dependencies
const readline = require('readline');
const util = require('util');
const events = require('events');
const os = require('os');
const v8 = require('v8');
const _data = require('./data');
const _menu = require('./menu');

const debug = util.debuglog('cli');

class _events extends events { }
const e = new _events();


// Instantiate the CLI module object
const cli = {};

// Input handlers
e.on('man', () => {
  cli.responders.help();
});

// Create a vertical space
cli.verticalSpace = (lines) => {
  lines = typeof (lines) === 'number' && lines > 0 ? lines : 1;
  for (let i = 0; i < lines; i += 1) {
    console.log('');
  }
};

// Create a horizontal line across the screen
cli.horizontalLine = () => {
  // Get the available screen size
  const width = process.stdout.columns;
  let line = '';
  for (let i = 0; i < width; i += 1) {
    line += '-';
  }
  console.log(line);
};

// Create centered text on the screen
cli.centered = (str) => {
  str = typeof (str) === 'string' && str.trim().length > 0 ? str : '';
  // Get the available screen size
  const width = process.stdout.columns;
  // Calculate the left padding there should be
  const leftPadding = Math.floor((width - str.length) / 2);
  // Put the left padded space before the string itse
  let line = '';
  for (let i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  line += str;
  console.log(line);
};


e.on('help', () => {
  cli.responders.help();
});

e.on('exit', () => {
  cli.responders.exit();
});

e.on('list menu', () => {
  cli.responders.listMenu();
});

e.on('list orders', (str) => {
  cli.responders.listOrders(str);
});

e.on('more order info', (str) => {
  cli.responders.moreOrderInfo(str);
});

e.on('list users', (str) => {
  cli.responders.listUsers(str);
});

e.on('more user info', (str) => {
  cli.responders.moreUserInfo(str);
});

e.on('stats', () => {
  cli.responders.stats();
});

// Responders object
cli.responders = {};

// Help / man
cli.responders.help = () => {
  const commands = {
    'exit': 'Kill the CLI (and the rest of the application)',
    'man': 'Show this help page',
    'help': 'Alias of the "man" command',
    'list menu': 'View all the current menu items',
    'list orders [--recent]': 'View all the orders in the system (--recent to the recent orders placed in the last 24 hours)',
    'more order info --{orderId}': 'Lookup the details of a specific order by order ID',
    'list users [--recent]': 'View all the users, (--recent to known who have signed up in the last 24 hours)',
    'more user info --{email}': 'Lookup the details of a specific user by email address',
    'stats': 'View the server stats',
  };
  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectevily
  Object.keys(commands).forEach((key) => {
    const value = commands[key];
    let line = `\x1b[33m${key}\x1b[0m`;
    const padding = 60 - line.length;
    for (let i = 0; i < padding; i += 1) {
      line += ' ';
    }
    line += value;
    console.log(line);
    cli.verticalSpace();
  });
  cli.verticalSpace(1);
  // End with another horizontalLine
  cli.horizontalLine();
};

// Exit
cli.responders.exit = () => {
  process.exit(0);
};

// Stats
cli.responders.stats = () => {
  // Compile an object of stats
  const stats = {
    'Load Average': os.loadavg().join(' '),
    'CPU Count': os.cpus().length,
    'Free Memory': os.freemem(),
    'Correct Malloced Memory': v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)': Math.round(v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size * 100),
    'Available Heap Allocated (%)': Math.round(v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().heap_size_limit * 100),
    'Uptime': `${os.uptime()} Seconds`,
  };

  // Create a header for the stats
  cli.horizontalLine();
  cli.centered('SYSTEM STATISTICS');
  cli.horizontalLine();
  cli.verticalSpace(2);
  // Log out each state
  Object.keys(stats).forEach((key) => {
    const value = stats[key];
    let line = `\x1b[33m${key}\x1b[0m`;
    const padding = 60 - line.length;
    for (let i = 0; i < padding; i += 1) {
      line += ' ';
    }
    line += value;
    console.log(line);
    cli.verticalSpace();
  });
  cli.verticalSpace(1);
  // End with another horizontalLine
  cli.horizontalLine();
};

// List users
cli.responders.listUsers = (str) => {
  // Recent flag. If true - show only users who signed up last 24 hours
  const recent = typeof (str) === 'string' && str.indexOf('--recent') > -1;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  _data.listWithBirtTime('users', (err, userIds) => {
    if (!err && userIds.length > 0) {
      cli.verticalSpace();
      userIds.forEach((userId) => {
        _data.read('users', userId.fileName, (err, userData) => {
          if (!err && userData) {
            if (recent && userId.birthtime < yesterday) {
              // Pass the cycle iteration
            } else {
              let line = `SignUp date: ${userId.birthtime} Name: ${userData.name} Email: ${userData.email} Address: ${userData.address} Orders: `;
              // Get number of orders for the user
              _data.listMask('orders', userId.fileName, (err, orders) => {
                if (!err && orders.length && orders.length > 0) {
                  line += orders.length;
                } else {
                  line += 'no';
                }
                console.log(line);
              });
            }
          }
        });
      });
      cli.verticalSpace();
    } else {
      console.log('There is no any users.');
      cli.verticalSpace();
    }
  });
};

/**
 * More user info
 * @param {str} string user email
 * @return none
 * @TODO show list user's orders
 */
cli.responders.moreUserInfo = (str) => {
  // Get the id from the string
  const arr = str.split('--');
  const email = typeof (arr[1]) === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if (email) {
    // Lookup the user
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        // Remove the hashed password
        delete userData.hashedPassword;
        // Remove tokens list
        delete userData.tokens;
        // Print the JSON with text highlighting
        cli.verticalSpace();
        let line = `Name: ${userData.name} email: ${userData.email} address: ${userData.address} `;
        console.log(line);
        // Show list of orders
        _data.listMask('orders', email, (err, orders) => {
          if (!err && orders.length && orders.length > 0) {
            let length = orders.length;
            orders.forEach((orderId) => {
              _data.read('orders', orderId, (err, orderData) => {
                const createDate = new Date(parseInt(orderData.date));
                const line = `OrderId#${orderId} Create: ${createDate.toLocaleString()} Status: ${orderData.status} PayStatus: ${orderData.payStatus} Amount: ${orderData.cart.amount / 100}$`;
                // Show about order
                console.log(line);
                // Show list of order items
                console.log(orderData.cart.order);  
                cli.verticalSpace();
              });
            });
          } else {
            console.log('No any orders');
          }
          cli.verticalSpace();
        });
      } else {
        console.log('Could not read user info or user is not exist');
      }
    });
  }
};

/**
 * List orders
 * @param {str} string If str is '--recent' show only orders created last 24 hous
 * @return {none}
 *
 */
cli.responders.listOrders = (str) => {
  // Recent flag. If true - show only users who signed up last 24 hours
  const recent = typeof (str) === 'string' && str.indexOf('--recent') > -1;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  _data.list('orders', (err, ordersIds) => {
    if (!err && ordersIds.length > 0) {
      cli.verticalSpace();
      ordersIds.forEach((orderId) => {
        _data.read('orders', orderId, (err, orderData) => {
          if (!err && orderData) {
            const createDate = new Date(parseInt(orderData.date));
            if (recent && createDate < yesterday) {
              // Pass the cycle iteration
            } else {
              let line = `OrderId#${orderId} User: ${orderId.split('_')[0]} Create: ${createDate.toLocaleString()} Status: ${orderData.status} PayStatus: ${orderData.payStatus} Amount: ${orderData.cart.amount / 100}$`;
              console.log(line);
            }
          }
        });
      });
      cli.verticalSpace();
    } else {
      console.log('There is no any users.');
      cli.verticalSpace();
    }
  });
};

/**
 * More order info
 * @param {str} string orderId
 * @return none
 *
 */
cli.responders.moreOrderInfo = (str) => {
  // Get the id from the string
  const arr = str.split('--');
  const orderId = typeof (arr[1]) === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if (orderId) {
    // Lookup the user
    _data.read('orders', orderId, (err, orderData) => {
      if (!err && orderData) {
        // Print the JSON with text highlighting
        cli.verticalSpace();
        const createDate = new Date(parseInt(orderData.date));
        let line = `OrderId#${orderId} User: ${orderId.split('_')[0]} Create: ${createDate.toLocaleString()} Status: ${orderData.status} PayStatus: ${orderData.payStatus} Amount: ${orderData.cart.amount / 100}$`;
        // Show about order
        console.log(line);
        // Show list of order items
        console.log(orderData.cart.order);
        cli.verticalSpace();
      } else {
        console.log('Could not read user info');
      }
    });
  }
};

/**
 * List menu
 *
 */
cli.responders.listMenu = () => {
  cli.verticalSpace();
  console.dir(_menu, { colors: true });
  cli.verticalSpace();
};

// Input processor
cli.processInput = (str) => {
  str = typeof (str) === 'string' && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something. Otherwise ignore
  if (str) {
    // Codify the unique strings that identify the unique questions allowed to be asked
    const uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list orders',
      'more order info',
      'list menu',
    ];
    // Go through the possible inputs, emit an event when a match is found
    let matchFound = false;
    let counter = 0;
    uniqueInputs.some((input) => {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit the event matching the unique input, and include the full string given by user
        e.emit(input, str);
        return true;
      }
    });
    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log('Sorry, try again');
    }
  }
};

// Init script
cli.init = () => {
  // Send the start message to the console, in dark blue
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

  // Start the interface
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
  });
  // Create an initial prompt
  _interface.prompt();
  // Handle each line of input separately
  _interface.on('line', (str) => {
    // Send to the input processor
    cli.processInput(str);

    // Re-initalize the prompt afterwards
    _interface.prompt();
  });
  // If the user stops the CLI, kill the associated process
  _interface.on('close', () => {
    process.exit(0);
  });
};


// Export the module
module.exports = cli;
