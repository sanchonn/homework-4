/*
 * Frontend Logic for application
 *
 */

// Container for the frontend application
const app = {};

// Config
app.config = {
  sessionToken: false,
};

// Cart
app.cart = {
  order: {},
};

// AJAX Client (for the restful API)
app.client = {};

// Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
  // Set defaults
  headers = typeof (headers) === 'object' && headers !== null ? headers : {};
  path = typeof (path) === 'string' ? path : '/';
  method = typeof (method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof (queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof (payload) === 'object' && payload !== null ? payload : {};
  callback = typeof (callback) === 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  let requestUrl = `${path}?`;
  let counter = 0;
  Object.keys(queryStringObject).forEach((queryKey) => {
    counter += 1;
    // If at least one query string parameter has already been added, prepand new one with ampersand
    if (counter > 1) {
      requestUrl += '&';
    }
    // Add the key and value
    requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
  });

  // Form the http request as a JSON type
  const xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  // For each header send, add it to the request
  Object.keys(headers).forEach((headerKey) => {
    xhr.setRequestHeader(headerKey, headers[headerKey]);
  });

  // If there is a current session token set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const statusCode = xhr.status;
      const responseReturned = xhr.responseText;

      // Callback if requested
      if (callback) {
        try {
          const parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }
      }
    }
  };

  // Send the payload as JSON
  const payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
};

// Bind the logout button
app.bindLogoutButton = () => {
  const logoutButton = document.getElementById('logoutButton');
  logoutButton.addEventListener('click', (e) => {
    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.logUserOut();
  });
};

// Log the user out then redirect them
app.logUserOut = () => {
  // Get the current token id
  const tokenId = typeof (app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;

  // Send the current token to the tokens endpoint to delete it
  const queryStringObject = {
    id: tokenId
  };
  app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
    // Set the app.config token as false
    app.setSessionToken(false);
    localStorage.setItem('order', false);
    // Send the user to the logged out page
    window.location = '/session/deleted';
  });
};

// Load data on the page
app.loadDataOnPage = () => {
  // Get the current page from the body class
  const bodyClasses = document.querySelector('body').classList;
  const primaryClass = typeof (bodyClasses[0]) === 'string' ? bodyClasses[0] : false;
  // Show cart
  app.helperLoadCart();
  // Logic for account settings page
  if (primaryClass === 'menuList') {
    app.loadMenuListPage();
  }
  if (primaryClass === 'cartList') {
    app.loadCartListPage();
  }
  if (primaryClass === 'ordersList') {
    app.loadOrdersListPage();
  }
  if (primaryClass === 'ordersDetail') {
    app.loadOrdersDetailPage();
  }
  if (primaryClass === 'ordersPayment') {
    app.loadOrdersPaymentPage();
  }
  if (primaryClass === 'accountEdit') {
    app.loadAccountEditPage();
  }
};

