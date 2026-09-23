export type Quote = { text: string; author: string }

const QUOTES: Quote[] = [
  { text: 'The first draft is just you telling yourself the story.', author: 'Terry Pratchett' },
  { text: "You can't edit a blank page.", author: 'Jodi Picoult' },
  { text: "Start before you're ready.", author: 'Steven Pressfield' },
  { text: 'A word after a word after a word is power.', author: 'Margaret Atwood' },
  { text: 'The scariest moment is always just before you start.', author: 'Stephen King' },
  { text: 'You fail only if you stop writing.', author: 'Ray Bradbury' },
  { text: 'Just write every day of your life.', author: 'Ray Bradbury' },
  { text: "Get it down. Take chances. It may be bad, but it's the only way.", author: 'William Faulkner' },
  { text: "Don't get it right, just get it written.", author: 'James Thurber' },
  { text: 'Write what should not be forgotten.', author: 'Isabel Allende' },
  { text: 'Either write something worth reading or do something worth writing.', author: 'Benjamin Franklin' },
]

export function getRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}
