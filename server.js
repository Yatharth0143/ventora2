import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, User, Idea, Request, Message } from './db.js';

const app = express();
app.use(express.json({ limit: '20kb' }));

function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again.' });
  }
}

const role = (name) => (req, res, next) => req.user.role === name ? next() : res.status(403).json({ error: 'This page is for a different account type.' });
const publicIdea = (idea) => ({ _id: idea._id, title: idea.title, industry: idea.industry, stage: idea.stage, pitch: idea.pitch, problem: idea.problem, solution: idea.solution, funding: idea.funding, score: idea.score, status: idea.status });

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role: accountType } = req.body;
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || !password || password.length < 8 || !['innovator', 'investor'].includes(accountType)) {
      return res.status(400).json({ error: 'Enter your name, a valid email, a password of at least 8 characters, and choose a role.' });
    }
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ error: 'That email is already registered.' });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role: accountType });
    res.status(201).json({ token: jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' }) });
  } catch (error) {
    res.status(500).json({ error: 'Could not create your account.' });
  }
});

app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!user || !await bcrypt.compare(req.body.password || '', user.password)) return res.status(401).json({ error: 'Email or password is incorrect.' });
  res.json({ token: jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' }) });
});

app.get('/api/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

app.post('/api/onboard', auth, role('investor'), async (req, res) => {
  const { investorType, range } = req.body;
  const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === 'string').slice(0, 10) : [];
  const industries = list(req.body.industries);
  const stages = list(req.body.stages);
  await User.findByIdAndUpdate(req.user.id, { investorType, industries, stages, range, verified: true });
  res.json({ ok: true });
});

app.get('/api/ideas', auth, async (req, res) => {
  const ideas = req.user.role === 'innovator'
    ? await Idea.find({ owner: req.user.id }).sort({ createdAt: -1 })
    : await Idea.find({ status: 'Published' }).sort({ score: -1 }).populate('owner', 'name');
  res.json(ideas.map((idea) => req.user.role === 'innovator' ? idea : { ...publicIdea(idea), founder: idea.owner?.name || 'Innovator' }));
});

app.post('/api/ideas', auth, role('innovator'), async (req, res) => {
  const fields = ['title', 'industry', 'stage', 'pitch', 'problem'];
  if (fields.some((field) => !String(req.body[field] || '').trim()) || String(req.body.pitch).length > 140) return res.status(400).json({ error: 'Fill in the title, industry, stage, one-line pitch (140 characters max), and problem.' });
  const data = Object.fromEntries(['title', 'industry', 'stage', 'pitch', 'problem', 'solution', 'audience', 'market', 'businessModel', 'funding'].map((key) => [key, String(req.body[key] || '').trim()]));
  const score = Math.round(['problem', 'solution', 'audience', 'market', 'businessModel', 'funding'].filter((key) => data[key].length >= 25).length / 6 * 100);
  const idea = await Idea.create({ ...data, owner: req.user.id, score });
  res.status(201).json(idea);
});

app.get('/api/requests', auth, async (req, res) => {
  const query = req.user.role === 'innovator' ? { innovator: req.user.id } : { investor: req.user.id };
  res.json(await Request.find(query).sort({ createdAt: -1 }).populate('idea', 'title industry stage pitch score').populate('investor', 'name investorType verified').populate('innovator', 'name'));
});

app.post('/api/requests', auth, role('investor'), async (req, res) => {
  const investor = await User.findById(req.user.id);
  if (!investor.verified) return res.status(403).json({ error: 'Finish investor setup before sending a request.' });
  const idea = await Idea.findOne({ _id: req.body.ideaId, status: 'Published' });
  if (!idea) return res.status(404).json({ error: 'Idea not found.' });
  if (String(idea.owner) === req.user.id) return res.status(400).json({ error: 'You cannot request your own idea.' });
  const prior = await Request.findOne({ idea: idea.id, investor: req.user.id });
  if (prior) return res.status(409).json({ error: 'You already sent a request for this idea.' });
  await Request.create({ idea: idea.id, investor: req.user.id, innovator: idea.owner, note: String(req.body.note || '').slice(0, 500) });
  res.status(201).json({ ok: true });
});

app.patch('/api/requests/:id', auth, role('innovator'), async (req, res) => {
  if (!['Accepted', 'Declined'].includes(req.body.status)) return res.status(400).json({ error: 'Choose accept or decline.' });
  const request = await Request.findOneAndUpdate({ _id: req.params.id, innovator: req.user.id, status: 'Pending' }, { status: req.body.status }, { new: true });
  if (!request) return res.status(404).json({ error: 'Request not found.' });
  res.json(request);
});

app.get('/api/messages/:requestId', auth, async (req, res) => {
  const request = await Request.findOne({ _id: req.params.requestId, status: 'Accepted', $or: [{ investor: req.user.id }, { innovator: req.user.id }] });
  if (!request) return res.status(403).json({ error: 'Chat opens after a request is accepted.' });
  res.json(await Message.find({ request: request.id }).sort({ createdAt: 1 }).populate('sender', 'name'));
});

app.post('/api/messages/:requestId', auth, async (req, res) => {
  const text = String(req.body.text || '').trim();
  const request = await Request.findOne({ _id: req.params.requestId, status: 'Accepted', $or: [{ investor: req.user.id }, { innovator: req.user.id }] });
  if (!request) return res.status(403).json({ error: 'Chat opens after a request is accepted.' });
  if (!text || text.length > 2000) return res.status(400).json({ error: 'Write a message under 2,000 characters.' });
  res.status(201).json(await Message.create({ request: request.id, sender: req.user.id, text }));
});

const here = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(here, 'dist')));
  app.get('*', (_, res) => res.sendFile(path.join(here, 'dist', 'index.html')));
}

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`Ventora API running on http://localhost:${port}`))).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
