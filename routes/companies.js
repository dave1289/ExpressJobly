"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const db = require("../db");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
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
   // Accesses header and extracts queries.  Places queries into Filters arr, checks length to ensure filters or not, and filters our companies in realtime for values
   const filters = req.query
   const companies = await Company.findAll(req, res, next);
   const companiesSearch = []
   // check for filters in header
   if (filters.length !== 0) {
      for (let company of companies) {
         // isolate values for filters
         let minEmp = filters['minemployees']
         let maxEmp = filters['maxemployees']
         let compName = filters['name']
         if (minEmp > maxEmp) {
            throw new ExpressError('Min employees must be lower than max employees', 400)
         }
         // check num of employees before filtering for name as it is a range
         if (company.numEmployees >= minEmp && company.numEmployees <= maxEmp){
                  companiesSearch.push(company)
         }
         if (compName) {
            // check if name is in query string and then sort the companies with appropriate employees by including the passed company name/substring
         for (let company of companiesSearch) {
            if (!company.name.toLowerCase().includes(compName.toLowerCase())){
               companiesSearch.pop(company)  
            }
         }
      }
   }
   }
   // returns our companySearch if we have passed queries and returns our full query response
   if (companiesSearch.length !== 0) {
      return res.json({ companiesSearch })
   }
   return res.json({ companies });
  } catch (err) {
   return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
   if (!res.locals.user['isAdmin']) {
      throw new ExpressError('Unauthorized, not administrator', 403)
   }
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
   if (!res.locals.user['isAdmin']) {
      throw new ExpressError('Unauthorized, not administrator', 403)
   }
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
