import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['innovator', 'investor'], required: true },
  verified: { type: Boolean, default: false },
  investorType: String,
  industries: [String],
  stages: [String],
  range: String,
});

const ideaSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  industry: { type: String, required: true },
  stage: { type: String, required: true },
  pitch: { type: String, required: true, maxlength: 140 },
  problem: { type: String, required: true },
  solution: String,
  audience: String,
  market: String,
  businessModel: String,
  funding: String,
  score: Number,
  status: { type: String, default: 'Published' },
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  innovator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: String,
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Idea = mongoose.model('Idea', ideaSchema);
export const Request = mongoose.model('Request', requestSchema);
export const Message = mongoose.model('Message', messageSchema);

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('Add MONGODB_URI to .env');
  if (!process.env.JWT_SECRET) throw new Error('Add JWT_SECRET to .env');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}
