/**
* The API for a pizza-delivery company
* PART 1
* 1. New users can be created, their information can be edited, and they can be deleted.
* We should store their name, email address, and street address.
* 2. Users can log in and log out by creating or destroying a token.
* 3. When a user is logged in, they should be able to GET all the possible menu items
* (these items can be hardcoded into the system).
* 4. A logged-in user should be able to fill a shopping cart with menu items
* 5. A logged-in user should be able to create an order.
* You should integrate with the Sandbox of Stripe.com to accept their payment.
* 6. When an order is placed, you should email the user a receipt.
* You should integrate with the sandbox of Mailgun.com for this.
* PART 2
* 1. Signup on the site
* 2. View all the items available to order
* 3. Fill up a shopping cart
* 4. Place an order (with fake credit card credentials), and receive an email receipt
* PART 3
*
* It is time to build the Admin CLI for the pizza-delivery app you built in the previous assignments.
* Please build a CLI interface that would allow the manager of the pizza place to:
* 1. View all the current menu items
* 2. View all the recent orders in the system (orders placed in the last 24 hours)
* 3. Lookup the details of a specific order by order ID
* 4. View all the users who have signed up in the last 24 hours
* 5. Lookup the details of a specific user by email address
*/

// Dependencies
const server = require('./lib/server');
const cli = require('./lib/cli');

// Container for the App
const app = {};

// Init function
app.init = () => {
  // Start the server
  server.init();
  // Start the cli, but make sure it starts last
  setTimeout(() => {
    cli.init();
  }, 50);
};

// Execute
app.init();

// Export the module
module.exports = app;
