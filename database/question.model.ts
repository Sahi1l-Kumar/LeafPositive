import { Schema, models, model, Types, Document } from "mongoose";

export interface IQuestion {
  title: string;
  content: string;
  views: number;
  answers: number;
  upvotes: number;
  downvotes: number;
  author: Types.ObjectId;
  imageUrl?: string;
  crop?: string;
}

export interface IQuestionDoc extends IQuestion, Document {}
const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    views: { type: Number, default: 0 },
    answers: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String },
    crop: { type: String },
  },
  { timestamps: true }
);

const Question =
  models?.Question || model<IQuestion>("Question", QuestionSchema);

export default Question;
