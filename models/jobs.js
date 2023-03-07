"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING title, salary, equity, company_handle as "Company"`,
        [
          title,
          salary,
          equity,
          company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */



  static async find_all(req, res, next) {
   const results = await db.query(`SELECT title,
                                          salary,
                                          equity,
                                          company_handle
                                          FROM jobs`)
   return results.rows
  }

  /** Given a job title, return data about job.
   *
   * Returns { title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   **/

  static async get(title) {
    const companyRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE title = $1`,
        [title]);

    const job = companyRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }


  static async getCompanyJobs(handle) {
   const jobRes = await db.query(`SELECT * from jobs where company_handle = $1`, [handle])
   return jobRes.rows
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {salary, equity, company_handle}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE title = ${handleVarIdx} 
                      RETURNING title, 
                                salary,
                                equity,
                                company_handle as "Company"`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(title) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
        [title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }

}


module.exports = Job;