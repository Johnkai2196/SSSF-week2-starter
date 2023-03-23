import {Point} from 'geojson';
import {Document} from 'mongoose';
import {User} from './User';

// TODO: cat interface
interface Cat extends Document {
  cat_name: string;
  owner: User | string;
  weight: number;
  filename: string;
  birthdate: Date;
  location: Point;
}
interface CatTest {
  _id?: string;
  cat_name?: string;
  owner?: User | string;
  filename?: string;
  weight?: number;
  birthdate?: Date;
  location?: Point;
}
export {Cat, CatTest};
