import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../context/useUser';

const Welcome = () => {
  const [formData, setFormData] = useState({
    fullName: '', age: '', grade: '', school: '', location: '', interests: '',
  });
  const [error, setError] = useState('');
  const { user, start } = useUser();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const details = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value.trim()])
    );

    if (!details.fullName || !details.location) {
      setError('Please enter your name and where you live.');
      return;
    }

    start(details);
    navigate('/dashboard', { replace: true });
  };

  return (
    <section className="welcome-page">
      <div className="welcome-page__hero panel panel--hero">
        <p className="eyebrow">Volunteer + internship opportunities</p>
        <h1 className="display-title">Build a profile once. Explore smarter matches faster.</h1>
        <p className="lead">
          PathFinder finds real local volunteer and internship opportunities near you,
          ranks them by fit, and writes your outreach email with one click.
        </p>

        <div className="feature-grid">
          <article className="feature-card">
            <p className="feature-card__number">01</p>
            <h2>Profile-aware matching</h2>
            <p>Turn your skills, interests, and goals into ranked local opportunities.</p>
          </article>
          <article className="feature-card">
            <p className="feature-card__number">02</p>
            <h2>Live web scraping</h2>
            <p>Real opportunities found by searching the web, fresh every time you search.</p>
          </article>
          <article className="feature-card">
            <p className="feature-card__number">03</p>
            <h2>One-click outreach</h2>
            <p>Draft and send a personalised email to any opportunity in seconds.</p>
          </article>
        </div>
      </div>

      <div className="welcome-page__form panel">
        <div className="section-copy">
          <p className="eyebrow">Welcome</p>
          <h2>Tell us a little about you</h2>
          <p>
            No account needed. Everything is saved in this browser. You can add skills,
            goals, and a resume later on your Profile page.
          </p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Full name</span>
            <input
              className="input"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Alex Chen"
              autoComplete="name"
              required
            />
          </label>

          <label className="field">
            <span>Where do you live?</span>
            <input
              className="input"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
              required
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Age (optional)</span>
              <input
                className="input"
                type="number"
                name="age"
                min="10"
                max="99"
                value={formData.age}
                onChange={handleChange}
                placeholder="16"
              />
            </label>

            <label className="field">
              <span>Grade (optional)</span>
              <select className="input" name="grade" value={formData.grade} onChange={handleChange}>
                <option value="">Select a level</option>
                <option value="high-school">High school</option>
                <option value="college">College</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>School (optional)</span>
            <input
              className="input"
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="Lincoln High School"
            />
          </label>

          <label className="field">
            <span>Interests (optional)</span>
            <input
              className="input"
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="Animals, computer science, healthcare"
            />
          </label>

          {error && <p className="status-message status-message--error">{error}</p>}

          <div style={{ marginBottom: 8 }} />
          <button className="button button--primary button--full" type="submit">
            Get started
          </button>
        </form>
      </div>
    </section>
  );
};

export default Welcome;
