import mongoose from 'mongoose';

export default function isValidId(id) {
  return mongoose.isObjectIdOrHexString(id);
}
