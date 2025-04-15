import { Link } from 'react-router-dom';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <h1>Inventory App</h1>
      <nav>
        <Link to="/">Home</Link>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            {user.role === 'manager' && <Link to="/client">Client Panel</Link>}
            {user.role === 'manager' && <Link to="/manager">Manager Panel</Link>}
            {user.role === 'manager' && <Link to="/admin">Admin Panel</Link>}
            <button onClick={onLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;