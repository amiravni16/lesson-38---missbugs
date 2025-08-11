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
    if (filterBy.txt) queryParams.append('txt', filterBy.txt)
    if (filterBy.minSeverity) queryParams.append('minSeverity', filterBy.minSeverity)
    if (filterBy.maxSeverity) queryParams.append('maxSeverity', filterBy.maxSeverity)
    if (filterBy.labels && filterBy.labels.length > 0) {
        const labelsStr = Array.isArray(filterBy.labels) ? filterBy.labels.join(',') : filterBy.labels
        queryParams.append('labels', labelsStr)
    }
    if (filterBy.dateFrom) queryParams.append('dateFrom', filterBy.dateFrom)
    if (filterBy.dateTo) queryParams.append('dateTo', filterBy.dateTo)
    if (filterBy.hasLabels) queryParams.append('hasLabels', filterBy.hasLabels)
    
    // Add sort parameters
    if (sortBy.field) queryParams.append('sortBy', sortBy.field)
    if (sortBy.direction) queryParams.append('sortDir', sortBy.direction === 'desc' ? '-1' : '1')
    
    // Add page parameters
    if (page.idx !== undefined) queryParams.append('pageIdx', page.idx)
    if (page.size !== undefined) queryParams.append('pageSize', page.size)
    
    // Only add query string if there are parameters
    const hasParams = queryParams.toString().length > 0
    const url = hasParams ? `${BASE_URL}?${queryParams.toString()}` : BASE_URL
    
    console.log('Fetching bugs from:', url) // Debug log
    console.log('Request details:', { filterBy, sortBy, page }) // Debug log
    
    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            console.log('Response status:', res.status) // Debug log
            console.log('Response headers:', res.headers) // Debug log
            if (!res.ok) {
                console.error('Response not ok:', res.status, res.statusText) // Debug log
                throw new Error(`HTTP ${res.status}: ${res.statusText}`)
            }
            return res.json()
        })
        .then(data => {
            console.log('Response data:', data) // Debug log
            return data
        })
        .catch(err => {
            console.error('Error fetching bugs:', err) // Debug log
            throw err
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
    return { 
        txt: '', 
        minSeverity: '', 
        maxSeverity: '', 
        labels: '', 
        dateFrom: '', 
        dateTo: '', 
        hasLabels: false 
    }
}