import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export {
    signup,
    query,
    remove,
    getById,
    getByUsername
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

function getByUsername(username) {
    const user = users.find(user => user.username === username)
    return Promise.resolve(user)
}

function signup({ fullname, username, password }) {
    if (!fullname || !username || !password) {
        return Promise.reject('Incomplete credentials')
    }
    
    const user = {
        _id: utilService.makeId(),
        fullname,
        username,
        password,
        isAdmin: false,
    }
    users.push(user)

    return _saveUsersToFile().then(() => ({
        _id: user._id,
        fullname: user.fullname,
        isAdmin: user.isAdmin,
    }))
}

function remove(userId) {
    const idx = users.findIndex(user => user._id === userId)
    if (idx === -1) return Promise.reject('User not found!')
    
    users.splice(idx, 1)
    return _saveUsersToFile()
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