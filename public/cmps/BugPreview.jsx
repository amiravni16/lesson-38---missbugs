export function BugPreview({bug}) {
    return <article className="bug-preview">
        <p className="title">{bug.title}</p>
        {bug.creator && (
            <p className="creator">Created by: <span className="creator-name">{bug.creator.fullname}</span></p>
        )}
        <p className="description">{bug.description}</p>
        <p>Severity: <span className={`severity-${bug.severity}`}>{bug.severity}</span></p>
        {bug.labels && bug.labels.length > 0 && (
            <div className="labels">
                {bug.labels.map((label, index) => (
                    <span key={index} className="label">{label}</span>
                ))}
            </div>
        )}
        <p className="date">Created: {new Date(bug.createdAt).toLocaleDateString()}</p>
    </article>
}