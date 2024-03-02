export class Cat {
  string: string;
  number: number;
  boolean: boolean;
  date: Date;
  stringsArray: [string];
  objectsArray: [
    {
      string: string;
      date: Date;
    },
  ];
  embedded: {
    string: string;
    number: number;
  };
  object: object;
}
