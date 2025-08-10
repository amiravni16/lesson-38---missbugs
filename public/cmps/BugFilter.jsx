const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy, sortBy, onSetSortBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
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
        onSetSortBy(field)
    }

    function getSortIcon(field) {
        if (sortBy.field !== field) return '↕️'
        return sortBy.direction === 'asc' ? '↑' : '↓'
    }

    const { txt, minSeverity, labels } = filterByToEdit
    return (
        <section className="bug-filter">
            <h2>Filter & Sort</h2>
            
            {/* Sorting */}
            <div className="sort-options">
                <h3>Sort by:</h3>
                <div className="sort-buttons">
                    <button 
                        onClick={() => handleSortClick('title')}
                        className={`sort-btn ${sortBy.field === 'title' ? 'active' : ''}`}
                    >
                        Title {getSortIcon('title')}
                    </button>
                    <button 
                        onClick={() => handleSortClick('severity')}
                        className={`sort-btn ${sortBy.field === 'severity' ? 'active' : ''}`}
                    >
                        Severity {getSortIcon('severity')}
                    </button>
                    <button 
                        onClick={() => handleSortClick('createdAt')}
                        className={`sort-btn ${sortBy.field === 'createdAt' ? 'active' : ''}`}
                    >
                        Date {getSortIcon('createdAt')}
                    </button>
                </div>
            </div>

            {/* Filtering */}
            <form onSubmit={onSubmitFilter}>
                <div className="filter-row">
                    <label htmlFor="txt">Text: </label>
                    <input 
                        value={txt} 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="Search by title..." 
                        id="txt" 
                        name="txt" 
                    />
                </div>

                <div className="filter-row">
                    <label htmlFor="minSeverity">Min Severity: </label>
                    <input 
                        value={minSeverity} 
                        onChange={handleChange} 
                        type="number" 
                        min="1" 
                        max="5"
                        placeholder="Min severity" 
                        id="minSeverity" 
                        name="minSeverity" 
                    />
                </div>

                <div className="filter-row">
                    <label htmlFor="labels">Labels: </label>
                    <input 
                        value={labels} 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="comma-separated labels..." 
                        id="labels" 
                        name="labels" 
                    />
                </div>

                <button type="submit" className="filter-btn">Apply Filters</button>
            </form>
        </section>
    )
}