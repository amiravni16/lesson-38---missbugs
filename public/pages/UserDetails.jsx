import { BugList } from '../cmps/BugList.jsx';
import { userService } from '../services/user.service.js';
import { bugService } from '../services/bug.service.js';
import { LoginSignup } from '../cmps/LoginSignup.jsx';

const { useState, useEffect } = React;

export function UserDetails() {
    const [user, setUser] = useState(userService.getLoggedinUser());
    const [userBugs, setUserBugs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    function handleLogin(credentials) {
        userService.login(credentials)
            .then(function(loggedInUser) {
                setUser(loggedInUser);
            })
            .catch(function(err) {
                console.error('Login failed:', err);
                alert('Login failed. Please try again.');
            });
    }

    function handleSignup(credentials) {
        userService.signup(credentials)
            .then(function(newUser) {
                setUser(newUser);
            })
            .catch(function(err) {
                console.error('Signup failed:', err);
                alert('Signup failed. Please try again.');
            });
    }

    function handleLogout() {
        userService.logout();
        setUser(null);
        setUserBugs([]);
    }

    function handleRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(function() {
                setUserBugs(function(prevBugs) {
                    return prevBugs.filter(function(bug) {
                        return bug._id !== bugId;
                    });
                });
            })
            .catch(function(err) {
                console.error('Failed to remove bug:', err);
                alert('Failed to remove bug');
            });
    }

    function handleEditBug(bug) {
        alert('Edit functionality can be implemented here');
    }

    useEffect(function() {
        if (user && user._id) {
            setIsLoading(true);
            var isMounted = true;
            
            bugService.query({ creatorId: user._id })
                .then(function(result) {
                    if (isMounted) {
                        setUserBugs(result.bugs || []);
                        setIsLoading(false);
                    }
                })
                .catch(function(err) {
                    if (isMounted) {
                        console.error('Failed to fetch user bugs:', err);
                        setUserBugs([]);
                        setIsLoading(false);
                    }
                });
            
            return function() {
                isMounted = false;
            };
        } else {
            setUserBugs([]);
            setIsLoading(false);
        }
    }, [user]);

    if (!user) {
        return React.createElement('section', { className: 'user-details' },
            React.createElement('h2', null, 'Please log in to view your profile'),
            React.createElement(LoginSignup, { onLogin: handleLogin, onSignup: handleSignup })
        );
    }

    return React.createElement('section', { className: 'user-details' },
        React.createElement('h2', null, user.username + "'s Profile"),
        React.createElement('button', { onClick: handleLogout }, 'Logout'),
        React.createElement('h3', null, 'Your Bugs'),
        isLoading ? 
            React.createElement('div', null, 'Loading your bugs...') :
            userBugs.length > 0 ?
                React.createElement(BugList, {
                    bugs: userBugs,
                    onRemoveBug: handleRemoveBug,
                    onEditBug: handleEditBug
                }) :
                React.createElement('div', null, "You haven't created any bugs yet.")
    );
}
