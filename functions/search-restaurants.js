'use strict';

// Adding a javascript Module for asychronise functions
const co = require('co');

// adding the aws-sdk module, This is only a dev depenncy since it is added by default 
//in the actual lambda runtime
const AWS = require ('aws-sdk');

// We will use dynamo db to store the list of restaurants
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Number of restaurants are either retrieved using an environment varaible are defaulted to 8
const defaultResults = process.env.defaultResults || 8;

// Creating an environment cariable for storing the table name 
const tableName = process.env.restaurants_table;

function* findRestaurantsByTheme (theme, count) {

    let req = {
        TableName: tableName,
        Limit: count,
        FilterExpression: "contains(themes, :theme)",
        ExpressionAttributeValues: {":theme": theme}
    };

    let resp = yield dynamodb.scan(req).promise();
    return resp.Items;
}
module.exports.handler = co.wrap ( function* (event,context,cb) {
    let req = JSON.parse(event.body);
    let restaurants = yield findRestaurantsByTheme(req.theme, defaultResults);
    let response = {
        statusCode: 200,
        body: JSON.stringify(restaurants)
    }
    cb(null, response);
});
