const fs = require('fs')
const utilService = require('./util.service.js')
const loggerService = require('./logger.service.js')

module.exports = {
    query,
    getById,
    save,
    remove,
    getDefaultUser
}

const users = utilService.readJsonFile('data/user.json')

function query(filterBy = {}) {
    let filteredUsers = [...users]
    
    // Filtering by text (search in fullname, username, email)
    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        filteredUsers = filteredUsers.filter(user => 
            regex.test(user.fullname) || 
            regex.test(user.username) || 
            regex.test(user.email)
        )
    }
    
    // Filtering by username
    if (filterBy.username) {
        filteredUsers = filteredUsers.filter(user => 
            user.username === filterBy.username
        )
    }
    
    // Filtering by email
    if (filterBy.email) {
        filteredUsers = filteredUsers.filter(user => 
            user.email === filterBy.email
        )
    }
    
    return Promise.resolve(filteredUsers)
}

function getById(userId) {
    const user = users.find(user => user._id === userId)
    if (!user) return Promise.reject('User not found!')
    return Promise.resolve(user)
}

function save(user) {
    if (user._id) {
        // Update existing user
        const idx = users.findIndex(currUser => currUser._id === user._id)
        if (idx === -1) return Promise.reject('User not found!')
        
        users[idx] = { ...users[idx], ...user }
    } else {
        // Create new user
        user._id = utilService.makeId()
        user.createdAt = Date.now()
        users.unshift(user)
    }
    
    return _saveUsersToFile().then(() => user)
}

function remove(userId) {
    const idx = users.findIndex(user => user._id === userId)
    if (idx === -1) return Promise.reject('User not found!')
    
    users.splice(idx, 1)
    return _saveUsersToFile()
}

function getDefaultUser() {
    // Return the first user as default for new bugs
    return users[0] || null
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(users, null, 2)
        fs.writeFile('data/user.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to users file', err)
                return reject(err)
            }
            loggerService.info('Users file saved successfully')
            resolve()
        })
    })
} 