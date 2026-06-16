import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const initialForm = {
  title: '',
  company: '',
  location: '',
  salary: '',
  description: '',
}

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    let isMounted = true

    fetch(`${API_URL}/jobs`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load jobs right now.')
        }
        return response.json()
      })
      .then((data) => {
        if (!isMounted) {
          return
        }
        setJobs(data)
        setError('')
      })
      .catch((fetchError) => {
        if (isMounted) {
          setError(fetchError.message)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const onInputChange = (event) => {
    const { name, value } = event.target
    setForm((prevForm) => ({ ...prevForm, [name]: value }))
  }

  const onCreateJob = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const responseBody = await response.json()
        throw new Error(responseBody.error || 'Could not create job posting.')
      }

      const newJob = await response.json()
      setJobs((prevJobs) => [newJob, ...prevJobs])
      setForm(initialForm)
      setMessage('Job posted successfully.')
      setError('')
    } catch (postError) {
      setError(postError.message)
    }
  }

  const onApply = async (jobId) => {
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Could not submit application.')
      }

      const data = await response.json()
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === jobId ? data.job : job)),
      )
      setMessage(data.message)
      setError('')
    } catch (applyError) {
      setError(applyError.message)
    }
  }

  return (
    <main className="container">
      <header>
        <h1>Job Portal</h1>
        <p>Find opportunities, post openings, and apply in one place.</p>
      </header>

      <section className="panel">
        <h2>Post a new job</h2>
        <form className="job-form" onSubmit={onCreateJob}>
          <input
            required
            name="title"
            value={form.title}
            onChange={onInputChange}
            placeholder="Job title"
          />
          <input
            required
            name="company"
            value={form.company}
            onChange={onInputChange}
            placeholder="Company"
          />
          <input
            required
            name="location"
            value={form.location}
            onChange={onInputChange}
            placeholder="Location"
          />
          <input
            name="salary"
            value={form.salary}
            onChange={onInputChange}
            placeholder="Salary (optional)"
          />
          <textarea
            required
            name="description"
            value={form.description}
            onChange={onInputChange}
            placeholder="Job description"
            rows="3"
          />
          <button type="submit">Post Job</button>
        </form>
      </section>

      {message ? <p className="message success">{message}</p> : null}
      {error ? <p className="message error">{error}</p> : null}

      <section className="panel">
        <h2>Available jobs</h2>
        {loading ? <p>Loading jobs...</p> : null}

        {!loading && jobs.length === 0 ? <p>No jobs posted yet.</p> : null}

        <div className="jobs-grid">
          {jobs.map((job) => (
            <article className="job-card" key={job.id}>
              <h3>{job.title}</h3>
              <p>
                <strong>{job.company}</strong> • {job.location}
              </p>
              {job.salary ? <p>{job.salary}</p> : null}
              <p>{job.description}</p>
              <p>Applicants: {job.applicants}</p>
              {job.postedAt && (
                <p>
                  Posted: {new Date(job.postedAt).toLocaleDateString()}
                </p>
              )}
              <button type="button" onClick={() => onApply(job.id)}>
                Apply Now
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
