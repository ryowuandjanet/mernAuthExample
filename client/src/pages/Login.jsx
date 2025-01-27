import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PasswordInput from '../components/PasswordInput';
import { API_URL } from '../config';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'ryowu0329@gmail.com',
    password: 'leo140814',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/api/users/login`,
        formData,
      );
      const userData = response.data;

      localStorage.setItem('user', JSON.stringify(userData));

      if (!userData.isVerified) {
        toast.error('請先驗證您的電子郵件');
        navigate('/verify-email');
        return;
      }

      toast.success('登入成功！');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || '登入失敗');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          登入
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="email"
                name="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="電子郵件"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <PasswordInput
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                忘記密碼？
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              登入
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            還沒有帳號？{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              立即註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
