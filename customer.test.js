"use strict";

const request = require("supertest");

const app = require("./app");

const db = require("./db");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

let testCustomer;
let testReservation;

beforeEach(async function () {

    let result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ('testFirstName', 'testLastName', '555-555-5555', 'test reservation notes')
             RETURNING id, first_name AS "firstName", last_name AS "lastName", phone, notes`
    );
    console.log("result.rows[0]:", result.rows[0]);
    testCustomer = new Customer(result.rows[0]);
    console.log("testCustomer:", testCustomer);
    
    let resResult = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, '2018-10-27 11:45:46', '2', 'test reservation notes')
             RETURNING id, customer_id AS "customerId", start_at AS "startAt", num_guests AS "numGuests", notes`,
             [testCustomer.id]
    );
    testReservation = new Reservation(resResult.rows[0]);
    console.log("testCustomer:", testCustomer);
    console.log("testReservation:", testReservation);

});

afterEach(async function () {
    await Reservation.deleteAll();
    await Customer.deleteAll();
    
})

describe("Test fullName() method", function () {
    test("Gets fullName with firstName and lastName", function () {
        const fullName = testCustomer.fullName;
        expect(fullName).toEqual("testFirstName testLastName");
    });
});

describe("Test all() class method", function () {
    test("Test gets an array of 1 with testCustomer", async function() {
        const customers = await Customer.all();
        expect(customers).toEqual([testCustomer]);
        expect(customers.length).toEqual(1);
    });
});

describe("Test get Reservations",  function () {
    test("testCustomer has no reservations", async function () {
        const reservations = await testCustomer.getReservations();

        expect(reservations).toEqual([testReservation]);
        expect(reservations.length).toEqual(1);
    })
})