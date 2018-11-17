'use strict'

/**
* This provides the API endpoints for authentication.
*/
import express from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import getDB from '../DB/DB'
import { applogger } from '../logger'

const router = express.Router()

export default async function () {
  const db = await getDB()

  router.post('/login', passport.authenticate('local', { session: false }), function (req, res, next) {
    res.send(req.user)
  })

  router.post('/users', async (req, res) => {
    let user = req.body
    let hashedPassword = bcrypt.hashSync(user.password, 8)
    delete user.password
    user.hashedPassword = hashedPassword
    try {
      let existing = await db.findUser(user.email)
      if (existing) return res.status(409).send('This email is already registered')
      if (user.role !== 'researcher') return res.sendStatus(403)
      // if (user.role === 'researcher' && user.invitationCode !== '827363423') return res.status(400).send('Bad invitation code')
      await db.createUser(user)
      res.sendStatus(200)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new user')
      res.sendStatus(500)
    }
  })

  // possible query parameters:
  // studyKey: the key of the study
  router.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      let val
      if (req.user.role === 'admin') {
        val = await db.getAllUsers(null, req.query.studyKey)
      } else if (req.user.role === 'researcher') {
        // TODO: make sure the study Key is among the ones the researcher is allowed
        if (req.query.studyKey) val = await db.getAllUsers('participant', req.query.studyKey)
        else {
          // TODO: retrieve studies where this participant is involved in
          let studyKeys = undefined
          val = await db.getAllUsers('participant', undefined, studyKeys)
        }
      } else { // a participant
        val = await db.getOneUser(req.user._key)
      }
      res.send(val)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new user')
      res.sendStatus(500)
    }
  })

  router.get('/users/:user_key', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      let val
      if (req.user.role === 'admin') {
        val = await db.getOneUser(req.params.user_key)
      } else if (req.user.role === 'researcher') {
        // TODO: make sure the user Key is among the ones the researcher is allowed. i.e is part of the team key
        val = await db.getOneUser(req.params.user_key)
        }
      res.send(val)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve user details')
      res.sendStatus(500)
    }
  })

  return router
}
