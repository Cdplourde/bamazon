DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products
(
	item_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    product_name VARCHAR(200),
    department_name VARCHAR(200),
    price DECIMAL(10,2),
    stock_quantity INT
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Zombieland", "Movies", 19.99, 48), 
		("Hot Fuzz", "Movies", 24.99, 31), 
		("Intel Core i7-8700K Processor", "Electronics", 349.99, 19), 
		("Balexa", "Electronics", 99.99, 288), 
		("Maximum Ride", "Books", 9.99, 24), 
		("Bamazon TV", "Electronics", 39.99, 397),
        ("Nintendo Switch", "Video Games", 299.99, 0),
        ("Electric Kettle", "Kitchen", 19.99, 13),
        ("Sennheiser HD 650", "Audio", 499.95, 25),
        ("Fender Mustang V2", "Musical Instruments", 199.99, 11);

SELECT * FROM products;