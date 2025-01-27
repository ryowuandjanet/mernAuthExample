import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PasswordInput from '../components/PasswordInput';
import { API_URL } from '../config';

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirmPassword) {
      toast.error('密碼不匹配');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/users/reset-password`, {
        token,
        password: passwords.password,
      });
      toast.success('密碼已重置成功');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || '重置密碼失敗');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            重置密碼
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請輸入您的新密碼
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <PasswordInput
              value={passwords.password}
              onChange={(e) =>
                setPasswords({ ...passwords, password: e.target.value })
              }
              placeholder="新密碼"
            />
            <PasswordInput
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              placeholder="確認新密碼"
              name="confirmPassword"
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
              {isSubmitting ? '重置中...' : '重置密碼'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ResetPassword;
