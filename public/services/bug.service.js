import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const STORAGE_KEY = 'bugs'

const BASE_URL = 'http://localhost:3030/api/bug'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = {}, sortBy = {}, page = {}) {
    const queryParams = new URLSearchParams()
    
    // Add filter parameters
    if (filterBy.txt) queryParams.append('title', filterBy.txt)
    if (filterBy.minSeverity) queryParams.append('minSeverity', filterBy.minSeverity)
    if (filterBy.labels && filterBy.labels.length > 0) {
        queryParams.append('labels', filterBy.labels.join(','))
    }
    
    // Add sort parameters
    if (sortBy.field) queryParams.append('sortBy', sortBy.field)
    if (sortBy.direction) queryParams.append('sortDir', sortBy.direction === 'desc' ? '-1' : '1')
    
    // Add page parameters
    if (page.idx !== undefined) queryParams.append('pageIdx', page.idx)
    if (page.size) queryParams.append('pageSize', page.size)
    
    const url = `${BASE_URL}?${queryParams.toString()}`
    
    return fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch bugs')
            return res.json()
        })
}

function getById(bugId) {
    return fetch(`${BASE_URL}/${bugId}`)
        .then(res => {
            if (!res.ok) throw new Error('Bug not found')
            return res.json()
        })
}

function remove(bugId) {
    return fetch(`${BASE_URL}/${bugId}`, {
        method: 'DELETE'
    }).then(res => {
        if (!res.ok) throw new Error('Failed to remove bug')
        return res.text()
    })
}

function save(bug) {
    const method = bug._id ? 'PUT' : 'POST'
    const url = bug._id ? `${BASE_URL}/${bug._id}` : BASE_URL
    
    return fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bug)
    }).then(res => {
        if (!res.ok) throw new Error('Failed to save bug')
        return res.json()
    })
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, labels: [] }
}