import { useState } from 'react';

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [output, setOutput] = useState('');
  const [files, setFiles] = useState([]);

  const generateFeatureFile = async () => {
    const res = await fetch('/api/generate-feature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: keywords.split(',').map(k => k.trim()) }),
    });

    const data = await res.json();
    const featureText = data.featureFile || data.error;
    setOutput(featureText);

    // Extract the feature header
    const featureMatch = featureText.match(/^(Feature:.*?)(\r?\n)+/is);
    const featureHeader = featureMatch ? featureMatch[1] : 'Feature: Feature';
    const titleMatch = featureHeader.match(/Feature:\s*(.+)/i);
    const baseName = titleMatch ? titleMatch[1].trim().toLowerCase().replace(/\s+/g, '-') : 'feature';

    // Match all complete Scenario blocks
    const scenarioMatches = [...featureText.matchAll(/^\s*Scenario:.*(?:\r?\n(?:\s{2,}.+|$))+/gm)];

    const fileList = scenarioMatches.map((match, index) => {
      const scenarioBlock = match[0].trim();
      const content = `${featureHeader}\n\n${scenarioBlock}`;
      const filename = `${baseName}-scenario-${index + 1}.feature`;
      return { name: filename, content };
    });

    setFiles(fileList);
  };

  const downloadFile = (name, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧪 Cucumber Feature Generator</h2>
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
          <h3 style={{ marginTop: '1rem' }}>⬇️ Download Scenarios</h3>
          <ul>
            {files.map((file, idx) => (
              <li key={idx}>
                <button onClick={() => downloadFile(file.name, file.content)}>
                  {file.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
