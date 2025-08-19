export const userService = {
    login,
    signup,
    logout,
    getLoggedinUser
};

function login(credentials) {
    // Simulate server call
    return new Promise((resolve, reject) => {
        const user = { username: credentials.username, id: Date.now() };
        sessionStorage.setItem('loggedinUser', JSON.stringify(user));
        resolve(user);
    });
}

function signup(credentials) {
    // Simulate server call
    return new Promise((resolve, reject) => {
        const user = { username: credentials.username, id: Date.now() };
        sessionStorage.setItem('loggedinUser', JSON.stringify(user));
        resolve(user);
    });
}

function logout() {
    sessionStorage.removeItem('loggedinUser');
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem('loggedinUser'));
}
