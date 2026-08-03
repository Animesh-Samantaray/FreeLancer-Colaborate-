import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../helper/generateToken.js";
import { comparePassword, hashPassword } from "../helper/hashPassword.js";
import { sendMail } from "../utils/sendMail.js";
import otpTemplate from "../utils/otpTemplete.js";
import resetPasswordTemplate from "../utils/resetPasswordOtpTemplete.js";



export const register = async (req, res) => {
  try {
    let {
      fullName,
      email,
      phone,
      password,
      role,
      avatar,
      admin_access_token
    } = req.body;

    const validRoles = ["client", "freelancer", "admin"];

if (!validRoles.includes(role)) {
  return res.status(400).json({
    success: false,
    message: "Invalid role.",
  });
}

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password and role are required.",
      });
    }

    
    fullName = fullName.trim();
    email = email.trim().toLowerCase();

    if (phone) phone = phone.trim();

    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

      if (role === "admin") {
  if (!admin_access_token || admin_access_token != process.env.ADMIN_ACCESS_TOKEN) {
    return res.status(403).json({
      success: false,
      message: "Invalid admin access token.",
    });
  }
}
    const hashedPassword = await hashPassword(password);


    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      avatar,
      authProvider: "local",
      
    });


    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In. Please continue with Google.",
      });
    }

   
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    
    const token = generateToken(user._id, user.role);

   
    user.password = undefined;

   
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// export const verifyLoginOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and OTP are required.",
//       });
//     }

//     const user = await User.findOne({ email: email.trim().toLowerCase() });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     if (!user.loginOTP) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP not found or expired. Please login again.",
//       });
//     }

//     if (user.loginOTPExpire < Date.now()) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP has expired. Please login again.",
//       });
//     }

//     if (user.loginOTP !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP.",
//       });
//     }

  
//     user.loginOTP = undefined;
//     user.loginOTPExpire = undefined;
//     await user.save();

    
//     const token = generateToken(user._id);

   
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful.",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         role: user.role,
//         createdAt: user.createdAt,
//         isVerified: user.isVerified,
//       },
//     });

//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };



// export const sendVerificationOTP = async (req, res) => {
//   try {
//     const email = (req.body.email || req.user?.email || "").trim().toLowerCase();
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required.",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "User is already verified.",
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     user.emailVerificationOTP = otp;
//     user.emailVerificationOTPExpire = Date.now() + 10 * 60 * 1000;
//     await user.save();

//     await sendMail(
//       user.email,
//       "Email Verification OTP",
//       otpTemplate(otp)
//     );

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent successfully.",
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const verifyEmail = async (req, res) => {
//   try {
//     const { otp } = req.body;
//     const email = (req.body.email || req.user?.email || "").trim().toLowerCase();

//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and OTP are required.",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "User is already verified.",
//       });
//     }

//     if (!user.emailVerificationOTP) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP not found or expired. Please try again.",
//       });
//     }

//     if (user.emailVerificationOTPExpire < Date.now()) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP has expired.",
//       });
//     }

//     if (user.emailVerificationOTP !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP.",
//       });
//     }

//     user.isVerified = true;
//     user.emailVerificationOTP = undefined;
//     user.emailVerificationOTPExpire = undefined;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Email verified successfully.",
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};





export const sendResetOTP = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendMail(
      user.email,
      "Password Reset OTP",
      resetPasswordTemplate(otp)
    );

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully.",
    });

  } catch (error) {
    console.error("Send Reset OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const changePassword = async (req, res) => {
  try {
    let { email, inputOtp, newPassword } = req.body;

    if (!email || !inputOtp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required.",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.passwordResetOTP || !user.passwordResetOTPExpire) {
      return res.status(400).json({
        success: false,
        message: "Please request a password reset OTP first.",
      });
    }

  
    if (Date.now() > user.passwordResetOTPExpire) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

   
    if (user.passwordResetOTP !== inputOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    
    user.password = hashedPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });

  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};