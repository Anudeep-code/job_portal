const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

const jobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'PixelCraft',
    location: 'Remote',
    salary: '₹8-12 LPA',
    description: 'Build responsive user interfaces for our hiring platform.',
    applicants: 0,
    postedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Node.js Backend Engineer',
    company: 'DataBridge',
    location: 'Bengaluru',
    salary: '₹10-15 LPA',
    description: 'Create scalable APIs for job posting and candidate workflows.',
    applicants: 0,
    postedAt: new Date().toISOString(),
  },
];

let nextJobId = jobs.length + 1;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/jobs', (_req, res) => {
  res.json(jobs);
});

app.post('/api/jobs', (req, res) => {
  const { title, company, location, salary = '', description } = req.body || {};

  if (![title, company, location, description].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'title, company, location, and description are required.' });
  }

  const job = {
    id: nextJobId++,
    title: title.trim(),
    company: company.trim(),
    location: location.trim(),
    salary: typeof salary === 'string' ? salary.trim() : '',
    description: description.trim(),
    applicants: 0,
    postedAt: new Date().toISOString(),
  };

  jobs.unshift(job);
  return res.status(201).json(job);
});

app.post('/api/jobs/:id/apply', (req, res) => {
  const jobId = Number(req.params.id);
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  job.applicants += 1;
  return res.json({ message: 'Application submitted successfully.', job });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
