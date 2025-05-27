const User = require('../models/User');
const bcrypt = require('bcrypt');

/**
 * AuthController: Handles user registration and login operations.
 */

/**
 * Register a new user.
 * 1. Check if the email is already in use.
 * 2. Hash the password using bcrypt.
 * 3. Create and save the new user document.
 * 4. Respond with status 201 on success.
 *
 * @param {Object} req - Express request object (expects { username, email, password } in body).
 * @param {Object} res - Express response object.
 */
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1) Prevent duplicate registrations
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // 2) Securely hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3) Create and save the user record
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // 4) Send success response
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * Authenticate an existing user.
 * 1. Find user by email.
 * 2. Compare provided password with stored hash.
 * 3. Respond with status 200 and user data on success.
 *
 * @param {Object} req - Express request object (expects { email, password } in body).
 * @param {Object} res - Express response object.
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1) Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // 2) Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // 3) Authentication successful
    return res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
