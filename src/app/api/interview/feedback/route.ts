import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { question, answer } = await req.json()
    if (!question || !answer) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey.includes('your-openai')) {
      return NextResponse.json(localFeedback(answer), { status: 200 })
    }

    const prompt = `You are an expert placement interviewer at a top tech company. 
A candidate was asked: "${question}"
Their answer was: "${answer}"

Evaluate this answer and respond in this exact format:
SCORE: [number from 0-100]
FEEDBACK: [2-3 sentences of constructive feedback]
TIP: [one specific actionable improvement tip]

Be encouraging but honest. Focus on content, clarity, and structure.`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!res.ok) return NextResponse.json(localFeedback(answer))

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''

    // Parse the structured response
    const scoreMatch = text.match(/SCORE:\s*(\d+)/)
    const feedbackMatch = text.match(/FEEDBACK:\s*(.+?)(?=TIP:|$)/s)
    const tipMatch = text.match(/TIP:\s*(.+)/s)

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : text
    const tip = tipMatch ? tipMatch[1].trim() : ''

    const fullFeedback = `${feedback}${tip ? `\n\n💡 **Tip:** ${tip}` : ''}`

    return NextResponse.json({ score, feedback: fullFeedback })
  } catch (err) {
    console.error('Interview feedback error:', err)
    return NextResponse.json(localFeedback(''))
  }
}

// Local fallback when no OpenAI key
function localFeedback(answer: string) {
  const words = answer.trim().split(/\s+/).length
  const score = Math.min(92, Math.max(52,
    58 +
    Math.min(18, words / 4) +
    (answer.toLowerCase().includes('example') || answer.toLowerCase().includes('instance') ? 8 : 0) +
    (answer.toLowerCase().includes('because') || answer.toLowerCase().includes('since') ? 5 : 0) +
    (answer.toLowerCase().includes('first') || answer.toLowerCase().includes('second') ? 5 : 0) +
    (words > 60 ? 6 : 0)
  ))

  const feedbacks = [
    { score, feedback: `Good answer with clear explanation. You covered the key concepts well.\n\n💡 **Tip:** Strengthen your response by adding a specific real-world example from your own experience or projects. Use the STAR method: Situation → Task → Action → Result.` },
    { score, feedback: `Solid response! Your understanding of the topic is evident.\n\n💡 **Tip:** Quantify your achievements where possible — numbers make your answer more credible. For example: "improved performance by 40%" or "reduced bugs by 60%".` },
    { score, feedback: `Nice work! Your answer was relevant and on-topic.\n\n💡 **Tip:** Structure your answer better next time — lead with the key point, then elaborate. Interviewers appreciate concise, well-organized responses that get to the point quickly.` },
  ]

  return feedbacks[Math.floor(Math.random() * feedbacks.length)]
}
