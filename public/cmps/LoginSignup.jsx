export function LoginSignup({ onLogin, onSignup }) {
    const { useState } = React
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isSignup, setIsSignup] = useState(false);

    function handleChange({ target }) {
        const { name, value } = target;
        setCredentials({ ...credentials, [name]: value });
    }

    function onSubmit(ev) {
        ev.preventDefault();
        isSignup ? onSignup(credentials) : onLogin(credentials);
    }

    return (
        <section className="login-signup">
            <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
            <form onSubmit={onSubmit}>
                <input type="text" name="username" placeholder="Username" value={credentials.username} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required />
                <button>{isSignup ? 'Sign Up' : 'Log In'}</button>
            </form>
            <button onClick={() => setIsSignup(!isSignup)}>{isSignup ? 'Already have an account? Log In' : 'New here? Sign Up'}</button>
        </section>
    );
}
