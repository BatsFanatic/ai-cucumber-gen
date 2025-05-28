import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { keywords } = req.body;

  //ai prompt
  const prompt = `You are a QA engineer. Write a Gherkin (.feature) file using these keywords:
    "${keywords.join(', ')}"
      Use the format:
      Feature: <Title>
        Scenario: <Title>
          Given ...
          When ...
          Then ...`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct', //Uses Mistral 7B Instruct model
        messages: [
          { role: 'system', content: 'You are a helpful assistant for writing Cucumber feature files.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000', // required by OpenRouter TOS
          'X-Title': 'Feature file generator',
        },
      }
    );

    const output = response.data.choices[0].message.content;
    res.status(200).json({ featureFile: output });
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'API request failed' });
  }
}



