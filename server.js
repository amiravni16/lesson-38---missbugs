import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// App Configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Basic - Routing in express
app.get('/', (req, res) => res.send('Hello Muki'))
app.get('/nono', (req, res) => res.redirect('/'))

// REST API for bugs
// GET /api/bug - List bugs with filtering, sorting, and paging
app.get('/api/bug', (req, res) => {
    const { title, minSeverity, labels, sortBy, sortDir, pageIdx, pageSize } = req.query
    
    const filterBy = {}
    if (title) filterBy.title = title
    if (minSeverity) filterBy.minSeverity = parseInt(minSeverity)
    if (labels) filterBy.labels = labels.split(',')
    
    const sortByObj = {}
    if (sortBy) sortByObj.field = sortBy
    if (sortDir) {
        // Handle both -1 and 'desc' for descending order
        sortByObj.direction = (sortDir === '-1' || sortDir === 'desc') ? 'desc' : 'asc'
    }
    
    const page = {}
    if (pageSize) page.size = parseInt(pageSize)
    if (pageIdx) page.idx = parseInt(pageIdx)
    
    bugService.query(filterBy, sortByObj, page).then(result => {
        res.send(result)
    }).catch((err) => {
        loggerService.error('Cannot get bugs', err)
        res.status(400).send('Cannot get bugs')
    })
})

// POST /api/bug - Create new bug
app.post('/api/bug', (req, res) => {
    const bug = req.body
    
    bugService.save(bug)
        .then((savedBug) => {
            res.status(201).send(savedBug)
        })
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

// PUT /api/bug/:bugId - Update bug
app.put('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    const bug = { ...req.body, _id: bugId }
    
    bugService.save(bug)
        .then((savedBug) => {
            res.send(savedBug)
        })
        .catch((err) => {
            loggerService.error('Cannot update bug', err)
            res.status(400).send('Cannot update bug')
        })
})

// GET /api/bug/:bugId - Get bug by ID
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    
    // Get visited bugs from cookie
    let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []
    
    // Check if user has already visited 3 different bugs
    if (visitedBugs.length >= 3) {
        return res.status(401).send('Wait for a bit')
    }
    
    // Add current bug to visited list if not already visited
    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
        
        // Log visited bugs to console
        console.log('User visited at the following bugs:', visitedBugs)
        
        // Set cookie with 7 seconds expiration
        res.cookie('visitedBugs', JSON.stringify(visitedBugs), {
            maxAge: 7 * 1000 // 7 seconds in milliseconds
        })
    }

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})

// DELETE /api/bug/:bugId - Remove bug
app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    bugService.remove(bugId).then(() => {
        loggerService.info(`Bug ${bugId} removed`)
        res.status(204).send()
    }).catch(err => {
        loggerService.error('Cannot remove bug', err)
        res.status(400).send('Cannot remove bug')
    })
})

// Legacy endpoints for backward compatibility
app.get('/api/bug/save', (req, res) => {
    loggerService.debug('req.query', req.query)

    const { title, description, severity, _id } = req.query
    console.log('req.query', req.query)
    const bug = {
        _id,
        title,
        description,
        severity: +severity,
        labels: []
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

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params

    bugService.remove(bugId).then(() => {
        loggerService.info(`Bug ${bugId} removed`)
        res.send('Removed!')
    }).catch(err => {
        loggerService.error('Cannot remove bug', err)
        res.status(400).send('Cannot remove bug')
    })
})

// Listen will always be the last line in our server!
const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)