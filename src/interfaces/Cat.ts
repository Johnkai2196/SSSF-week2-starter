import {Point} from 'geojson';
import {Document} from 'mongoose';
import {User} from './User';

// TODO: cat interface
interface Cat extends Document {
  cat_name: string;
  owner: User | string;
  weight: number;
  birthdate: Date;
  cords: Point;
}
export {Cat};
