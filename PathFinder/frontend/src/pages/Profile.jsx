import { startTransition, useEffect, useState } from 'react';
import { useUser } from '../context/useUser';
import { parseResume } from '../services/resumeService';
import { emptyProfile, getProfileCompletion, splitCommaSeparated } from '../services/profileUtils';

const hasItem = (list, item) =>
  splitCommaSeparated(list).some((existing) => existing.toLowerCase() === item.toLowerCase());

const Profile = () => {
  const { profile, saveProfile } = useUser();
  const [formData, setFormData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setFormData({ ...emptyProfile, ...profile });
  }, [profile]);

  const completion = getProfileCompletion(formData);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // lets the same file be chosen again after an error

    if (!file) {
      return;
    }

    setIsParsingResume(true);
    setUploadError('');
    setStatusMessage(`Parsing ${file.name} with AI...`);

    try {
      const parsedResume = await parseResume(file, formData);
      const nothingNew = !parsedResume.extractedSkills.length && !parsedResume.suggestedInterests.length;

      startTransition(() => {
        setFormData((current) => ({
          ...current,
          resumeFileName: file.name,
          resumeInsights: parsedResume,
          skills: current.skills.trim() || parsedResume.extractedSkills.join(', '),
          interests: current.interests.trim() || parsedResume.suggestedInterests.join(', '),
        }));
      });

      if (parsedResume.isFallback) {
        setStatusMessage('AI resume parsing is unavailable, so your file was not read. The suggestions below are generic, based on your profile.');
      } else if (nothingNew) {
        setStatusMessage('Resume read. Every skill and interest in it is already in your profile.');
      } else {
        setStatusMessage('Resume read. New skills and interests from it are listed for you to add.');
      }
    } catch (err) {
      setStatusMessage('');
      setUploadError(err.message);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving profile...');

    try {
      await saveProfile(formData);
      setStatusMessage('Profile saved. Your dashboard matches will reflect the latest updates.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Student profile</p>
          <h1>Shape the signals behind your opportunity matches.</h1>
          <p className="lead">
            Save coursework, interests, goals, and resume context so the app can rank better
            internships and research roles.
          </p>
        </div>

        <div className="stat-grid">
          <article className="stat-card">
            <span className="stat-card__label">Completion</span>
            <strong>{completion}%</strong>
            <p>Based on core onboarding fields.</p>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Resume status</span>
            <strong>{formData.resumeFileName ? 'Uploaded' : 'Pending'}</strong>
            <p>{formData.resumeFileName || 'Add a resume to extract skills automatically.'}</p>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Database</span>
            <strong>This browser</strong>
            <p>Your profile is saved only in this browser. No account needed.</p>
          </article>
        </div>
      </header>

      <div className="page-grid">
        <form className="panel stack-lg" onSubmit={handleSubmit}>
          <div className="section-copy">
            <p className="eyebrow">Core details</p>
            <h2>Academic and personal background</h2>
          </div>

          {statusMessage ? <p className="status-message">{statusMessage}</p> : null}

          <div className="form-grid">
            <label className="field">
              <span>Full name</span>
              <input
                className="input"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Avery Johnson"
              />
            </label>

            <label className="field">
              <span>School</span>
              <input
                className="input"
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="University of Washington"
              />
            </label>

            <label className="field">
              <span>Education</span>
              <input
                className="input"
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="B.S. Computer Science, class of 2028"
              />
            </label>

            <label className="field">
              <span>Location</span>
              <input
                className="input"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Seattle, WA"
              />
            </label>

            <label className="field">
              <span>Age</span>
              <input
                className="input"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="19"
              />
            </label>

            <label className="field">
              <span>Grade</span>
              <select className="input" name="grade" value={formData.grade} onChange={handleChange}>
                <option value="">Select a level</option>
                <option value="high-school">High school</option>
                <option value="college">College</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Skills</span>
            <input
              className="input"
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Python, data analysis, public speaking"
            />
          </label>

          <label className="field">
            <span>Interests</span>
            <input
              className="input"
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="AI, neuroscience, startups, healthcare equity"
            />
          </label>

          <label className="field">
            <span>Experience</span>
            <textarea
              className="input input--textarea"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Hackathons, clubs, volunteer work, classes, research labs, part-time jobs..."
            />
          </label>

          <label className="field">
            <span>Goals</span>
            <textarea
              className="input input--textarea"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="What kinds of internships or research environments are you targeting?"
            />
          </label>

          <label className="field">
            <span>Other basic info</span>
            <textarea
              className="input input--textarea input--sm"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Add context like availability, clubs, certifications, or career story."
            />
          </label>

          <div className="upload-card">
            <div>
              <p className="eyebrow">Resume upload</p>
              <h2>Attach a resume</h2>
              <p>
                Upload your resume (PDF or Word .docx) to automatically extract skills and interests.
              </p>
            </div>

            <label className="button button--secondary button--file">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeUpload}
                hidden
              />
              {isParsingResume ? 'Parsing resume...' : 'Upload'}
            </label>
          </div>

          {uploadError && <p className="status-message status-message--error">{uploadError}</p>}

          {formData.resumeFileName ? (
            <div className="tag-row">
              <span className="tag tag--soft">{formData.resumeFileName}</span>
              <span className="tag tag--soft">{formData.resumeInsights?.isFallback ? 'Not analysed' : 'Parsed'}</span>
            </div>
          ) : null}

          <div className="button-row">
            <button className="button button--primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>

        <aside className="panel stack-lg">
          <div className="section-copy">
            <p className="eyebrow">Live summary</p>
            <h2>What the app sees about you</h2>
          </div>

          <div className="completion-meter">
            <div className="completion-meter__bar">
              <span style={{ width: `${completion}%` }} />
            </div>
            <p>{completion}% of key fields completed</p>
          </div>

          <div className="summary-list">
            <article className="summary-list__item">
              <span>Skills snapshot</span>
              <p>{formData.skills || 'Add a few skills to improve matching quality.'}</p>
            </article>
            <article className="summary-list__item">
              <span>Interest areas</span>
              <p>{formData.interests || 'Research domains, functions, or industries can go here.'}</p>
            </article>
            <article className="summary-list__item">
              <span>Experience signal</span>
              <p>{formData.experience || 'Clubs, projects, and coursework all count here.'}</p>
            </article>
          </div>

          {formData.resumeInsights ? (
            <div className="resume-insights">
              <p className="eyebrow">Resume insights</p>
              <h2>{formData.resumeInsights.recommendedTrack}</h2>
              <p>{formData.resumeInsights.summary}</p>

              <div className="stack">
                <div>
                  <p className="resume-insights__label">New skills from your resume (click to add)</p>
                  {!formData.resumeInsights.extractedSkills.length && <p>None. They're all in your profile already.</p>}
                  <div className="tag-row">
                    {formData.resumeInsights.extractedSkills.map((skill) => {
                      const alreadyAdded = hasItem(formData.skills, skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          className="tag"
                          style={{ cursor: alreadyAdded ? 'default' : 'pointer', border: 'none', fontFamily: 'inherit', opacity: alreadyAdded ? 0.6 : 1 }}
                          onClick={() => {
                            if (alreadyAdded) return;
                            setFormData((c) => {
                              const current = c.skills.trim();
                              return { ...c, skills: current ? `${current}, ${skill}` : skill };
                            });
                          }}
                        >
                          {alreadyAdded ? `${skill} (added)` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="resume-insights__label">New interests from your resume (click to add)</p>
                  {!formData.resumeInsights.suggestedInterests.length && <p>None. They're all in your profile already.</p>}
                  <div className="tag-row">
                    {formData.resumeInsights.suggestedInterests.map((interest) => {
                      const alreadyAdded = hasItem(formData.interests, interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          className={alreadyAdded ? 'tag' : 'tag tag--soft'}
                          style={{ cursor: alreadyAdded ? 'default' : 'pointer', border: 'none', fontFamily: 'inherit' }}
                          onClick={() => {
                            if (alreadyAdded) return;
                            setFormData((c) => {
                              const current = c.interests.trim();
                              return { ...c, interests: current ? `${current}, ${interest}` : interest };
                            });
                          }}
                        >
                          {alreadyAdded ? `${interest} (added)` : `+ ${interest}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h2>No resume insights yet
              </h2>
              <p>Upload your resume to automatically extract skills and interests.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};

export default Profile;
