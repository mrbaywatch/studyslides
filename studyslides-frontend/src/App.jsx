import React, { useState, useEffect } from 'react';

const API_URL = 'https://studyslides-api-i3ef.vercel.app';

// Gamma themes (popular ones)
const defaultThemes = [
  { id: 'Starter', name: 'Starter', color: '#6366F1' },
  { id: 'Oasis', name: 'Oasis', color: '#0EA5E9' },
  { id: 'Verdant', name: 'Verdant', color: '#22C55E' },
  { id: 'Ember', name: 'Ember', color: '#F97316' },
  { id: 'Dusk', name: 'Dusk', color: '#8B5CF6' },
  { id: 'Slate', name: 'Slate', color: '#64748B' },
  { id: 'Midnight', name: 'Midnight', color: '#1E293B' },
  { id: 'Rose', name: 'Rose', color: '#F43F5E' },
];

const imageStyles = [
  { id: 'photorealistic', name: 'Photorealistic', icon: '📷' },
  { id: 'illustration', name: 'Illustration', icon: '🎨' },
  { id: 'minimal', name: 'Minimal', icon: '◽' },
  { id: '3d render', name: '3D Render', icon: '🎮' },
  { id: 'watercolor', name: 'Watercolor', icon: '🖌️' },
  { id: 'cartoon', name: 'Cartoon', icon: '✏️' },
];

const tones = [
  { id: 'professional', name: 'Professional' },
  { id: 'casual', name: 'Casual' },
  { id: 'academic', name: 'Academic' },
  { id: 'inspiring', name: 'Inspiring' },
  { id: 'persuasive', name: 'Persuasive' },
];

const audiences = [
  { id: 'general', name: 'General' },
  { id: 'students', name: 'Students' },
  { id: 'professionals', name: 'Professionals' },
  { id: 'executives', name: 'Executives' },
  { id: 'investors', name: 'Investors' },
];

