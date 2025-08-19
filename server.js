import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { signup, query, remove, getById, getByUsername, save } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'
import { authService } from './services/auth.service.js'

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
    const { txt, minSeverity, maxSeverity, labels, dateFrom, dateTo, hasLabels, creatorId, sortBy, sortDir, pageIdx, pageSize } = req.query
    
    const filterBy = {}
    if (txt) filterBy.txt = txt
    if (minSeverity) filterBy.minSeverity = parseInt(minSeverity)
    if (maxSeverity) filterBy.maxSeverity = parseInt(maxSeverity)
    if (labels) filterBy.labels = labels
    if (dateFrom) filterBy.dateFrom = dateFrom
    if (dateTo) filterBy.dateTo = dateTo
    if (hasLabels) filterBy.hasLabels = hasLabels === 'true'
    if (creatorId) filterBy.creatorId = creatorId
    
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

// Legacy endpoints for backward compatibility (MUST come before /:bugId routes)
app.get('/api/bug/save', (req, res) => {
    loggerService.debug('req.query', req.query)

    const { title, description, severity, _id } = req.query
    
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

// POST /api/bug - Create new bug (requires authentication)
app.post('/api/bug', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add bug')

    const bug = req.body
    delete loggedinUser.username
    bug.creator = loggedinUser

    bugService.save(bug, loggedinUser)
        .then(addedBug => res.send(addedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

// PUT /api/bug - Update bug (requires authentication)
app.put('/api/bug', (req, res, next) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot update bug')

    const bug = req.body
    bugService.save(bug, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Had issues:', err)
            res.status(400).send('Cannot save bug')
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

// DELETE /api/bug/:bugId - Remove bug (requires authentication)
app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot delete bug')

    const { bugId } = req.params
    bugService.remove(bugId, loggedinUser)
        .then(() => res.send(`Bug id : ${bugId} deleted`))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(401).send('Cannot remove bug')
        })
})

// Authentication Routes
// POST /api/auth/signup - Register new user
app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body


    signup(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(401).send('Cannot signup')
        })
})

// POST /api/auth/login - Authenticate user
app.post('/api/auth/login', (req, res) => {
    const credentials = {
        username: req.body.username,
        password: req.body.password,
    }
    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot login', err)
            res.status(401).send('Cannot login')
        })
})

// POST /api/auth/logout - Clear authentication
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged out')
})

// REST API for users
// GET /api/user - List users with filtering
app.get('/api/user', (req, res) => {
    const { txt, username, email } = req.query
    
    const filterBy = {}
    if (txt) filterBy.txt = txt
    if (username) filterBy.username = username
    if (email) filterBy.email = email
    
    query(filterBy).then(users => {
        res.send(users)
    }).catch((err) => {
        loggerService.error('Cannot get users', err)
        res.status(400).send('Cannot get users')
    })
})

// GET /api/user/:userId - Get user by ID
app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    
    getById(userId).then(user => {
        res.send(user)
    }).catch(err => {
        loggerService.error('Cannot get user', err)
        res.status(400).send('Cannot get user')
    })
})

// POST /api/user - Create new user
app.post('/api/user', (req, res) => {
    const user = req.body
    
    save(user).then((savedUser) => {
        res.status(201).send(savedUser)
    }).catch((err) => {
        loggerService.error('Cannot save user', err)
        res.status(400).send('Cannot save user')
    })
})

// PUT /api/user/:userId - Update user
app.put('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    const user = { ...req.body, _id: userId }
    
    save(user).then((savedUser) => {
        res.send(savedUser)
    }).catch((err) => {
        loggerService.error('Cannot update user', err)
        res.status(400).send('Cannot update user')
    })
})

// DELETE /api/user/:userId - Remove user
app.delete('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    remove(userId).then(() => {
        loggerService.info(`User ${userId} removed`)
        res.status(204).send()
    }).catch(err => {
        loggerService.error('Cannot remove user', err)
        res.status(400).send('Cannot remove user')
    })
})

// Listen will always be the last line in our server!
const port = process.env.PORT || 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port ${port}`)
)