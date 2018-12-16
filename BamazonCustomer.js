const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});



connection.connect(function (err) {
    if (err) throw err;

    start();
});




function start() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.table(results);
        console.log("Press ^C to exit at any time")
        transaction();
    });

    function transaction() {

        inquirer.prompt([{
            type: "input",
            message: "What would you like to buy (id)?",
            name: "purchaseID"
        }, {
            type: "input",
            message: "How many would you like to purchase?",
            name: "purchaseQuantity"
        }]).then((purchaseID) => {
            var ID = parseInt(purchaseID.purchaseID);
            var Qnty = parseInt(purchaseID.purchaseQuantity);

            if (Number.isInteger(ID) || Number.isInteger(Qnty)) {

                var idNum = parseInt(ID);
                connection.query("SELECT stock_quantity, price FROM products WHERE ?", {
                        item_id: idNum
                    },
                    function (err, res) {
                        var qntyUpdate = res[0].stock_quantity;
                        var cost = res[0].price * Qnty;
                    
                        if (Qnty < qntyUpdate) {
                            UpdateField(qntyUpdate, cost, Qnty, ID)
                        } else {
                            console.log("Sorry, we don't have that");
                            start();
                        }

                    });


            } else {
                console.log("Please use a number for ID and Quantity");
                start();
            }
        })
    }
};

function UpdateField(qntyUpdate, cost, Qnty, ID) {

    connection.query("UPDATE products SET ? WHERE ?", [{
            stock_quantity: qntyUpdate - Qnty
        },
        {
            item_id: ID
        }
    ]);
    console.log("Your total is " + cost + ", Thank you!");
    start();
}