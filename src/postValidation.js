export function validatePost(type, draft) {
  const errors = {}

  if (type !== 'question' && type !== 'article') {
    errors.type = 'Choose a valid post type.'
    return errors
  }

  const title = draft.title.trim()
  const body = draft.body.trim()

  if (title.length < 5 || title.length > 120) {
    errors.title = 'Enter a title between 5 and 120 characters.'
  }
  if (body.length < 20 || body.length > 10000) {
    errors.body = 'Enter between 20 and 10,000 characters.'
  }

  if (type === 'article') {
    const abstract = draft.abstract.trim()
    // A blank line separates paragraphs.
    const paragraphBreak = /\r?\n\s*\r?\n/
    if (abstract.length < 20 || abstract.length > 500) {
      errors.abstract = 'Enter an abstract between 20 and 500 characters.'
    } else if (paragraphBreak.test(abstract)) {
      errors.abstract = 'Keep your abstract to one paragraph.'
    }
  }

  const tags = draft.tags.split(',')
  let hasEmptyTag = false
  let hasInvalidTag = false
  let hasDuplicateTag = false
  const usedTags = []
  // A tag starts with a letter or number, followed by up to 24 allowed characters.
  const tagPattern = /^[a-zA-Z0-9][a-zA-Z0-9 .+#-]{0,24}$/

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i].trim()
    if (tag === '') {
      hasEmptyTag = true
    }
    if (!tagPattern.test(tag)) {
      hasInvalidTag = true
    }

    const lowerCaseTag = tag.toLowerCase()
    if (usedTags.includes(lowerCaseTag)) {
      hasDuplicateTag = true
    }
    usedTags.push(lowerCaseTag)
  }

  if (tags.length > 3 || hasEmptyTag) {
    errors.tags = 'Enter 1 to 3 tags, separated by commas, without empty tags.'
  } else if (hasInvalidTag) {
    errors.tags = 'Each tag must be 1–25 characters: letters, numbers, spaces, . + # or -.'
  } else if (hasDuplicateTag) {
    errors.tags = 'Use distinct tags.'
  }

  return errors
}
