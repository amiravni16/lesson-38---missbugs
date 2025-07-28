import express from 'express'
import { bugService } from './services/bug.service.local.js'

const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

app.get('/', (req, res) => res.send('Hello there'))

// Bug API endpoints
app.get('/api/bug', async (req, res) => {
    try {
        const bugs = await bugService.query(req.query)
        res.json(bugs)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/bug/save', async (req, res) => {
    try {
        const bug = req.body
        const savedBug = await bugService.save(bug)
        res.json(savedBug)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/api/bug/:bugId', async (req, res) => {
    try {
        const bug = await bugService.getById(req.params.bugId)
        if (!bug) {
            return res.status(404).json({ error: 'Bug not found' })
        }
        res.json(bug)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/api/bug/:bugId/remove', async (req, res) => {
    try {
        await bugService.remove(req.params.bugId)
        res.json({ message: 'Bug removed successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.listen(3030, () => console.log('Server ready at port 3030'))