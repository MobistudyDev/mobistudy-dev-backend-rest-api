import passport from 'passport'

import usersCtrl from './controllers/usersCtrl.mjs'
import auditLogCtrl from './controllers/auditLogCtrl.mjs'
import tasksResultsCtrl from './controllers/tasksResultsCtrl.mjs'
import attachmentsCtrl from './controllers/attachmentsCtrl.mjs'
import studyStatsCtrl from './controllers/studyStatsCtrl.mjs'
import vocabularyCtrl from './controllers/vocabularyCtrl.mjs'
import techadminCtrl from './controllers/techadminCtrl.mjs'
import express from 'express'


// sets up the routes
const router = express.Router()

await usersCtrl.init()
router.post('/login', passport.authenticate('local', { session: false }), usersCtrl.login.bind(usersCtrl))
router.post('/sendResetPasswordEmail', usersCtrl.sendPasswordResetEmail.bind(usersCtrl))
router.post('/resetPassword', usersCtrl.resetPassword.bind(usersCtrl))
router.get('/users/renewToken', passport.authenticate('jwt', { session: false }), usersCtrl.renewToken.bind(usersCtrl))
router.post('/users', usersCtrl.createUser.bind(usersCtrl))
router.get('/users', passport.authenticate('local', { session: false }), usersCtrl.getUsers.bind(usersCtrl))
router.get('/users/:user_key', passport.authenticate('local', { session: false }), usersCtrl.getUserByKey.bind(usersCtrl))
router.patch('/users/:userKey', passport.authenticate('local', { session: false }), usersCtrl.updateUser.bind(usersCtrl))
router.delete('/users/:user_key', passport.authenticate('local', { session: false }), usersCtrl.removeUser.bind(usersCtrl))


await auditLogCtrl.init()
router.get('/auditlog/eventTypes', passport.authenticate('jwt', { session: false }), auditLogCtrl.getEventTypes.bind(auditLogCtrl))
router.get('/auditlog', passport.authenticate('jwt', { session: false }), auditLogCtrl.getAuditLogs.bind(auditLogCtrl))

await tasksResultsCtrl.init()
router.get('/tasksResults', passport.authenticate('jwt', { session: false }), tasksResultsCtrl.getAll.bind(tasksResultsCtrl))
router.post('/tasksResults', passport.authenticate('jwt', { session: false }), tasksResultsCtrl.createNew.bind(tasksResultsCtrl))

await attachmentsCtrl.init()
router.get('/tasksResults/attachments/:studyKey/:userKey/:taskId/:fileName', passport.authenticate('jwt', { session: false }), attachmentsCtrl.getAttachment.bind(attachmentsCtrl))

await studyStatsCtrl.init()
router.get('/studyStats', passport.authenticate('jwt', { session: false }), studyStatsCtrl.getLastTasksSummary.bind(studyStatsCtrl))

await vocabularyCtrl.init()
router.get('/vocabulary/:lang/:type/search', vocabularyCtrl.getTerm.bind(vocabularyCtrl))

await techadminCtrl.init()
router.post('/techadmin/sendemail/', passport.authenticate('jwt', { session: false }), techadminCtrl.sendOneEmail.bind(techadminCtrl))

export default router
