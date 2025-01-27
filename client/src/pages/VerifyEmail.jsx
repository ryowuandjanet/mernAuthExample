import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

function VerifyEmail() {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [user, setUser] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await axios.post(`${API_URL}/api/users/resend-verification`, {
        email: user.email,
      });

      toast.success('驗證碼已重新發送到您的郵箱');
      setCountdown(60); // 60秒冷卻時間
    } catch (error) {
      toast.error(error.response?.data?.message || '重新發送驗證碼失敗');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/api/users/verify-email`, {
        email: user.email,
        code: verificationCode,
      });

      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('郵件驗證成功！');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || '驗證失敗');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          驗證電子郵件
        </h2>
        <p className="text-center text-gray-600">
          請輸入發送到您郵箱 {user.email} 的 6 位數驗證碼
        </p>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="驗證碼"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              驗證
            </button>
          </div>
        </form>

        <div className="text-center space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={isResending || countdown > 0}
            className={`text-sm ${
              isResending || countdown > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:text-indigo-500'
            }`}
          >
            {countdown > 0
              ? `重新發送驗證碼 (${countdown}s)`
              : isResending
              ? '發送中...'
              : '重新發送驗證碼'}
          </button>

          <div>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              返回登入頁面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
