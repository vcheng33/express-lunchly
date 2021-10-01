"use strict";

const { response } = require("express");
/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = this.fullName();
    this.phone = phone;
    this.notes = notes;
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           ORDER BY last_name, first_name`,
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE id = $1`,
      [id],
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
             SET first_name=$1,
                 last_name=$2,
                 phone=$3,
                 notes=$4
             WHERE id = $5`, [
        this.firstName,
        this.lastName,
        this.phone,
        this.notes,
        this.id,
      ],
      );
    }
  }

  static async find(name) {
    console.log("got to find");
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE lower(first_name) = $1 OR lower(last_name) = $1`,
      [name.toLowerCase()],
    );

    const customers = results.rows;

    if (customers.length === 0) {
      const err = new Error(`No customers found.`);
      err.status = 404;
      throw err;
    }

    return customers.map(customer => new Customer(customer));
  }

  static async getTop10() {
    // const resResults = await db.query(
    //   `SELECT customer_id AS "customerId",
    //           COUNT(id) AS "numReservations"
    //     FROM reservations
    //     GROUP BY customerId
    //     ORDER BY numReservations DESC
    //     LIMIT 10
    //   `
    // );
    // const top10 = resResults.rows; // [{"customerId": "1", "numReservations":"10"}, {"customerId": "2", "numReservations":"9"},]
    // const top10Ids = top10.map(o => o.customerId); // [ 1, 2, 3, ...etc]

    // const custResults = await db.query(
    //   `SELECT id,
    //           first_name AS "firstName",
    //           last_name  AS "lastName",
    //           phone,
    //           notes
    //     FROM customers
    //     WHERE id IN $1
    //   `, [top10Ids]
    // );

    // const customers = custResults.rows; // [{"id":"1", "firstName":"Jessica", "lastName": "Rabbit", "phone":"", "notes":""}]
    // const customers2 = customers.map(c => new Customer(c));
    // customers.top10 = top10;

    const results = await db.query(
      `SELECT c.id AS "id",
                    c.first_name AS "firstName",
                    c.last_name  AS "lastName",
                    phone,
                    c.notes AS "notes"
                    
              FROM customers AS c
                    JOIN reservations as r
                    ON r.customer_id = c.id
              GROUP BY c.id
              ORDER BY COUNT(r.id) DESC
              LIMIT 10
            `,
    );

    const customers = results.rows; // [{"id":"1", "firstName":"Jessica", "lastName": "Rabbit", "phone":"", "notes":""}]

    return customers.map(customer => new Customer(customer));
  }
}



module.exports = Customer;
