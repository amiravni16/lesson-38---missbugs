export const userService = {
    login,
    signup,
    logout,
    getLoggedinUser,
    query,
    remove
};

const BASE_URL = '/api/auth'

function login(credentials) {
    return fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    }).then(res => {
        if (!res.ok) throw new Error('Login failed')
        return res.json()
    }).then(user => {
        // Store user in sessionStorage (without password)
        const userToStore = { ...user }
        delete userToStore.password
        sessionStorage.setItem('loggedinUser', JSON.stringify(userToStore))
        return userToStore
    })
}

function signup(credentials) {
    return fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    }).then(res => {
        if (!res.ok) throw new Error('Signup failed')
        return res.json()
    }).then(user => {
        // Store user in sessionStorage (without password)
        const userToStore = { ...user }
        delete userToStore.password
        sessionStorage.setItem('loggedinUser', JSON.stringify(userToStore))
        return userToStore
    })
}

function logout() {
    return fetch(`${BASE_URL}/logout`, {
        method: 'POST'
    }).then(() => {
        sessionStorage.removeItem('loggedinUser')
        
        // Emit user logout event
        if (window.eventBusService) {
            window.eventBusService.emit('user-logout')
        }
    })
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem('loggedinUser'))
}

function query(filterBy = {}) {
    const queryParams = new URLSearchParams()
    
    if (filterBy.txt) queryParams.append('txt', filterBy.txt)
    if (filterBy.username) queryParams.append('username', filterBy.username)
    if (filterBy.email) queryParams.append('email', filterBy.email)
    
    const url = queryParams.toString().length > 0 ? 
        `/api/user?${queryParams.toString()}` : 
        '/api/user'
    
    return fetch(url, {
        method: 'GET',
        credentials: 'include'
    }).then(res => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
    })
}

function remove(userId) {
    return fetch(`/api/user/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
    }).then(res => {
        if (!res.ok) throw new Error('Failed to remove user')
        return res.text()
    })
}
