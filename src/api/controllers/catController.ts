// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import catModel from '../models/catModel';
import {validationResult} from 'express-validator';
import {Cat} from '../../interfaces/Cat';
import DBMessageResponse from './../../interfaces/DBMessageResponse';
import rectangleBounds from '../../utils/rectangleBounds';
import {User} from '../../interfaces/User';

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await catModel.find().populate('owner', 'user_name email');
    if (!cats) {
      console.log(cats);
      next(new CustomError('No cats found', 404));
      return;
    }
    console.log(cats);
    res.json(cats);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

const catGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const cat = await catModel
      .findById(req.params.id)
      .populate('owner', 'user_name email');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    res.json(cat);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
const catPost = async (
  req: Request<{}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    console.log(req.body);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }

    req.body.filename = <string>req.file?.filename;
    req.body.location = res.locals.coords;
    req.body.owner = (req.user as User)._id;
    const cat = await catModel.create(req.body);
    console.log(cat);
    const output: DBMessageResponse = {
      message: 'Cat created',
      data: cat,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
const catPut = async (
  req: Request<{id: string}, {}, Cat>,
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
    const cat = await catModel
      .findOneAndUpdate(
        {_id: req.params.id, owner: (req.user as User)._id},
        req.body,
        {
          new: true,
        }
      )
      .select('-__v');
    if (!cat) {
      next(new CustomError('Cat not found or ownership not confirmed', 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat updated',
      data: cat,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

const catDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }

    const cat = await catModel.findOneAndRemove({
      _id: req.params.id,
      owner: (req.user as User)._id,
    });
    if (!cat) {
      next(new CustomError('Cat not found or ownership not confirmed', 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat deleted',
      data: cat,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

const catGetByUser = async (
  req: Request,
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
    const cats = await catModel
      .find({owner: (req.user as User)._id})
      .populate('owner', 'user_name email');
    if (!cats) {
      next(new CustomError('No cats found', 404));
      return;
    }
    res.json(cats);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
const catGetByBoundingBox = async (
  req: Request<{}, {}, {}, {topRight: string; bottomLeft: string}>,
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
    const {topRight, bottomLeft} = req.query;
    const [trLat, trLng] = topRight.split(',');
    const [blLat, blLng] = bottomLeft.split(',');
    const bounds = rectangleBounds(
      {lat: trLat, lng: trLng},
      {lat: blLat, lng: blLng}
    );
    const cats = await catModel.find({
      location: {
        $geoWithin: {$geometry: bounds},
      },
    });
    if (!cats) {
      next(new CustomError('No cats found', 404));
      return;
    }
    res.json(cats);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Cat>,
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
    const user = req.user as User;
    if (user.role !== 'admin') {
      throw new CustomError('Not authorized', 401);
    }
    const cat = await catModel
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      })
      .select('-__v');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat updated',
      data: cat,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
const catDeleteAdmin = async (
  req: Request,
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
    const user = req.user as User;
    console.log(user);

    if (user.role !== 'admin') {
      throw new CustomError('Not authorized', 401);
    }
    const cat = await catModel
      .findByIdAndDelete(req.params.id)
      .populate('owner');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat deleted',
      data: cat,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
export {
  catDelete,
  catGet,
  catGetByBoundingBox,
  catGetByUser,
  catListGet,
  catPost,
  catPut,
  catDeleteAdmin,
  catPutAdmin,
};
