import { bugService } from '../services/bug.service.js'
import { userService } from '../services/user.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

const { useState, useEffect } = React

export function BugIndex() {
    console.log('BugIndex component mounted') // Debug log
    
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [sortBy, setSortBy] = useState({ field: '', direction: 'asc' })
    const [page, setPage] = useState({ idx: 0, size: 3 })
    const [paginationInfo, setPaginationInfo] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        console.log('useEffect triggered with:', { filterBy, sortBy, page }) // Debug log
        setIsLoading(true)
        loadBugs()
    }, [filterBy.txt, filterBy.minSeverity, filterBy.maxSeverity, filterBy.labels, filterBy.dateFrom, filterBy.dateTo, filterBy.hasLabels, sortBy.field, sortBy.direction, page.idx, page.size])

    function loadBugs() {
        console.log('Loading bugs with:', { filterBy, sortBy, page }) // Debug log
        bugService.query(filterBy, sortBy, page)
            .then(result => {
                console.log('Bugs loaded successfully:', result) // Debug log
                setBugs(result.bugs)
                setPaginationInfo({
                    totalCount: result.totalCount,
                    pageSize: result.pageSize,
                    pageIdx: result.pageIdx,
                    totalPages: result.totalPages
                })
                setIsLoading(false)
            })
            .catch(err => {
                console.error('Error loading bugs:', err) // Debug log
                showErrorMsg(`Couldn't load bugs - ${err}`)
                setIsLoading(false)
            })
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
        setPage({ idx: 0, size: 3 }) // Reset to first page when filtering
    }

    function onSetSortBy(sortConfig) {
        setSortBy(sortConfig)
        setPage({ idx: 0, size: 3 }) // Reset to first page when sorting
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
        pdfContent += `Total bugs: ${paginationInfo && paginationInfo.totalCount || bugs.length}\n\n`
        
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

    console.log('BugIndex render - bugs:', bugs, 'paginationInfo:', paginationInfo) // Debug log
    
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
                {userService.getLoggedinUser() && (
                    <button onClick={onAddBug}>Add Bug</button>
                )}
                <button onClick={downloadPDF} className="download-btn">Download Report</button>
            </div>
        </header>
        
        {isLoading ? (
            <div className="loading">Loading bugs...</div>
        ) : bugs && bugs.length > 0 ? (
            <BugList 
                bugs={bugs} 
                onRemoveBug={onRemoveBug} 
                onEditBug={onEditBug} />
        ) : (
            <div className="no-bugs">No bugs found</div>
        )}
            
        {/* Pagination */}
        {paginationInfo && (
            <div className="pagination">
                <div className="pagination-controls">
                    <button 
                        disabled={page.idx === 0}
                        onClick={() => onSetPage(page.idx - 1)}
                        className="pagination-btn"
                    >
                        ← Previous
                    </button>
                    
                    <div className="page-navigation">
                        {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                            let pageNum
                            if (paginationInfo.totalPages <= 5) {
                                pageNum = i
                            } else if (page.idx < 3) {
                                pageNum = i
                            } else if (page.idx >= paginationInfo.totalPages - 3) {
                                pageNum = paginationInfo.totalPages - 5 + i
                            } else {
                                pageNum = page.idx - 2 + i
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onSetPage(pageNum)}
                                    className={`page-btn ${page.idx === pageNum ? 'active' : ''}`}
                                >
                                    {pageNum + 1}
                                </button>
                            )
                        })}
                    </div>
                    
                    <button 
                        disabled={page.idx >= paginationInfo.totalPages - 1}
                        onClick={() => onSetPage(page.idx + 1)}
                        className="pagination-btn"
                    >
                        Next →
                    </button>
                </div>
                
                <div className="pagination-info">
                    <span className="page-info">
                        Page {page.idx + 1} of {paginationInfo.totalPages}
                    </span>
                    

                    
                    <span className="total-info">
                        Showing {bugs ? bugs.length : 0} of {paginationInfo.totalCount} bugs (3 per page)
                    </span>
                </div>
            </div>
        )}
    </section>
}
