import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.js';
import User from '../models/userModel.js';

export const signup = async(req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, password } = req.body;
     
    //check if there is existing user

    const user = await User.findOne({ email});
    if(user) {
      const error = new Error('User already exists with this email');
      error.statusCode = 400;
      throw error;
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user
    const newUser = await User.create([{
      name,
      email,
      password: hashedPassword
    }], { session });
    // jwt token
    const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created Successfully",
      data: {
        token,
        user: newUser[0]
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}

export const signin = async(req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const IsPasswordValid = await bcrypt.compare(password, user.password);
    if (!IsPasswordValid) {
      const error = new Error('Invalid Password');
      error.statusCode = 401;
      throw error;
    }

    //jwt token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(200).json({
      success: true,
      message: "User logged in Successfully",
      data: {
        token,
        user: user
      }
    });
  } catch (error) {
    next(error);
  }
}

export const signout = async(req, res, next) => {
  try {
    // Stateless JWT: client should discard the token. Optionally implement blacklist/rotation later.
    res.status(200).json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    next(error);
  }
}