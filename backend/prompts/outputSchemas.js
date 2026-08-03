module.exports = {

story: `
{
  "summary": "",
  "characters": [],
  "themes": [],
  "lessons": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "score": 0
}
`,

general: `
{
  "documentType": "",
  "executiveSummary": "",
  "keyFindings": [],
  "risks": [],
  "recommendations": [],
  "qualityAnalysis": {
    "writingQuality": 0,
    "structure": 0,
    "themes": 0,
    "consistency": 0
  },
  "overallScore": 0,
  "finalVerdict": "",
  "evaluationSummary": ""
}
  
FIELD RULES:

finalVerdict:
- MUST contain exactly one allowed word.
- NEVER contain explanations.
- NEVER contain sentences.

Allowed:
Excellent
Good
Fair
Poor
High Risk

evaluationSummary:
- MUST contain the explanation.
- MUST only discuss quality factors.
- MUST not mention the document topic, characters, story, names, events, or examples.

overallScore:
- MUST be an integer from 0-100.
- Never use a 10-point scale.
- Example: 8/10 must become 80.
  `
  
};