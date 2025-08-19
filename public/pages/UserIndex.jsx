import { userService } from '../services/user.service.js';

const { useState, useEffect } = React;

export function UserIndex() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const loggedinUser = userService.getLoggedinUser();

    useEffect(() => {
        if (loggedinUser && loggedinUser.isAdmin) {
            loadUsers();
        }
    }, [loggedinUser]);

    function loadUsers() {
        setIsLoading(true);
        userService.query()
            .then(users => {
                setUsers(users);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load users:', err);
                setIsLoading(false);
            });
    }

    function onRemoveUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            userService.remove(userId)
                .then(() => {
                    setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                })
                .catch(err => {
                    console.error('Failed to remove user:', err);
                    alert('Failed to remove user');
                });
        }
    }

    // Check if user is admin
    if (!loggedinUser || !loggedinUser.isAdmin) {
        return (
            <section className="user-index">
                <h2>Access Denied</h2>
                <p>Only admin users can access this page.</p>
            </section>
        );
    }

    return (
        <section className="user-index">
            <h2>User Management</h2>
            {isLoading ? (
                <div>Loading users...</div>
            ) : (
                <div className="user-list">
                    {users.map(user => (
                        <div key={user._id} className="user-item">
                            <div className="user-info">
                                <h3>{user.fullname}</h3>
                                <p>Username: {user.username}</p>
                                <p>Email: {user.email || 'N/A'}</p>
                                <p>Admin: {user.isAdmin ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="user-actions">
                                <button 
                                    onClick={() => onRemoveUser(user._id)}
                                    className="delete-btn"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
