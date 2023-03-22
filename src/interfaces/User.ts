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

export {User, UserOutput};
