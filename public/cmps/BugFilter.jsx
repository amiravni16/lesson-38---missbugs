export function BugFilter({ filterBy, onSetFilterBy, sortBy, onSetSortBy }) {
    const { useState, useEffect } = React

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(function() {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            case 'date':
                value = value || ''
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    function handleSortClick(field) {
        const newDirection = sortBy.field === field && sortBy.direction === 'asc' ? 'desc' : 'asc'
        onSetSortBy({ field, direction: newDirection })
    }

    function getSortIcon(field) {
        if (sortBy.field !== field) return '↕️'
        return sortBy.direction === 'asc' ? '↑' : '↓'
    }

    function clearFilters() {
        const clearedFilters = {
            txt: '',
            minSeverity: '',
            maxSeverity: '',
            labels: '',
            dateFrom: '',
            dateTo: '',
            hasLabels: false
        }
        setFilterByToEdit(clearedFilters)
        onSetFilterBy(clearedFilters)
    }

    function getSeverityLabel(severity) {
        const labels = ['', 'Low', 'Medium', 'High', 'Critical', 'Blocker']
        return labels[severity] || severity
    }

    const { txt, minSeverity, maxSeverity, labels, dateFrom, dateTo, hasLabels } = filterByToEdit
    
    return (
        <section className="bug-filter">
            <div className="filter-header">
                <h2>Filter & Sort</h2>
                <button 
                    type="button" 
                    className="expand-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>
            
            {/* Quick Sort */}
            <div className="sort-options">
                <h3>Quick Sort:</h3>
                <div className="sort-buttons">
                    <button 
                        onClick={() => handleSortClick('title')}
                        className={`sort-btn ${sortBy.field === 'title' ? 'active' : ''}`}
                        title="Sort by title"
                    >
                        Title {getSortIcon('title')}
                    </button>
                    <button 
                        onClick={() => handleSortClick('severity')}
                        className={`sort-btn ${sortBy.field === 'severity' ? 'active' : ''}`}
                        title="Sort by severity"
                    >
                        Severity {getSortIcon('severity')}
                    </button>
                    <button 
                        onClick={() => handleSortClick('createdAt')}
                        className={`sort-btn ${sortBy.field === 'createdAt' ? 'active' : ''}`}
                        title="Sort by creation date"
                    >
                        Date {getSortIcon('createdAt')}
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className={`advanced-filters ${isExpanded ? 'expanded' : ''}`}>
                <form onSubmit={onSubmitFilter}>
                    <div className="filter-grid">
                        {/* Text Search */}
                        <div className="filter-group">
                            <label htmlFor="txt">Search Text:</label>
                            <input 
                                value={txt} 
                                onChange={handleChange} 
                                type="text" 
                                placeholder="Search by title or description..." 
                                id="txt" 
                                name="txt" 
                            />
                        </div>

                        {/* Severity Range */}
                        <div className="filter-group">
                            <label htmlFor="minSeverity">Severity Range:</label>
                            <div className="severity-range">
                                <input 
                                    value={minSeverity} 
                                    onChange={handleChange} 
                                    type="range" 
                                    min="1" 
                                    max="5"
                                    step="1"
                                    id="minSeverity" 
                                    name="minSeverity" 
                                />
                                <span className="severity-value">
                                    {minSeverity ? getSeverityLabel(minSeverity) : 'Any'}
                                </span>
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="filter-group">
                            <label htmlFor="labels">Labels:</label>
                            <input 
                                value={labels} 
                                onChange={handleChange} 
                                type="text" 
                                placeholder="comma-separated labels..." 
                                id="labels" 
                                name="labels" 
                            />
                        </div>

                        {/* Date Range */}
                        <div className="filter-group">
                            <label htmlFor="dateFrom">Date Range:</label>
                            <div className="date-range">
                                <input 
                                    value={dateFrom} 
                                    onChange={handleChange} 
                                    type="date" 
                                    id="dateFrom" 
                                    name="dateFrom" 
                                />
                                <span>to</span>
                                <input 
                                    value={dateTo} 
                                    onChange={handleChange} 
                                    type="date" 
                                    id="dateTo" 
                                    name="dateTo" 
                                />
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="filter-group checkbox-group">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={hasLabels} 
                                    onChange={handleChange}
                                    name="hasLabels"
                                />
                                Only bugs with labels
                            </label>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button type="submit" className="filter-btn primary">Apply Filters</button>
                        <button type="button" className="filter-btn secondary" onClick={clearFilters}>
                            Clear All
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}