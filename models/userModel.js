import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name must be at most 50 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    minlength: [5, 'Email must be at least 5 characters long'],
    maxlength: [100, 'Email must be at most 100 characters long'],
    match: [/.+@.+\..+/, 'Email must be a valid email address'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    maxlength: [100, 'Password must be at most 100 characters long']
  }
}, {
  timestamps: true
}
);


const User = mongoose.model('User', userSchema);

export default User;