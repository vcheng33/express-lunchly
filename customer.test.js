"use strict";

const request = require("supertest");

const app = require("./app");

const db = require("./db");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

let testCustomer;
let testReservation;

beforeEach(function () {

    testCustomer = new Customer({
        "id": 1000000,
        "firstName": "testFirstName",
        "lastName": "testLastName",
        "phone": "555-555-5555",
        "notes": "test reservation notes"
    })

    testReservation = new Reservation ({
        "id": 999999,
        "customerId": 1000000,
        "numGuests": 2,
        "startAt": "2021-01-01, 9:00 p",
        "notes": "test reservation notes"
    }) 
});

afterEach(function () {
    Customer.deleteAll();
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
        expect(customers).toContain(testCustomer);
        expect(customers.length).toEqual(1);
    });
});

describe("Test get Reservations",  function () {
    test("testCustomer has no reservations", async function () {
        const reservations = await testCustomer.getReservations();

        expect(reservations).toEqual([testReservation]);
        expact(reservations.length).toEqual(1);
    })
})