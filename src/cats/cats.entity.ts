import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Cat extends Document {
  @Prop()
  string: string;

  @Prop()
  number: number;

  @Prop()
  boolean: boolean;

  @Prop()
  date: Date;

  @Prop([String])
  stringsArray: string[];

  @Prop()
  objectsArray: [
    {
      string: string;
      date: Date;
    },
  ];

  @Prop()
  embedded: {
    string: string;
    number: number;
  };

  @Prop()
  object: object;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
