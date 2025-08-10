const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [sortBy, setSortBy] = useState({ field: '', direction: 'asc' })
    const [page, setPage] = useState({ idx: 0, size: 10 })
    const [paginationInfo, setPaginationInfo] = useState(null)

    useEffect(loadBugs, [filterBy, sortBy, page])

    function loadBugs() {
        bugService.query(filterBy, sortBy, page)
            .then(result => {
                setBugs(result.bugs)
                setPaginationInfo({
                    totalCount: result.totalCount,
                    pageSize: result.pageSize,
                    pageIdx: result.pageIdx,
                    totalPages: result.totalPages
                })
            })
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                loadBugs() // Reload to get updated pagination
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            description: prompt('Bug description?', 'Description'),
            severity: +prompt('Bug severity?', 3),
            labels: prompt('Bug labels? (comma-separated)', 'bug,new').split(',').map(l => l.trim())
        }

        bugService.save(bug)
            .then(savedBug => {
                loadBugs() // Reload to get updated pagination
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                loadBugs() // Reload to get updated pagination
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
        setPage({ idx: 0, size: 10 }) // Reset to first page when filtering
    }

    function onSetSortBy(field) {
        setSortBy(prevSort => ({
            field,
            direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    function onSetPage(pageIdx) {
        setPage(prevPage => ({ ...prevPage, idx: pageIdx }))
    }

    function downloadPDF() {
        if (!bugs || bugs.length === 0) {
            showErrorMsg('No bugs to download')
            return
        }

        // Create PDF content
        let pdfContent = 'Bug Report\n\n'
        pdfContent += `Generated on: ${new Date().toLocaleString()}\n`
        pdfContent += `Total bugs: ${paginationInfo?.totalCount || bugs.length}\n\n`
        
        bugs.forEach((bug, index) => {
            pdfContent += `${index + 1}. ${bug.title}\n`
            pdfContent += `   Severity: ${bug.severity}\n`
            pdfContent += `   Description: ${bug.description || 'No description'}\n`
            pdfContent += `   Labels: ${bug.labels ? bug.labels.join(', ') : 'No labels'}\n`
            pdfContent += `   ID: ${bug._id}\n\n`
        })

        // Create and download the file
        const blob = new Blob([pdfContent], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bug-report-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        showSuccessMsg('Bug report downloaded!')
    }

    return <section className="bug-index main-content">
        
        <BugFilter 
            filterBy={filterBy} 
            onSetFilterBy={onSetFilterBy}
            sortBy={sortBy}
            onSetSortBy={onSetSortBy}
        />
        
        <header>
            <h3>Bug List {paginationInfo && `(${paginationInfo.totalCount} bugs)`}</h3>
            <div className="header-buttons">
                <button onClick={onAddBug}>Add Bug</button>
                <button onClick={downloadPDF} className="download-btn">Download Report</button>
            </div>
        </header>
        
        <BugList 
            bugs={bugs} 
            onRemoveBug={onRemoveBug} 
            onEditBug={onEditBug} />
            
        {/* Pagination */}
        {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="pagination">
                <button 
                    disabled={page.idx === 0}
                    onClick={() => onSetPage(page.idx - 1)}
                >
                    Previous
                </button>
                
                <span className="page-info">
                    Page {page.idx + 1} of {paginationInfo.totalPages}
                </span>
                
                <button 
                    disabled={page.idx >= paginationInfo.totalPages - 1}
                    onClick={() => onSetPage(page.idx + 1)}
                >
                    Next
                </button>
            </div>
        )}
    </section>
}
