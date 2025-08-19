import React from 'react';
import { BugList } from '../cmps/BugList.jsx';
import { userService } from '../services/user.service.js';

export function UserDetails() {
    const user = userService.getLoggedinUser();
    const userBugs = []; // Fetch or filter bugs created by the user

    if (!user) {
        return (
            <section className="user-details">
                <h2>Please log in to view your profile</h2>
            </section>
        );
    }

    return (
        <section className="user-details">
            <h2>{user.username}'s Profile</h2>
            <h3>Your Bugs</h3>
            <BugList bugs={userBugs} onRemoveBug={() => {}} onEditBug={() => {}} />
        </section>
    );
}
