import { BugList } from '../cmps/BugList.jsx';
import { userService } from '../services/user.service.js';
import { bugService } from '../services/bug.service.js';
import { LoginSignup } from '../cmps/LoginSignup.jsx';

const { useState, useEffect } = React;

export function UserDetails() {
    const user = userService.getLoggedinUser();
    const [userBugs, setUserBugs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    function handleLogin(credentials) {
        userService.login(credentials)
            .then(() => {
                // Force a re-render by updating the component
                window.location.reload();
            })
            .catch(err => {
                console.error('Login failed:', err);
                alert('Login failed. Please try again.');
            });
    }

    function handleSignup(credentials) {
        userService.signup(credentials)
            .then(() => {
                // Force a re-render by updating the component
                window.location.reload();
            })
            .catch(err => {
                console.error('Signup failed:', err);
                alert('Signup failed. Please try again.');
            });
    }

    // Fetch user's bugs when logged in
    useEffect(() => {
        if (user) {
            setIsLoading(true);
            // Filter bugs by creator ID
            bugService.query({ creatorId: user._id })
                .then(result => {
                    setUserBugs(result.bugs || []);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch user bugs:', err);
                    setUserBugs([]);
                    setIsLoading(false);
                });
        }
    }, [user]);

    if (!user) {
        return (
            <section className="user-details">
                <h2>Please log in to view your profile</h2>
                <LoginSignup onLogin={handleLogin} onSignup={handleSignup} />
            </section>
        );
    }

    return (
        <section className="user-details">
            <h2>{user.username}'s Profile</h2>
            <button onClick={() => {
                userService.logout();
                window.location.reload();
            }}>Logout</button>
            <h3>Your Bugs</h3>
            {isLoading ? (
                <div>Loading your bugs...</div>
            ) : userBugs.length > 0 ? (
                <BugList 
                    bugs={userBugs} 
                    onRemoveBug={(bugId) => {
                        // Remove bug and refresh the list
                        bugService.remove(bugId)
                            .then(() => {
                                setUserBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId));
                            })
                            .catch(err => {
                                console.error('Failed to remove bug:', err);
                                alert('Failed to remove bug');
                            });
                    }} 
                    onEditBug={(bug) => {
                        // For now, just show an alert - you can implement a proper edit form later
                        alert('Edit functionality can be implemented here');
                    }} 
                />
            ) : (
                <div>You haven't created any bugs yet.</div>
            )}
        </section>
    );
}
