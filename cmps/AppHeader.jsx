const { useEffect } = React
const { NavLink } = ReactRouterDOM

import { UserMsg } from './UserMsg.jsx'

export function AppHeader() {
    return <header className='container'>
        <UserMsg />
        <nav>
            <NavLink to="/">Home</NavLink> |<NavLink to="/bug">Bugs</NavLink> |
            <NavLink to="/about">About</NavLink>
        </nav>
        <h1>Bugs are Forever</h1>
    </header>
}
