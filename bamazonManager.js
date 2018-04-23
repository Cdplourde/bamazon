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

function getNumProducts() {
    connectToDB();
    connection.create.query("SELECT item_id FROM products", function(err, res) {
        if (err) throw err;
        numProducts = res.length;
    });
    connection.create.end();
}

function connectToDB() {
    //create new connection and connect to it
    connection = new NewConnection("localhost", "root", "Pass4Class", "bamazon");
    connection.create.connect();
}

//displays the products in the bamazon database. 
function printProducts() { 
    //connect to database. 
    connectToDB();
    //get number of items in database
    connection.create.query("SELECT item_id, product_name, price, stock_quantity FROM products", function (err, res) {
        if (err) throw err;
        //create new table using cli-table
        var table = new Table({
            head: ["Item ID", "Product", "Price", "Stock"]
        });
        //push each query into the cli-table
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]
            );
        }
        //console log the table for the user to see
        console.log(table.toString());
        //end the connection
        connection.create.end();
        promptManager();
    });
}

function lowInv() {
    //create new connection
    connectToDB();
    //grab all items with stock less than 5
    connection.create.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;
        //create and fill in the cli-table
        var table = new Table({
            head: ["Item ID", "Product", "Price", "Stock"]
        });
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]
            );
        }
        //log out the table
        console.log(table.toString());
        //end the connection
        connection.create.end();
        promptManager();
    });
}

function addInv() {
    inquirer.prompt([{
       type: "input",
       message: "Input the product ID of the product you wish to add inventory.",
       validate: function(input) {
            input = parseInt(input);
            if (isNaN(input)) {
                return "Please input a number";
            } else if (input < 1 || input > numProducts) {
                return "Invalid Product ID"
            }
            return true;
        },
       name: "choice"
    },
    {
        type: "input",
        message: "How many would you like to add?",
        validate: function(input) {
            input = parseInt(input);
            if (isNaN(input)) {
                return "Please input a number.";
            } else if (input < 0) {
                return "Please input a positive number, or enter '0' for no update."
            }
            else return true;
        },
        name: "numToAdd"
    }])
    .then(function(res) {
        connectToDB();
        connection.create.query("SELECT stock_quantity FROM products WHERE item_id=" + res.choice, function(err, response) {
            if (err) throw err;
            var currQuant = parseInt(response[0].stock_quantity);
            connection.create.query("UPDATE products SET stock_quantity=" + (parseInt(res.numToAdd) + currQuant) + " WHERE item_id=" + res.choice, function(err, response) {
                if (err) throw err;
                console.log("Quantity successfully updated.");
                connection.create.end();
            });
        });
    });
}

function addNewProduct() {
    inquirer.prompt([{
        type: "input",
        message: "Enter product name",
        name: "product_name"
    },
    {   
        type: "input",
        message: "Enter product department",
        name: "department_name"
    },
    {
        type: "input",
        message: "Enter the product's price",
        validate: function(input) {
            input = parseInt(input);
            if (isNaN(input)) {
                return "Please input a number.";
            } else if (input <= 0) {
                return "Please input a positive number"
            }
            else return true;
        },
        name: "price"
    },
    {
        type: "input",
        message: "Enter the current stock on hand",
        validate: function(input) {
            input = parseInt(input);
            if (isNaN(input)) {
                return "Please input a number.";
            } else if (input < 0) {
                return "Please input a positive number"
            }
            else return true;
        },
        name: "stock_quantity"
    }])
    .then(function(res) {
        connectToDB();
        console.log("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('" + res.product_name + "','" + res.department_name + "'," + res.price + "," + res.stock_quantity + ")")
        connection.create.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('" + res.product_name + "','" + res.department_name + "'," + res.price + "," + res.stock_quantity + ")", function(err, response) {
            if (err) throw err;
            console.log("Item successfully added to the database");
            connection.create.end();
        });
    });
}

function promptManager() {
    inquirer.prompt([{
                //get what the manager wants to do
                type: "list",
                message: "What would you like to do?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
                name: "choice"
            },
        ])
        .then(function(res) {
            switch (res.choice) {
                case "View Products for Sale":
                    printProducts();
                    break;
                case "View Low Inventory":
                    lowInv();
                    break;
                case "Add to Inventory":
                    getNumProducts();
                    addInv();
                    break;
                case "Add New Product":
                    addNewProduct();
                    break;
                default:
                    console.log("An unexpected error occured"); 
            }
        });
}

//run the program on load
promptManager();