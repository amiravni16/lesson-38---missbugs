import { BugPreview } from './BugPreview.jsx'
import { userService } from '../services/user.service.js'

const { Link } = ReactRouterDOM

export function BugList({ bugs, onRemoveBug, onEditBug }) {
    const loggedinUser = userService.getLoggedinUser()

    if (!bugs) return <div>Loading...</div>
    return <ul className="bug-list">
        {bugs.map(bug => (
            <li key={bug._id}>
                <BugPreview bug={bug} />
                <section className="actions">
                    <button><Link to={`/bug/${bug._id}`}>Details</Link></button>
                    {loggedinUser && (bug.creator && bug.creator._id === loggedinUser._id || loggedinUser.isAdmin) && (
                        <div>
                            <button onClick={() => onEditBug(bug)}>Edit</button>
                            <button onClick={() => onRemoveBug(bug._id)}>x</button>
                        </div>
                    )}
                </section>
            </li>
        ))}
    </ul >
}
