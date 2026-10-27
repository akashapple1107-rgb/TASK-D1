import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { api } from '../api'
import { validatePost } from '../postValidation'

export default function NewPost() {
  const { user, loading } = useAuth()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [failed, setFailed] = useState(false)
  const [type, setType] = useState('question')
  const [question, setQuestion] = useState({ title: '', abstract: '', body: '', tags: '' })
  const [article, setArticle] = useState({ title: '', abstract: '', body: '', tags: '' })
  const [errors, setErrors] = useState({})

  let draft = question
  let introduction = 'Describe your problem so the community can help.'
  let titlePlaceholder = 'Start your question with how, what, why, etc.'
  let bodyLabel = 'Describe your problem'
  let bodyPlaceholder = ''

  if (type === 'article') {
    draft = article
    introduction = 'Share your knowledge with the DEV@Deakin community.'
    titlePlaceholder = 'Enter a descriptive title'
    bodyLabel = 'Article Text'
    bodyPlaceholder = 'Write your article here'
  }

  function chooseQuestion() {
    setType('question')
    setErrors({})
  }

  function chooseArticle() {
    setType('article')
    setErrors({})
  }

  function changeField(event) {
    const fieldName = event.target.name
    const value = event.target.value

    // Copy the current draft before changing it. React state should not be edited directly.
    const updatedDraft = {
      title: draft.title,
      abstract: draft.abstract,
      body: draft.body,
      tags: draft.tags
    }
    updatedDraft[fieldName] = value

    if (type === 'question') {
      setQuestion(updatedDraft)
    } else {
      setArticle(updatedDraft)
    }

    // Keep other errors, but clear the error for the field being edited.
    const remainingErrors = {}
    for (const name in errors) {
      if (name !== fieldName) {
        remainingErrors[name] = errors[name]
      }
    }
    setErrors(remainingErrors)
  }

  async function submit(event) {
    event.preventDefault()
    if (busy || !user) return
    setFeedback(''); setFailed(false)
    const newErrors = validatePost(type, draft)
    setErrors(newErrors)
    const invalidFields = Object.keys(newErrors)

    if (invalidFields.length > 0) {
      window.alert('Your post could not be sent. Please correct the highlighted fields.')
      const firstField = document.getElementById('post-' + invalidFields[0])
      if (firstField) {
        firstField.focus()
      }
      return
    }

    setBusy(true)
    try {
      const result = await api('posts', { type, ...draft })
      setFeedback(result.message)
      window.alert(result.message)
      const empty = { title: '', abstract: '', body: '', tags: '' }
      if (type === 'question') setQuestion(empty); else setArticle(empty)
    } catch (error) { setFeedback(error.message); setFailed(true); if (error.fields) setErrors(error.fields) }
    finally { setBusy(false) }
  }

  return (
    <section className="post-page" aria-labelledby="post-heading">
      <h1 className="post-bar" id="post-heading">New Post</h1>
      <form onSubmit={submit} noValidate>
        {!loading && !user && <p className="post-feedback"><Link to="/login">Log in</Link> to save a question or article.</p>}
        {feedback && <p className={"post-feedback " + (failed ? "error" : "success")} role={failed ? "alert" : "status"}>{feedback}</p>}
        <fieldset className="post-type">
          <legend>Select Post Type:</legend>
          <label>
            <input type="radio" name="postType" value="question" checked={type === 'question'} onChange={chooseQuestion} />
            Question
          </label>
          <label>
            <input type="radio" name="postType" value="article" checked={type === 'article'} onChange={chooseArticle} />
            Article
          </label>
        </fieldset>
        <h2 className="post-bar">What do you want to ask or share</h2>
        <p className="post-intro">{introduction}</p>

        <div className="post-field post-inline">
          <label htmlFor="post-title">Title</label>
          <input id="post-title" name="title" value={draft.title} onChange={changeField}
            placeholder={titlePlaceholder} maxLength={120} required
            aria-invalid={Boolean(errors.title)} aria-describedby={errors.title && 'error-title'} />
          {errors.title && <p className="post-error" id="error-title" role="alert">{errors.title}</p>}
        </div>

        {type === 'article' && (
          <div className="post-field post-abstract">
            <label htmlFor="post-abstract">Abstract</label>
            <textarea id="post-abstract" name="abstract" value={draft.abstract} onChange={changeField}
              placeholder="Enter a 1-paragraph abstract" maxLength={500} required
              aria-invalid={Boolean(errors.abstract)} aria-describedby={errors.abstract && 'error-abstract'} />
            {errors.abstract && <p className="post-error" id="error-abstract" role="alert">{errors.abstract}</p>}
          </div>
        )}

        <div className="post-field post-body">
          <label htmlFor="post-body">{bodyLabel}</label>
          <textarea id="post-body" name="body" value={draft.body} onChange={changeField}
            placeholder={bodyPlaceholder} maxLength={10000} required
            aria-invalid={Boolean(errors.body)} aria-describedby={errors.body && 'error-body'} />
          {errors.body && <p className="post-error" id="error-body" role="alert">{errors.body}</p>}
        </div>

        <div className="post-field post-inline">
          <label htmlFor="post-tags">Tags</label>
          <input id="post-tags" name="tags" value={draft.tags} onChange={changeField}
            placeholder={'Please add up to 3 tags to describe what your ' + type + ' is about e.g., Java, React'}
            maxLength={79} required aria-invalid={Boolean(errors.tags)} aria-describedby={errors.tags && 'error-tags'} />
          {errors.tags && <p className="post-error" id="error-tags" role="alert">{errors.tags}</p>}
        </div>

        <p className="post-hint">Use 1–3 comma-separated tags. Title: 5–120 characters. {type === 'article' && 'Abstract: 20–500 characters. '}Text: 20–10,000 characters.</p>
        <div className="post-actions"><button type="submit" disabled={busy || loading || !user}>{busy ? "Saving…" : "Post"}</button></div>
      </form>
    </section>
  )
}
