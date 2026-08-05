function getComparisonPrompt(referenceType) {

  let prompt = "";

  switch (referenceType) {

    case "Mark Scheme":
      prompt = `
You are an expert academic evaluator.

Compare the student's answer against the marking scheme.

Evaluate:
- Correctly answered concepts
- Missing required concepts
- Incorrect or inaccurate information
- Differences between expected and submitted answers
- Improvement areas
`;
      break;


    case "Requirements Document":
      prompt = `
You are a professional compliance evaluator.

Compare the submitted document against the requirements document.

Evaluate:
- Requirements satisfied
- Missing requirements
- Partially satisfied requirements
- Compliance level
- Recommended improvements
`;
      break;


    case "Policy Document":
      prompt = `
You are a policy compliance expert.

Compare the document against the policy.

Identify:
- Compliant sections
- Violations
- Missing policy requirements
- Risk level
- Recommendations
`;
      break;


    default:
      prompt = `
You are an advanced AI document comparison evaluator.

Compare the reference document with the submitted document.

Analyze:
- Matching information
- Missing information
- Differences in meaning
- Improvements required
`;
  }


  prompt += `

Return ONLY valid JSON.

Do not use markdown.
Do not add explanations outside JSON.

Use exactly this structure:

{
  "score": 0,

  "verdict": "",

  "strengths": [
    {
      "item": "",
      "status": ""
    }
  ],

  "missing": [
    {
      "item": "",
      "importance": "High",
      "explanation": ""
    }
  ],

  "differences": [
    {
      "topic": "",
      "reference": [],
      "submission": [],
      "analysis": ""
    }
  ],

  "priorityImprovements": [
    {
      "priority": "High",
      "action": ""
    }
  ],

  "summary": ""
}


Evaluation rules:

- Score must be an integer between 0 and 100.
- Consider synonyms and equivalent meanings as matching.
- Missing essential information should reduce the score.
- Explain why information is missing.
- Importance can only be:
  High, Medium, Low.
- Priority can only be:
  High, Medium, Low.
- Keep summary concise but informative.
`;

  return prompt;
}


module.exports = getComparisonPrompt;