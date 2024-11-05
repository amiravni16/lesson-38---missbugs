const { useState, useEffect } = React

import { bugService } from '../services/bug.service.local.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)

    useEffect(loadBugs, [])

    function loadBugs() {
        bugService.query()
            .then(setBugs)
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            severity: +prompt('Bug severity?'),
        }

        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    return <section className="bug-index main-content">
        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
        </header>
        
        <BugList 
            bugs={bugs} 
            onRemoveBug={onRemoveBug} 
            onEditBug={onEditBug} />
    </section>
}
