import {Point} from 'geojson';
import {Document, Types} from 'mongoose';
import {User} from './User';

// TODO: cat interface
interface Cat extends Document {
  cat_name: string;
  owner: Types.ObjectId | User;
  weight: number;
  filename: string;
  birthdate: Date;
  location: Point;
}
interface CatTest {
  _id?: string;
  cat_name?: string;
  owner?: Types.ObjectId | User;
  filename?: string;
  weight?: number;
  birthdate?: Date;
  location?: Point;
}
export {Cat, CatTest};
