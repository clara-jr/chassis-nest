import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, ObjectId } from 'mongoose';

@Schema()
export class Cat extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, index: true, required: true })
  index: ObjectId;

  @Prop(String)
  string: string;

  @Prop(Number)
  number: number;

  @Prop({ type: Boolean, default: false })
  boolean: boolean;

  @Prop(Date)
  date: Date;

  @Prop([String])
  stringsArray: string[];

  @Prop([{ string: String, date: Date }])
  objectsArray: [
    {
      string: string;
      date: Date;
    },
  ];

  @Prop({ string: String, number: Number })
  embedded: {
    string: string;
    number: number;
  };

  @Prop({ type: Object })
  object: object;
}

export const CatSchema = SchemaFactory.createForClass(Cat);

/**
 * Compound index referencing multiple properties
 *
 * In this example:
 * We passed a value of 1 (to index) which specifies that the index
 * should order these items in an Ascending order.
 *
 * We passed string a value of (negative) -1 which specifies that
 * the index should order these items in Descending order.
 */
CatSchema.index({ index: 1, string: -1 });
