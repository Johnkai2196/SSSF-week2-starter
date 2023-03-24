// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from req.user. No need for database query

import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import CustomError from '../../classes/CustomError';
import {User} from '../../interfaces/User';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
const salt = bcrypt.genSaltSync(10);

const userGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role ');
    if (!user) {
      next(new CustomError('No user found', 404));
      return;
    }
    res.json(user);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.find().select('-password -role ');
    if (!users) {
      next(new CustomError('No users found', 404));
      return;
    }
    res.json(users);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, salt);
    const userPost = await userModel.create(req.body);

    const output: DBMessageResponse = {
      message: 'User created',
      data: {
        _id: userPost._id,
        user_name: userPost.user_name,
        email: userPost.email,
      },
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

const userPutCurrent = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const user = req.body;
    console.log(req.body, req.user);
    if (user.password) {
      user.password = bcrypt.hashSync(user.password, salt);
    }
    const userPut = await userModel
      .findByIdAndUpdate((req.user as User)._id, user, {new: true})
      .select('-password -role ');
    if (!userPut) {
      next(new CustomError('No user found', 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'User updated',
      data: userPut,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
const userDeleteCurrent = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const userDelete = await userModel
      .findByIdAndDelete((req.user as User)._id)
      .select('-password -role ');
    if (!userDelete) {
      next(new CustomError('No user found', 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'User deleted',
      data: userDelete,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
const checkToken = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }

    res.json({
      _id: (req.user as User)._id,
      user_name: (req.user as User).user_name,
      email: (req.user as User).email,
    });
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

export {
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};