// Load the menuList
app.loadMenuListPage = () => {
  // Get the email from the current token, or log the user out if none is there
  const email = typeof (app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
  // Pass token to server
  const headers = {};
  headers.token = typeof (app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;

  if (email && headers.token) {
    // Fetch the user data
    const queryStringObject = {
      email,
    };
    app.client.request(undefined, 'api/menu', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      if (statusCode === 200) {
        // Put the data into the forms as values where needed
        const element = document.querySelector(".menuItems");
        let items = '';
        Object.keys(responsePayload).forEach((element) => {
          items += `
          <div class="itemWrapper">
            <div class="itemTitle">
              ${element}
            </div>
            <div class="itemDetail">
              ${responsePayload[element].ingredients}
            </div>
            <div class="itemImage">
              <img src="../public/img/pizza/${responsePayload[element].foto}" alt="">
            </div>
            <div class="itemPrice">
              ${responsePayload[element].price / 100}$
            </div>
            <div class="cartButtonWrapper">
              <a class="cartButton" id=${element} href="#">CART</a>
            </div>
          </div>
          `;
        });

        element.innerHTML = items;
        // Load cart values from server
        app.helperLoadCart();

        // Get all cartButtons
        const cartButton = document.querySelectorAll(".cartButton");
        // For in all cartButtons
        for (let i = 0; i < cartButton.length; i += 1) {
          cartButton[i].addEventListener('click', (e) => {
            // Prevent default action
            e.preventDefault();
            // Id selected item
            itemId = cartButton[i].getAttribute('id');
            // Add selected item to the cart
            app.helperAddToCart(itemId);
          });
        }
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

// Helper to add selected item to the cart
app.helperAddToCart = (item) => {
  // Check if item exists in the cart
  if (typeof (app.cart.order[item]) === 'undefined') {
    // No - set initial value 1
    app.cart.order[item] = 1;
  } else {
    // Yes - increase value on 1
    app.cart.order[item] += 1;
  }
  // Update cart values on the server
  app.helperUpdateCartServer(app.cart.order, (responsePayload) => {
    if (responsePayload) {
      console.log('cart updated');
    } else {
      console.log('error cart updated');
    }
  });
  // Show number of items in the cart by menu
  app.helperShowCartSize();
};

app.helperUpdateCartServer = (order, callback) => {
  // Update cart values on the server
  const email = typeof (app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
  const payload = {
    email,
    order,
  };

  app.client.request(undefined, 'api/cart', 'POST', undefined, payload, (statusCode, responsePayload) => {
    if (statusCode === 200) {
      // Put selected items into localStorage
      const cartString = JSON.stringify(responsePayload);
      localStorage.setItem('order', cartString);
      // Update app.cart
      app.cart = responsePayload;
      callback(responsePayload);
    } else {
      callback(false);
    }
  });
};

// Show number of items in the cart
app.helperShowCartSize = () => {
  const cartMenu = document.querySelector(".cart");
  const cartSize = app.helperCartSize();
  if (typeof (cartSize) === 'number' && cartSize > 0) {
    cartMenu.innerHTML = `CART <span class="cartNumber">${cartSize}</span>`;
  } else {
    cartMenu.innerHTML = `CART`;
  }
};

// Return number of items in the cart
app.helperCartSize = () => {
  let size = 0;
  if (typeof (app.cart.order) === 'object') {
    Object.keys(app.cart.order).forEach((item) => {
      size += app.cart.order[item];
    });
  }
  return size;
};

// Load cart items from server and put values into app.order and localStorage
app.helperLoadCart = () => {
  // Get the email from the current token, or log the user out if none is there
  const email = typeof (app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
  // Pass token to server
  const headers = {};
  headers.token = typeof (app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;

  if (email && headers.token) {
    // Fetch the user data
    const queryStringObject = {
      email,
    };
    app.client.request(undefined, 'api/cart', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      if (statusCode === 200) {
        // Update localStorage
        localStorage.setItem('order', JSON.stringify(responsePayload));
        // Update app.order
        app.cart = responsePayload;
        // Show number of items in the cart
        app.helperShowCartSize();
      } else {
        // Clear cart in local variables
        localStorage.setItem('order', false);
        // Update app.order
        app.cart = {
          order: {},
        };
        // Show number of items in the cart
        app.helperShowCartSize();
      }
    });
  }
};

// Show Cart table
app.helperShowCartTable = (table) => {
  const cart = Object.keys(app.cart.order);
  if (cart.length > 0) {
    // For in all items in the cart
    cart.forEach((item) => {
      const tr = table.insertRow(-1);
      tr.classList.add('checkRow');

      const td0 = tr.insertCell(0);
      const td1 = tr.insertCell(1);
      const td2 = tr.insertCell(2);
      const td3 = tr.insertCell(3);
      const td4 = tr.insertCell(4);
      const td5 = tr.insertCell(5);
      // Pizza name
      td0.innerHTML = item;
      // Pizza image
      td1.innerHTML = `
          <div class="cartImage">
            <img src="../public/img/pizza/${app.cart.image[item]}" alt="">
          </div>
          `;
      // Quantity
      td2.innerHTML = `<input type="text" id="quantity_${item}"value=${app.cart.order[item]}
            onkeypress='return event.charCode >= 48 && event.charCode <= 57' 
            />`;
      // Price
      td3.innerHTML = `${app.cart.price[item] / 100}$`;
      // Update button
      td4.innerHTML = `<a href="#" cart="${item} id="updateCartButton">Update</a>`;
      td4.addEventListener('click', (e) => {
        e.preventDefault();
        const newQuantity = document.getElementById(`quantity_${item}`).value;
        app.cart.order[item] = parseInt(newQuantity);

        // update cart on the server
        app.helperUpdateCartServer(app.cart.order, (responsePayload) => {
          if (responsePayload) {
            document.getElementById("amount").innerHTML = `<h1>Amount: ${app.cart.amount / 100}$</h1>`;
          } else {
            console.log('error cart updated');
          }
        });
        // Show number of items in the cart by menu
        app.helperShowCartSize();
      });
      // Delete button
      td5.innerHTML = `<a href="#" cart="${item} id="deleteCartButton">Delete</a>`;
      td5.addEventListener('click', (e) => {
        e.preventDefault();
        // remove item from the cart
        delete app.cart.order[item];
        if (Object.keys(app.cart.order).length > 0) {
          // Update cart values on the server
          app.helperUpdateCartServer(app.cart.order, (responsePayload) => {
            if (responsePayload) {
              //document.getElementById("amount").innerHTML = `<h1>Amount: ${app.cart.amount / 100}$</h1>`;
              window.location = '/orders/cart';
            } else {
              console.log('error cart updated');
            }
          });
          // Show number of items in the cart by menu
          app.helperShowCartSize();
        } else {
          const queryStringObject = {
            email: app.config.sessionToken.email,
          };
          app.client.request(undefined, 'api/cart', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
            // Set the app.config token as false
            app.cart = {
              order: {},
            };
            localStorage.setItem('order', false);
            // Send the user to the logged out page
            window.location = '/orders/cartEmpty';
          });
        }
      });
    });
  } else {
    window.location = 'orders/cartEmpty';
  }
};

// Load cart page
app.loadCartListPage = () => {
  // Load cart from the server
  // Get the email from the current token, or log the user out if none is there
  const email = typeof (app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
  // Pass token to server
  const headers = {};
  headers.token = typeof (app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;

  if (email && headers.token) {
    // Fetch the user data
    const queryStringObject = {
      email,
    };
    app.client.request(undefined, 'api/cart', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      if (statusCode === 200) {
        // Update localStorage
        localStorage.setItem('order', JSON.stringify(responsePayload));
        // Update app.order
        app.cart = responsePayload;
        // Show number of items in the cart
        app.helperShowCartSize();
        const table = document.getElementById('cartListTable');
        // Show cart table
        app.helperShowCartTable(table);
        document.getElementById('amount').innerHTML = `<h1>Amount: ${app.cart.amount / 100}$</h1>`;
        // Put current cart to current order
        document.getElementById('createOrder').addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.setItem('currentOrder', JSON.stringify({ cart: responsePayload }));
          window.location = '/orders/payment';
        });
      } else {
        window.location = '/orders/cartEmpty';
      }
    });
  } else {
    window.location = '/session/create';
  }
};

// Orders list
app.loadOrdersListPage = () => {
  // Get the email from the current token, or log the user out if none is there
  const email = typeof (app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
  // Pass token to server
  const headers = {};
  headers.token = typeof (app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;

  if (email && headers.token) {
    // Fetch the user data
    const queryStringObject = {
      email,
    };
    app.client.request(undefined, 'api/orders', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      console.log(responsePayload);
      if (statusCode === 200) {
        if (responsePayload.length > 0) {
          // Put the data into the forms as values where needed
          const table = document.getElementById('ordersListTable');
          // Show orders table
          app.helperShowOrdersTable(table, responsePayload);
        } else {
          window.location = '/orders/ordersEmpty';
        }
      } else {
        window.location = '/orders/ordersEmpty';
      }
    });
  } else {
    window.location = '/session/create';
  }
};

// Show Orders table
app.helperShowOrdersTable = (table, data) => {
  if (data.length > 0) {
    // For in all orders
    for (let i = 0; i < data.length; i += 1) {
      const tr = table.insertRow(-1);
      const td0 = tr.insertCell(0);
      const td1 = tr.insertCell(1);
      const td2 = tr.insertCell(2);
      const td3 = tr.insertCell(3);
      const td4 = tr.insertCell(4);
      const td5 = tr.insertCell(5);
      const td6 = tr.insertCell(6);
      // Date of orders
      const date = new Date(parseInt(data[i].date));
      td0.innerHTML = date.toLocaleString();
      // Amount of orders
      td1.innerHTML = `${data[i].cart.amount / 100}$`;
      // Pay status
      td2.innerHTML = data[i].payStatus;
      // Delivery status
      td3.innerHTML = data[i].status;
      // Detail button
      td4.innerHTML = `<a href="#" class="detailOrderButton">Detail</a>`;
      // Store information about selected order to the localStorage
      td4.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('currentOrder', JSON.stringify(data[i]));
        window.location = `/orders/detail`;
      });
      // Payment button
      if (data[i].payStatus === 'unpaid') {
        //td5.innerHTML = `<a href="/orders/payment" class="orderButton">Pay</a>`;
      }
      // Cancel button
      if (data[i].status === 'active') {
        td6.innerHTML = `<a href="#" class="orderButton">Cancel</a>`;
        td6.addEventListener('click', (e) => {
          e.preventDefault();
          const queryStringObject = {
            email: app.config.sessionToken.email,
            date: data[i].date
          };
          app.client.request(undefined, 'api/orders', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
            if (statusCode === 200) {
              window.location = '/orders/all';
            }
          });
        });
      }
    }
  } else {
    window.location = '/orders/ordersEmpty';
  }
};

// Load detail order information page
app.loadOrdersDetailPage = () => {
  // Check is there any data in the selected order
  try {
    const order = JSON.parse(localStorage.getItem('currentOrder'));
    // Show number of order, its delivery and payment status
    const orderDetailNumber = document.getElementById('orderDetailNumber');
    orderDetailNumber.innerHTML += `${order.date} [${new Date(parseInt(order.date)).toLocaleString()}] [${order.status}] [${order.payStatus}]`;
    const orderDetailAmount = document.getElementById('amount');
    orderDetailAmount.innerHTML = `<h1>Amount: ${order.cart.amount / 100}$</h1>`;
    if (Object.keys(order).length > 0) {
      // Get table pointer to modify information
      const table = document.getElementById('cartListTable');
      // Get each item in the order to display in the table
      Object.keys(order.cart.order).forEach((item) => {
        console.log(item);
        const tr = table.insertRow(-1);
        const td0 = tr.insertCell(0);
        const td1 = tr.insertCell(1);
        const td2 = tr.insertCell(2);
        const td3 = tr.insertCell(3);
        // Name of pizza
        td0.innerHTML = item;
        // Image of pizza
        td1.innerHTML = `
        <div class="cartImage">
          <img src="../public/img/pizza/${order.image[item]}" alt="">
        </div>
        `;
        // Quantity
        td2.innerHTML = order.cart.order[item];
        // Price
        td3.innerHTML = `${order.price[item] / 100}$`;
      });
    } else {
      window.location = '/orders/detailEmpty';
    }
  } catch (e) {
    window.location = '/orders/detailEmpty';
  }
};

// Load orders payment page
app.loadOrdersPaymentPage = () => {
  // Show amount on order payment page
  const orderAmount = document.getElementById('orderAmount');
  try {
    let order = JSON.parse(localStorage.getItem('currentOrder'));
    orderAmount.innerHTML = `<h1>Amount: ${order.cart.amount / 100}$</h1>`;
  } catch (e) {
    window.location = '/orders/all';
  }
};

// Account edit page
app.loadAccountEditPage = () => {
  // Get the email from the current token, or log the user out if none is there
  const email = typeof (app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
  // Pass token to server
  const headers = {};
  headers.token = typeof (app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;
  if (email && headers.token) {
    // Read user information from the server
    const queryStringObject = {
      email: app.config.sessionToken.email,
    };
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      if (statusCode === 200) {
        // Email
        const editEmail = document.getElementById('accountEditEmail');
        editEmail.value = email;
        // Name
        const editName = document.getElementById('accountEditName');
        editName.value = responsePayload.name;
        // Address
        const editAddress = document.getElementById('accountEditAddress');
        editAddress.value = responsePayload.address;
        // Password
        const editPassword = document.getElementById('accountEditPassword');
        const editPasswordRepeat = document.getElementById('accountEditPasswordRepeat');
        // Set listener to update button
        document.getElementById('accountEditUpdate').addEventListener('click', (e) => {
          // Init payload for put method - update account information
          // Update variables (delete trims and check if empty)
          const updateName = editName.value.trim().length > 0 ? editName.value.trim() : false;
          const updateAddress = editAddress.value.trim().length > 0 ? editAddress.value.trim() : false;
          const updatePassword = editPassword.value.trim().length > 0 ? editPassword.value.trim() : false;
          const updatePasswordRepeat = editPasswordRepeat.value.trim().length > 0 ? editPasswordRepeat.value.trim() : false;
          if (
            (updateName && updateName !== responsePayload.name)
            || (updateAddress && updateAddress !== responsePayload.address)
            || (updatePassword && updatePassword === updatePasswordRepeat)
          ) {
            const payloadUpdate = {
              email,
            };
            if (updateName && updateName !== responsePayload.name) {
              payloadUpdate.name = updateName;
            }
            if (updateAddress && updateAddress !== responsePayload.address) {
              payloadUpdate.address = updateAddress;
            }
            if (updatePassword && (updatePassword === updatePasswordRepeat)) {
              payloadUpdate.password = updatePassword;
            }
            console.log(payloadUpdate);
            // Call put method
            app.client.request(undefined, 'api/users', 'PUT', {}, payloadUpdate, (statusCode, responsePayload) => {
              if (statusCode === 200) {
                window.location = '/account/updated';
              } else {
                window.location = '/session/create';
              }
            });
          } else {
            window.location = '/orders/all';
          }
        });
        // Delete button
        document.getElementById('accountEditDelete').addEventListener('click', (e) => {
          e.preventDefault();
          if (document.getElementById('deleteAccountChkbox').checked) {
            // Send the current token to the tokens endpoint to delete it
            const queryStringObjectDelete = {
              email,
            };
            app.client.request(undefined, 'api/users', 'DELETE', queryStringObjectDelete, undefined, (statusCodeDelete, responsePayload) => {
              if (statusCodeDelete === 200) {
                // Set the app.config token as false
                app.setSessionToken(false);
                localStorage.setItem('order', false);
                // Send the user to the logged out page
                window.location = '/session/deleted';
              }
            });
          }
        });
      } else {
        window.location = '/session/create';
      }
    });
  } else {
    window.location = '/session/create';
  }
};

// Bind handlers to form
app.bindForms = () => {
  // Get the current page from the body class
  const bodyClasses = document.querySelector('body').classList;
  const primaryClass = typeof (bodyClasses[0]) === 'string' ? bodyClasses[0] : false;

  if (document.querySelector('form')) {
    // Select all forms on the page
    const allForms = document.querySelectorAll('form');
    for (let i = 0; i < allForms.length; i += 1) {
      allForms[i].addEventListener('submit', (e) => {
        // Stop it from submitting
        e.preventDefault();
        const formId = allForms[i].id;
        const path = allForms[i].action;
        let method = allForms[i].method.toUpperCase();
        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector(`#${formId} .formError`).style.display = 'none';

        // Hide the success message (if it's currently shown due to a previous error)
        if (document.querySelector(`#${formId} .formSuccess`)) {
          document.querySelector(`#${formId} .formSuccess`).style.display = 'none';
        }

        // Turn the inputs into a payload
        const payload = {};
        const elements = allForms[i].elements;
        if (primaryClass === 'ordersPayment') {
          // Get the email from the current token, or log the user out if none is there
          const email = typeof (app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
          payload.email = email;
          payload.payment = {};
          // card number
          payload.payment.cardNumber = elements[0].value;
          // expMonth
          payload.payment.expMonth = elements[1].value;
          // expYear
          payload.payment.expYear = elements[2].value;
          // CVC
          payload.payment.cvc = elements[3].value;
        } else {
          for (let i = 0; i < elements.length; i += 1) {
            const nameOfElement = elements[i].name;
            const valueOfElement = elements[i].value;
            payload[nameOfElement] = valueOfElement;
          }
        }

        for (let i = 0; i < elements.length; i += 1) {
          const nameOfElement = elements[i].name;
          const valueOfElement = elements[i].value;
          payload[nameOfElement] = valueOfElement;
        }

        const queryStringObject = {};
        // Roller for ordersPayment page
        if (primaryClass === 'ordersPayment') {
          document.querySelector('.lds-roller').style.display = 'inline-block';
        }
        // Call the API
        app.client.request(undefined, path, method, queryStringObject, payload, (statusCode, responsePayload) => {
          // Display an error on the form if needed
          if (statusCode !== 200) {
            if (statusCode === 403) {
              // log the user out
              app.logUserOut();
            } else {
              // Try to get the error from the api, or set a default error message
              const error = typeof (responsePayload.Error) === 'string' ? responsePayload.Error : 'An error has occured, please try again';

              // Set the formError field with the error text
              document.querySelector(`#${formId} .formError`).innerHTML = error;

              // Show (unhide) the form error field on the form
              document.querySelector(`#${formId} .formError`).style.display = 'block';
              // Hide pay button
              if (primaryClass === 'ordersPayment') {
                document.querySelector('#payButton').style.display = 'none';
              }
              // Show number of items in the cart by menu
              app.helperLoadCart();
            }
          } else {
            // Show number of items in the cart by menu
            app.helperLoadCart();
            // If successful, send to form response processor
            app.formResponseProcessor(formId, payload, responsePayload);
          }
        });
      });
    }
  }
};

// Form response processor
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  let functionToCall = false;
  // If login was successful, set the token in localstorage and redirect the user
  if (formId === 'sessionCreate') {
    app.setSessionToken(responsePayload);
    window.location = '/orders/all';
  }
  if (formId === 'ordersCreate') {
    window.location = '/orders/done';
  }
  if (formId === 'accountCreate') {
    // Create session for new user
    console.log(requestPayload);
    app.client.request(undefined, '/api/tokens', 'POST', {}, requestPayload, (statusCode, responsePayload) => {
      if (statusCode === 200) {
        app.setSessionToken(responsePayload);
        // Redirect to menu
        window.location = '/menu/all';
      } else {
        window.location = '/';
      }
    });
  }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = () => {
  const tokenString = localStorage.getItem('token');
  if (typeof (tokenString) === 'string') {
    try {
      const token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if (typeof (token) === 'object') {
        console.log("logged in", token);
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    } catch (e) {
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};


// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = (add) => {
  const target = document.querySelector('body');
  console.log('add', add);
  if (add) {
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = (token) => {
  console.log('setSessionToken', token);
  app.config.sessionToken = token;
  const tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);
  if (typeof (token) === 'object') {
    app.setLoggedInClass(true);
    app.helperLoadCart();
  } else {
    app.setLoggedInClass(false);
  }
};


// Renew the token
app.renewToken = (callback) => {
  const currentToken = typeof (app.config.sessionToken) === 'object' ? app.config.sessionToken : false;
  console.log('currentToken', currentToken);
  if (currentToken) {
    // Update the token with a new expiration
    const payload = {
      id: currentToken.id,
      extend: true,
    };
    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, (statusCode, responsePayload) => {
      // Display an error on the form if needed
      if (statusCode === 200) {
        // Get the new token details
        const queryStringObject = { id: currentToken.id };
        app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, (statusCodeNewToken, responsePayloadNewToken) => {
          // Display an error on the form if needed
          if (statusCodeNewToken === 200) {
            app.setSessionToken(responsePayloadNewToken);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Loop to renew token often
app.tokenRenewalLoop = () => {
  setInterval(() => {
    app.renewToken((err) => {
      if (!err) {
        console.log('Token renewed successfully @ ', Date.now());
      }
    });
  }, 1000 * 60);
};

// Init (bootstrapping)
app.init = () => {
  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Get the token from localstorage
  app.getSessionToken();

  // Renew token
  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();
};

// Call the init processes after the window loads
window.onload = () => {
  app.init();
};
