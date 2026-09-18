export type Insight = { title: string; body: string }

export function computeInsight(avgWordsPerWritingDay: number, daysRemaining: number | null): Insight | null {
  if (avgWordsPerWritingDay >= 1800) {
    return {
      title: 'King Of Speed',
      body: `${Math.round(avgWordsPerWritingDay).toLocaleString()} words a day? You're on Stephen King's level.`,
    }
  }
  if (avgWordsPerWritingDay >= 400 && avgWordsPerWritingDay < 1000) {
    return {
      title: 'Hello, Hemingway',
      body: "Your writing pace matches Ernest Hemingway's famously modest daily habit.",
    }
  }
  if (daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30) {
    return {
      title: 'The End Is In Sight',
      body: `You've only got about ${daysRemaining} days to go.`,
    }
  }
  if (avgWordsPerWritingDay > 0) {
    return {
      title: 'Keep Going',
      body: `You're averaging ${Math.round(avgWordsPerWritingDay).toLocaleString()} words on the days you write. That adds up.`,
    }
  }
  return null
}