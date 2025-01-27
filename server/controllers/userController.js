import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// 首先確保環境變數被正確載入
console.log('Email configuration:', {
  user: process.env.EMAIL_USER ? 'Set' : 'Not set',
  pass: process.env.EMAIL_PASS ? 'Set' : 'Not set',
});

// 更新 transporter 設置
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // 啟用調試
  logger: true, // 啟用日誌
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 在發送郵件之前添加驗證
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP verification failed:', error);
    return false;
  }
};

// 註冊
const register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body); // 調試日誌

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: '所有欄位都是必填的' });
    }

    // 檢查用戶是否已存在
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: '用戶已存在' });
    }

    // 生成驗證碼
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 30 * 60000); // 30分鐘後過期

    // 加密密碼
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 創建用戶
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires,
    });

    console.log('User created:', user); // 調試日誌

    // 更新郵件內容
    const mailOptions = {
      from: `"驗證郵件" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '帳號驗證碼',
      html: `
        <h1>歡迎註冊！</h1>
        <p>您的驗證碼是：<strong style="font-size: 24px; color: #4F46E5;">${verificationCode}</strong></p>
        <p>驗證碼將在 30 分鐘後過期。</p>
        <p>如果這不是您的操作，請忽略此郵件。</p>
      `,
    };

    // 發送郵件並等待結果
    console.log('Attempting to send email...');
    try {
      await transporter.verify();
      console.log('Transporter verified successfully');

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.response);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // 即使郵件發送失敗，仍然返回用戶數據，但添加警告
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        token,
        warning: '驗證郵件發送失敗，請聯繫支援',
      });
    }

    // 生成 JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: '註冊過程中發生錯誤',
      error: error.message,
    });
  }
};

// 驗證郵件
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: '無效的驗證碼或驗證碼已過期' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: '郵件驗證成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 登入
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '用戶不存在' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密碼錯誤' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 重發驗證碼函數
const resendVerification = async (req, res) => {
  try {
    console.log('Resend verification request received:', req.body);
    const { email } = req.body;

    if (!email) {
      console.log('Email is missing in request');
      return res.status(400).json({ message: '請提供電子郵件地址' });
    }

    // 檢查 transporter 設置
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({
        message: '郵件服務器連接失敗',
        error: verifyError.message,
      });
    }

    // 查找用戶
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ message: '用戶不存在' });
    }

    // 生成新的驗證碼
    const verificationCode = generateVerificationCode();
    console.log('Generated new verification code for:', email);

    // 更新用戶驗證碼
    try {
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = new Date(Date.now() + 30 * 60000);
      await user.save();
      console.log('User verification code updated successfully');
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({
        message: '更新驗證碼失敗',
        error: saveError.message,
      });
    }

    // 準備郵件內容
    const mailOptions = {
      from: {
        name: '帳號驗證系統',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: '【重要】您的帳號驗證碼',
      html: `
        <div style="padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 20px; border-radius: 10px;">
            <h2 style="color: #4F46E5; margin-bottom: 20px;">帳號驗證碼</h2>
            <p style="font-size: 16px; color: #333;">親愛的用戶：</p>
            <p style="font-size: 16px; color: #333;">您的新驗證碼是：</p>
            <div style="background-color: #f8f8f8; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px;">
              <span style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 3px;">
                ${verificationCode}
              </span>
            </div>
            <p style="font-size: 14px; color: #666;">
              • 此驗證碼將在 30 分鐘後過期<br>
              • 如果這不是您的操作，請忽略此郵件
            </p>
          </div>
        </div>
      `,
    };

    // 發送郵件
    try {
      console.log('Attempting to send email to:', email);
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.response);

      res.json({
        message: '新的驗證碼已發送',
        success: true,
        messageId: info.messageId,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        message: '發送郵件失敗',
        error: emailError.message,
        success: false,
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      message: '重發驗證碼失敗',
      error: error.message,
      success: false,
    });
  }
};

// 生成重置密碼的 token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };
  
  // 忘記密碼
  const forgotPassword = async (req, res) => {
    try {
      console.log('Forgot password request received:', req.body);
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: '請提供電子郵件地址' });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: '此電子郵件未註冊' });
      }
  
      // 生成重置密碼的 token 和過期時間
      const resetToken = generateResetToken();
      const resetTokenExpires = new Date(Date.now() + 30 * 60000); // 30 分鐘後過期
  
      // 更新用戶的重置密碼信息
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpires;
      await user.save();
  
      // 重置密碼的連結
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
      // 發送重置密碼郵件
      const mailOptions = {
        from: {
          name: '密碼重置',
          address: process.env.EMAIL_USER,
        },
        to: email,
        subject: '密碼重置請求',
        html: `
          <div style="padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 20px; border-radius: 10px;">
              <h2 style="color: #4F46E5; margin-bottom: 20px;">密碼重置請求</h2>
              <p style="font-size: 16px; color: #333;">親愛的用戶：</p>
              <p style="font-size: 16px; color: #333;">我們收到了您的密碼重置請求。請點擊下方連結重置您的密碼：</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetUrl}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  重置密碼
                </a>
              </div>
              <p style="font-size: 14px; color: #666;">
                • 此連結將在 30 分鐘後過期<br>
                • 如果這不是您的操作，請忽略此郵件
              </p>
            </div>
          </div>
        `,
      };
  
      try {
        await transporter.verify();
        console.log('SMTP connection verified');
  
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.response);
  
        res.json({
          message: '重置密碼郵件已發送',
          success: true,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        res.status(500).json({
          message: '發送重置密碼郵件失敗',
          error: emailError.message,
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        message: '處理忘記密碼請求失敗',
        error: error.message,
      });
    }
  };
  
  // 重置密碼
  const resetPassword = async (req, res) => {
    try {
      const { token, password } = req.body;
  
      if (!token || !password) {
        return res.status(400).json({ message: '缺少必要參數' });
      }
  
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ message: '重置密碼連結無效或已過期' });
      }
  
      // 更新密碼
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res.json({ message: '密碼重置成功' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        message: '重置密碼失敗',
        error: error.message,
      });
    }
  };
  
// 在啟動服務器時驗證 transporter
transporter.verify(function (error, success) {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

export { register, login, verifyEmail, resendVerification,  forgotPassword,
    resetPassword
   };
