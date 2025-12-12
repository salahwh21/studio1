import fetch from 'node-fetch';
import { stdin, stdout } from 'process';

const KEY = process.env.PPLX_API_KEY;
if (!KEY) {
  console.error('❌ Missing PPLX_API_KEY');
  process.exit(1);
}

const send = (json) => {
  stdout.write(JSON.stringify(json) + '\n');
};

const handleRequest = async (request) => {
  const response = {
    jsonrpc: '2.0',
    id: request.id,
  };

  if (request.method === 'list_tools') {
    response.result = {
      tools: [{
        name: 'perplexity_chat',
        description: 'Chat with Perplexity AI Sonar Pro',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Your question or message to Perplexity AI'
            }
          },
          required: ['message']
        }
      }]
    };
  } else if (request.method === 'call_tool') {
    const { name, arguments: args } = request.params;
    if (name === 'perplexity_chat') {
      try {
        const message = args.message || '';
        const res = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              { role: 'system', content: 'You are a helpful coding assistant.' },
              { role: 'user', content: message }
            ],
            temperature: 0.3
          })
        });
        
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content || 'No response';
        response.result = { content: [{ type: 'text', text }] };
      } catch (e) {
        response.error = { code: -32603, message: String(e) };
      }
    }
  }

  send(response);
};

stdin.setEncoding('utf8');
stdin.on('data', (data) => {
  const lines = data.trim().split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const request = JSON.parse(line);
      handleRequest(request);
    } catch {}
  }
});
