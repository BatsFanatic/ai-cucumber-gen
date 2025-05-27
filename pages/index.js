import { useState } from 'react';

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [output, setOutput] = useState('');

  const generateFeatureFile = async () => {
    const res = await fetch('/api/generate-feature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: keywords.split(',').map(k => k.trim()) }),
    });

    const data = await res.json();
    setOutput(data.featureFile || data.error);
  };

  const downloadFeatureFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'feature.feature';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Cucumber Feature Generator</h2>
      <input
        type="text"
        placeholder="e.g. login, error, forgot password"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        style={{ width: '100%', padding: '0.5rem' }}
      />
      <button onClick={generateFeatureFile} style={{ marginTop: '1rem' }}>
        Generate
      </button>

      {output && (
        <>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '2rem', background: '#f9f9f9', padding: '1rem' }}>
            {output}
          </pre>
          <button onClick={downloadFeatureFile} style={{ marginTop: '1rem' }}>
            ⬇️ Download .feature File
          </button>
        </>
      )}
    </div>
  );
}

