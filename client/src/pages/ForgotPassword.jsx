import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('ryowu0329@gmail.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/users/forgot-password`, {
        email,
      });
      toast.success('重置密碼連結已發送到您的郵箱');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || '發送重置密碼郵件失敗');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            忘記密碼
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請輸入您的電子郵件地址，我們將發送重置密碼的連結給您。
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="電子郵件"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '發送中...' : '發送重置連結'}
            </button>
          </div>
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              返回登入
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ForgotPassword;
