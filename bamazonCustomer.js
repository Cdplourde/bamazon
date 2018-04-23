// ~~~~~~~~~~~~ DEPENDENCIES & VARIABLES ~~~~~~~~~~~~~
var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");
var numProducts;
var alreadyConnected = false;

// ~~~~~~~~~~~~ FUNCTIONS ~~~~~~~~~~~~~

//connection constructor so we can create a new connection after every disconnect
function NewConnection(host, user, password, database) {
    this.host = host;
    this.user = user;
    this.password = password;
    this.database = database;
    this.create = mysql.createConnection({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database
    })
}

function connectToDB() {
    //create new connection and connect to it
    connection = new NewConnection("localhost", "root", "Pass4Class", "bamazon");
    connection.create.connect();
}

//displays the products in the bamazon database. 
function printProducts() { 
    //connect to database. this runs only on first load.
    if (!alreadyConnected) {
        connectToDB();
        alreadyConnected = true;
    }
    //get number of items in database
    connection.create.query("SELECT item_id, product_name, price FROM products", function (err, res) {
        if (err) throw err;
        //grab number of products in database
        numProducts = res.length;
        //create new table using cli-table
        var table = new Table({
            head: ["Item ID", "Product", "Price"]
        });
        //push each query into the cli-table
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].price]
            );
        }
        //console log the table for the user to see
        console.log(table.toString());
        //end the connection
        connection.create.end();
        promptCustomer();
    });
}

function promptCustomer() {
    inquirer.prompt([{
                //get what product the customer wants
                type: "input",
                message: "Enter the ID of the product you would like to purchase",
                validate: function(input) {
                    input = parseInt(input);
                    if (isNaN(input)) {
                        return "Please input a number";
                    } else if (input < 1 || input > numProducts) {
                        return "Invalid Product ID"
                    }
                    return true;
                },
                name: "ID"
            },
            {
                //get how much of the item the customer wants
                type: "input",
                message: "How many would you like to buy?",
                validate: function(input) {
                    input = parseInt(input);
                    if (isNaN(input)) {
                        return "Please input a number";
                    }
                    return true;
                },
                name: "quant"
            }
        ])
        .then(function (res) {
            connectToDB();
            //query the products database to check the stock quantity
            connection.create.query("SELECT stock_quantity FROM products WHERE item_id=" + res.ID, function (err, response) {
                if (err) throw err;
                //determine if there is enough quantity for the requested ID
                if ((response[0].stock_quantity - res.quant) >= 0) {
                    connection.create.query("UPDATE products SET stock_quantity=" + (response[0].stock_quantity - res.quant) + " WHERE item_id=" + res.ID);
                    console.log("Order placed successfully!")
                }
                else {
                    console.log("Sorry, there is not enough product for that request! There are " + response[0].stock_quantity + " items remaining.");
                }
                // run program again
                printProducts();
            });
        });
}

//run the program on load
printProducts();
