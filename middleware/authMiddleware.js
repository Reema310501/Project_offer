import jwt from 'jsonwebtoken';

export const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authorization header missing or malformed" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};
