import { useNavigate } from 'react-router-dom';

function Navbar({ onLogoutClick }) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={onLogoutClick}
              className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
