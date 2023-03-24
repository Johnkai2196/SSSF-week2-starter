// TODO: user interface
import {Document} from 'mongoose';

interface User extends Document {
  user_name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

interface UserOutput {
  _id: string;
  user_name: string;
  email: string;
}
interface LoginUser {
  user_name: string;
  password: string;
}
interface UserTest {
  _id?: string;
  user_name?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
}

export {User, UserOutput, LoginUser, UserTest};
