import {
  Document,
  FilterQuery,
  Model,
  ObjectId,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { DeleteResult } from 'mongodb';

export class EntityRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: unknown): Promise<T> {
    const entity = new this.model(data);
    return entity.save();
  }

  findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  findById(id: string | ObjectId): Promise<T | null> {
    const filter = { _id: id };
    return this.findOne(filter);
  }

  findOneAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<unknown>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, options).exec();
  }

  findByIdAndUpdate(
    id: string | ObjectId,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    const filter = { _id: id };
    return this.findOneAndUpdate(filter, update, options);
  }

  async find(
    filter: FilterQuery<T>,
    { limit, offset }: { limit: number; offset: number },
  ): Promise<T[]> {
    return this.model.find<T>(filter).skip(offset).limit(limit).exec();
  }

  async findByIdAndDelete(
    id: string | ObjectId,
    options?: QueryOptions<T> | null,
  ): Promise<T> {
    return this.model.findByIdAndDelete(id, options).exec();
  }

  async deleteOne(model: Model<T>): Promise<DeleteResult> {
    return this.model.deleteOne(model);
  }

  async deleteMany(filter: FilterQuery<T>): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
  }
}
