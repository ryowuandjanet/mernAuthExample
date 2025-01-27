import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

function Dashboard() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userString);
    if (!user.isVerified) {
      toast.error('請先完成電子郵件驗證');
      navigate('/verify-email');
      return;
    }
  }, [navigate]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('user');
    toast.success('已登出');
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onLogoutClick={handleLogoutClick} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold mb-4">歡迎來到 Dashboard</h2>
            <p className="text-gray-600">您已成功登入並完成電子郵件驗證。</p>
          </div>
        </div>
      </main>

      {/* 登出確認對話框 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">確認登出</h3>
            <p className="text-sm text-gray-500 mb-4">您確定要登出嗎？</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
              >
                取消
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
              >
                確認登出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