export default function App() {
  const [view, setView] = useState('landing');
  const [createMode, setCreateMode] = useState(null); // 'generate', 'paste', 'import', 'template'
  
  // Input states
  const [prompt, setPrompt] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  
  // Options
  const [numCards, setNumCards] = useState(8);
  const [selectedTheme, setSelectedTheme] = useState('Starter');
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('general');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  // Generation state
  const [generationId, setGenerationId] = useState(null);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Poll for generation status
  useEffect(() => {
    if (!generationId || generationStatus === 'completed' || generationStatus === 'failed') {
      return;
    }

    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/status?id=${generationId}`);
        const data = await res.json();
        
        setGenerationStatus(data.status);
        
        if (data.status === 'completed') {
          setResult(data);
          setLoading(false);
          setView('result');
        } else if (data.status === 'failed') {
          setError('Generation failed. Please try again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Status check failed:', err);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [generationId, generationStatus]);

  // Start generation
  const startGeneration = async () => {
    setLoading(true);
    setError(null);
    setGenerationStatus('pending');
    setView('generating');

    let inputText = '';
    let textMode = 'generate';

    switch (createMode) {
      case 'generate':
        inputText = prompt;
        textMode = 'generate';
        break;
      case 'paste':
        inputText = pastedText;
        textMode = 'preserve';
        break;
      case 'import':
        // Handle URL import separately
        try {
          const res = await fetch(`${API_URL}/api/import-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: importUrl,
              themeId: selectedTheme,
              numCards,
              additionalInstructions
            })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          setGenerationId(data.generationId);
          return;
        } catch (err) {
          setError(err.message);
          setLoading(false);
          return;
        }
      default:
        inputText = prompt;
    }

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText,
          textMode,
          format: 'presentation',
          themeId: selectedTheme,
          numCards,
          additionalInstructions,
          exportAs: 'pptx',
          textOptions: {
            amount: 'medium',
            tone,
            audience
          },
          imageOptions: {
            source: 'aiGenerated',
            style: imageStyle
          },
          cardOptions: {
            dimensions: '16x9'
          }
        })
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGenerationId(data.generationId);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setView('create');
    }
  };

  // Download presentation
  const downloadPresentation = async (type = 'pptx') => {
    if (!result) return;
    
    const url = type === 'pdf' ? result.pdfUrl : result.pptxUrl;
    if (!url) {
      alert(`${type.toUpperCase()} download not available`);
      return;
    }

    // Use proxy to hide Gamma URL
    const downloadUrl = `${API_URL}/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(result.title || 'presentation')}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${result.title || 'presentation'}.${type}`;
    a.click();
  };

  // Reset and start new
  const startNew = () => {
    setView('landing');
    setCreateMode(null);
    setPrompt('');
    setPastedText('');
    setImportUrl('');
    setGenerationId(null);
    setGenerationStatus(null);
    setResult(null);
    setError(null);
  };

  // LANDING VIEW
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <nav className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="text-xl font-bold">StudySlides</span>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-8 pt-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Create with AI
            </h1>
            <p className="text-xl text-gray-600">
              How would you like to get started?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Generate */}
            <button
              onClick={() => { setCreateMode('generate'); setView('create'); }}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all text-left"
            >
              <div className="h-32 rounded-xl bg-gradient-to-br from-orange-300 via-pink-400 to-purple-500 mb-4 flex items-center justify-center overflow-hidden">
                <span className="text-5xl">✨</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Generate</h3>
              <p className="text-sm text-gray-500">Create from a one-line prompt in a few seconds</p>
            </button>

            {/* Paste in text */}
            <button
              onClick={() => { setCreateMode('paste'); setView('create'); }}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all text-left"
            >
              <div className="h-32 rounded-xl bg-gradient-to-br from-purple-400 via-pink-500 to-indigo-600 mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">Aa</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Paste in text</h3>
              <p className="text-sm text-gray-500">Create from notes, an outline, or existing content</p>
            </button>

            {/* Import file or URL */}
            <button
              onClick={() => { setCreateMode('import'); setView('create'); }}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all text-left"
            >
              <div className="h-32 rounded-xl bg-gradient-to-br from-green-300 via-teal-400 to-cyan-500 mb-4 flex items-center justify-center">
                <span className="text-5xl">📤</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Import URL</h3>
              <p className="text-sm text-gray-500">Enhance existing docs, presentations, or webpages</p>
            </button>

            {/* Templates */}
            <button
              onClick={() => { setCreateMode('generate'); setView('create'); }}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all text-left relative"
            >
              <div className="h-32 rounded-xl bg-gradient-to-br from-pink-300 via-rose-400 to-red-500 mb-4 flex items-center justify-center">
                <span className="text-5xl">📑</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Quick Start</h3>
              <p className="text-sm text-gray-500">Start with suggested topics for students</p>
              <span className="absolute top-4 right-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">POPULAR</span>
            </button>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            <p>✨ AI-powered presentations • 🎨 Beautiful designs • 📥 Export to PowerPoint</p>
          </div>
        </main>
      </div>
    );
  }

  // CREATE VIEW
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <nav className="flex items-center justify-between px-8 py-5 border-b bg-white/80 backdrop-blur">
          <button onClick={startNew} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            ← Back
          </button>
          <span className="font-bold">StudySlides</span>
          <div className="w-16" />
        </nav>

        <main className="max-w-2xl mx-auto px-8 py-10">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            
            {/* Mode-specific input */}
            {createMode === 'generate' && (
              <>
                <h2 className="text-2xl font-bold mb-2">What's your presentation about?</h2>
                <p className="text-gray-500 mb-6">Enter a topic and we'll create a beautiful presentation</p>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g., The impact of climate change on ocean ecosystems"
                  className="w-full h-32 px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-lg"
                />
              </>
            )}

            {createMode === 'paste' && (
              <>
                <h2 className="text-2xl font-bold mb-2">Paste your content</h2>
                <p className="text-gray-500 mb-6">Add notes, outline, or existing text to transform</p>
                <textarea
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  placeholder="Paste your notes, outline, bullet points, or any text content here..."
                  className="w-full h-48 px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </>
            )}

            {createMode === 'import' && (
              <>
                <h2 className="text-2xl font-bold mb-2">Import from URL</h2>
                <p className="text-gray-500 mb-6">Enter a webpage URL to transform into a presentation</p>
                <input
                  type="url"
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-lg"
                />
              </>
            )}

            {/* Number of slides */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Number of slides</label>
              <div className="flex gap-2">
                {[5, 8, 10, 12, 15].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumCards(n)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      numCards === n
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="flex flex-wrap gap-2">
                {defaultThemes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedTheme === theme.id
                        ? 'ring-2 ring-violet-500 ring-offset-2'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{ backgroundColor: theme.color + '20', color: theme.color }}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.color }} />
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Style */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Image style</label>
              <div className="flex flex-wrap gap-2">
                {imageStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setImageStyle(style.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      imageStyle === style.id
                        ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{style.icon}</span>
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone & Audience */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {tones.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
                <select
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {audiences.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional instructions <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={additionalInstructions}
                onChange={e => setAdditionalInstructions(e.target.value)}
                placeholder="e.g., Focus on recent statistics, include case studies"
                className="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={startGeneration}
              disabled={loading || (createMode === 'generate' && !prompt.trim()) || (createMode === 'paste' && !pastedText.trim()) || (createMode === 'import' && !importUrl.trim())}
              className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                !loading
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Generate Presentation →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // GENERATING VIEW
  if (view === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-8">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating Your Presentation</h2>
          <p className="text-gray-600 mb-2">AI is designing beautiful slides for you...</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span>
              {generationStatus === 'pending' && 'Starting generation...'}
              {generationStatus === 'processing' && 'Processing your content...'}
              {generationStatus === 'generating' && 'Generating slides...'}
              {!generationStatus && 'Connecting...'}
            </span>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
              <button onClick={startNew} className="block mt-2 text-red-600 underline">
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULT VIEW
  if (view === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <nav className="flex items-center justify-between px-8 py-5 border-b bg-white/80 backdrop-blur">
          <span className="font-bold">StudySlides</span>
          <button
            onClick={startNew}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            + New Presentation
          </button>
        </nav>

        <main className="max-w-3xl mx-auto px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {result?.title || 'Your Presentation is Ready!'}
            </h1>
            <p className="text-gray-600 mb-8">
              Your AI-generated presentation has been created successfully.
            </p>

            {/* Preview link */}
            {result?.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium mb-6"
              >
                <span>👁️</span> Preview Online
              </a>
            )}

            {/* Download buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => downloadPresentation('pptx')}
                className="flex-1 sm:flex-none px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                <span>📥</span> Download PowerPoint
              </button>
              
              <button
                onClick={() => downloadPresentation('pdf')}
                className="flex-1 sm:flex-none px-8 py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                <span>📄</span> Download PDF
              </button>
            </div>

            {/* Credits info */}
            {result?.creditsUsed && (
              <p className="mt-6 text-sm text-gray-500">
                Credits used: {result.creditsUsed}
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={startNew}
              className="p-4 bg-white rounded-xl border hover:border-violet-300 hover:shadow transition-all text-left"
            >
              <span className="text-2xl mb-2 block">✨</span>
              <p className="font-medium">Create Another</p>
              <p className="text-sm text-gray-500">Start a new presentation</p>
            </button>

            <button
              onClick={() => { setView('create'); }}
              className="p-4 bg-white rounded-xl border hover:border-violet-300 hover:shadow transition-all text-left"
            >
              <span className="text-2xl mb-2 block">🔄</span>
              <p className="font-medium">Edit Settings</p>
              <p className="text-sm text-gray-500">Regenerate with changes</p>
            </button>

            <a
              href={result?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-xl border hover:border-violet-300 hover:shadow transition-all text-left"
            >
              <span className="text-2xl mb-2 block">🌐</span>
              <p className="font-medium">Share Link</p>
              <p className="text-sm text-gray-500">Get shareable URL</p>
            </a>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
