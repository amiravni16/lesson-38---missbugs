import { userService } from '../services/user.service.js'

const { useState } = React
const { NavLink } = ReactRouterDOM

export function AppHeader() {
    const [loggedinUser, setLoggedinUser] = useState(userService.getLoggedinUser())
    
    return <header className="app-header main-content single-row">
        <h1>Miss Bug</h1>
        <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/bug">Bugs</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            {loggedinUser && loggedinUser.isAdmin && (
                <NavLink to="/users">Users</NavLink>
            )}
        </nav>
    </header>
}