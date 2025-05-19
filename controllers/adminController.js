import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role || 'admin',
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const newAdmin = await Admin.create({ name, email, password, role: 'admin' });

    res.status(201).json({
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      token: generateToken(newAdmin),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
