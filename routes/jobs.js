"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Job = require("../models/jobs");

const db = require("../db");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, name, description, numEmployees, logoUrl }
 *
 * Returns { title, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
   //  const validator = jsonschema.validate(req.body, companyNewSchema);
   //  if (!validator.valid) {
   //    const errs = validator.errors.map(e => e.stack);
   //    throw new BadRequestError(errs);
   //  }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { title, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
   // Accesses header and extracts queries.  Places queries into Filters arr, checks length to ensure filters or not, and filters our jobs in realtime for values
   const jobs = await Job.find_all();
   return res.json({ jobs });
  } catch (err) {
   return next(err);
  }
});

/** GET /[title]  =>  { job }
 *
 *  Job is { title, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:title", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.title);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[title] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { title, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:title", ensureLoggedIn, async function (req, res, next) {
   if (!res.locals.user['isAdmin']) {
      throw new ExpressError('Unauthorized, not administrator', 403)
   }
  try {
   //  const validator = jsonschema.validate(req.body, companyUpdateSchema);
   //  if (!validator.valid) {
   //    const errs = validator.errors.map(e => e.stack);
   //    throw new BadRequestError(errs);
   //  }
    const job = await Job.update(req.params.title, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[title]  =>  { deleted: title }
 *
 * Authorization: login
 */

router.delete("/:title", ensureLoggedIn, async function (req, res, next) {
   if (!res.locals.user['isAdmin']) {
      throw new ExpressError('Unauthorized, not administrator', 403)
   }
  try {
    await Job.remove(req.params.title);
    return res.json({ deleted: req.params.title });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
