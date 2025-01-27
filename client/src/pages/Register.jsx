import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PasswordInput from '../components/PasswordInput';
import { API_URL } from '../config';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'ryowu',
    email: 'ryowu0329@gmail.com',
    password: 'leo140814',
    confirmPassword: 'leo140814',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error('密碼不匹配');
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/users/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
      );

      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('註冊成功！請查看您的郵箱進行驗證');
      navigate('/verify-email');
    } catch (error) {
      toast.error(error.response?.data?.message || '註冊失敗');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          註冊帳號
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="姓名"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="電子郵件"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <PasswordInput
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="密碼"
              />
            </div>
            <div>
              <PasswordInput
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="確認密碼"
                name="confirmPassword"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              註冊
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            已經有帳號？{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
