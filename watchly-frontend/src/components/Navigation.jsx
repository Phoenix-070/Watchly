import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signout();
    navigate('/signin');
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/home">
          <h1>Watchly</h1>
        </Link>
      </div>
      
      <div className="nav-links">
        <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>
          <i className="fas fa-home"></i> Home
        </Link>
        <Link to="/discover" className={location.pathname === '/discover' ? 'active' : ''}>
          <i className="fas fa-compass"></i> Discover
        </Link>
        {user ? (
          <>
            <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
              <i className="fas fa-user"></i> Profile
            </Link>
            <button className="nav-logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className={location.pathname === '/signin' ? 'active' : ''}>
              <i className="fas fa-sign-in-alt"></i> Sign In
            </Link>
            <Link to="/signup" className={location.pathname === '/signup' ? 'active' : ''}>
              <i className="fas fa-user-plus"></i> Sign Up
            </Link>
          </>
        )}
      </div>

      {user && (
        <div className="nav-user">
          <Link to="/profile">
            <i className="fas fa-user-circle"></i>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
