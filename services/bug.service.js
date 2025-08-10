import fs from 'fs'

import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const bugService = {
    query,
    getById,
    remove,
    save
}

const bugs = utilService.readJsonFile('data/bug.json')

function query(filterBy = {}, sortBy = {}, page = {}) {
    let filteredBugs = [...bugs]
    
    // Filtering
    if (filterBy.title) {
        const regex = new RegExp(filterBy.title, 'i')
        filteredBugs = filteredBugs.filter(bug => regex.test(bug.title))
    }
    
    if (filterBy.minSeverity) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= filterBy.minSeverity)
    }
    
    if (filterBy.labels && filterBy.labels.length > 0) {
        filteredBugs = filteredBugs.filter(bug => 
            filterBy.labels.some(label => bug.labels.includes(label))
        )
    }
    
    // Sorting
    if (sortBy.field) {
        filteredBugs.sort((a, b) => {
            let aVal = a[sortBy.field]
            let bVal = b[sortBy.field]
            
            if (sortBy.field === 'createdAt') {
                aVal = new Date(aVal).getTime()
                bVal = new Date(bVal).getTime()
            }
            
            if (sortBy.direction === 'desc') {
                return bVal - aVal
            }
            return aVal - bVal
        })
    }
    
    // Paging
    const totalCount = filteredBugs.length
    const pageSize = page.size || 10
    const pageIdx = page.idx || 0
    const startIdx = pageIdx * pageSize
    const endIdx = startIdx + pageSize
    
    const pagedBugs = filteredBugs.slice(startIdx, endIdx)
    
    return Promise.resolve({
        bugs: pagedBugs,
        totalCount,
        pageSize,
        pageIdx,
        totalPages: Math.ceil(totalCount / pageSize)
    })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Bug not found!')
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    bugs.splice(idx, 1)
    return _saveBugsToFile()
}

function save(bug) {
    console.log('bug: ', bug)
    if (bug._id) {
        const idx = bugs.findIndex(currBug => currBug._id === bug._id)
        bugs[idx] = { ...bugs[idx], ...bug }
    } else {
        bug._id = utilService.makeId()
        bug.createdAt = Date.now()
        bug.labels = bug.labels || []
        bugs.unshift(bug)
    }
    return _saveBugsToFile().then(() => bug)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 2)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to bugs file', err)
                return reject(err);
            }
            console.log('The file was saved!');
            resolve()
        });
    })
} 