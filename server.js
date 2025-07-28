import express from 'express'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// App Configuration
app.use(express.static('public'))

// Basic - Routing in express
app.get('/', (req, res) => res.send('Hello Muki'))
app.get('/nono', (req, res) => res.redirect('/'))

// Real routing express
// List
app.get('/api/bug', (req, res) => {
    bugService.query().then(bugs => {
        res.send(bugs)
    }).catch((err) => {
        loggerService.error('Cannot get bugs', err)
        res.status(400).send('Cannot get bugs')
    })
})

//Save
app.get('/api/bug/save', (req, res) => {

    loggerService.debug('req.query', req.query)

    const { title, description, severity, _id } = req.query
    console.log('req.query', req.query)
    const bug = {
        _id,
        title,
        description,
        severity: +severity,
    }

    bugService.save(bug)
        .then((savedBug) => {
            res.send(savedBug)
        })
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

// Read - getById
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})

// Remove
app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params

    bugService.remove(bugId).then(() => {
        loggerService.info(`Bug ${bugId} removed`)
        res.send('Removed!')
    }).catch(err => {
        loggerService.error('Cannot get bug', err)
        res.status(400).send('Cannot get bug')
    })
})

// Listen will always be the last line in our server!
const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)