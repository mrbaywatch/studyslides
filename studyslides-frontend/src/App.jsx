import React, { useState, useEffect } from 'react';

const API_URL = 'https://studyslides-api-i3ef.vercel.app';

// Format options
const formats = [
  { id: 'presentation', name: 'Presentation', icon: '📊' },
  { id: 'webpage', name: 'Webpage', icon: '🌐' },
  { id: 'document', name: 'Document', icon: '📄' },
  { id: 'social', name: 'Social', icon: '📱' },
];

// Example prompts for Generate
const examplePrompts = [
  { icon: '📷', text: 'Photography portfolio presentation for [name]' },
  { icon: '🏎️', text: 'F1 Legends' },
  { icon: '💼', text: 'Negotiating and closing deals to meet or exceed sales targets' },
  { icon: '📈', text: 'Digital marketing trends' },
  { icon: '🌍', text: 'What is the origin of language' },
  { icon: '📚', text: 'Book report for "The Joy Luck Club"' },
];

// Text mode options for Paste
const textModes = [
  { id: 'generate', name: 'Generate from notes or an outline', desc: 'Turn rough ideas, bullet points, or outlines into beautiful content' },
  { id: 'condense', name: 'Summarize long text or document', desc: 'Great for condensing detailed content into something more presentable' },
  { id: 'preserve', name: 'Preserve this exact text', desc: 'Create using your text, exactly as you\'ve written it' },
];

export default function App() {
  const [view, setView] = useState('landing');
  const [createMode, setCreateMode] = useState(null);
  
  // Common options
  const [format, setFormat] = useState('presentation');
  const [numCards, setNumCards] = useState(10);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [language, setLanguage] = useState('en');
  
  // Generate mode
  const [prompt, setPrompt] = useState('');
  
  // Paste mode
  const [pastedText, setPastedText] = useState('');
  const [textMode, setTextMode] = useState('generate');
  
  // Import mode
  const [importUrl, setImportUrl] = useState('');
  
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

    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [generationId, generationStatus]);

  // Start generation
  const startGeneration = async () => {
    setLoading(true);
    setError(null);
    setGenerationStatus('pending');
    setView('generating');

    let inputText = '';
    let mode = 'generate';

    if (createMode === 'generate') {
      inputText = prompt;
      mode = 'generate';
    } else if (createMode === 'paste') {
      inputText = pastedText;
      mode = textMode;
    } else if (createMode === 'import') {
      inputText = `Create a ${format} based on the content from this URL: ${importUrl}`;
      mode = 'generate';
    }

    try {
      const requestBody = {
        inputText,
        textMode: mode,
        format,
        numCards,
        exportAs: 'pptx',
        textOptions: {
          amount: 'medium',
          language
        },
        imageOptions: {
          source: 'aiGenerated',
          style: 'modern, professional'
        },
        cardOptions: {
          dimensions: format === 'presentation' ? '16x9' : 'fluid'
        }
      };

      if (selectedTheme) {
        requestBody.themeId = selectedTheme;
      }

      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGenerationId(data.generationId);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setView(createMode);
    }
  };

  // Reset
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

  // Download
  const downloadPresentation = (type = 'pptx') => {
    if (!result) return;
    const url = type === 'pdf' ? result.pdfUrl : result.pptxUrl;
    if (url) window.open(url, '_blank');
  };

  // Shared Components
  const BackButton = () => (
    <button 
      onClick={startNew}
      className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-full shadow-sm border"
    >
      ← Back
    </button>
  );

  const FormatSelector = () => (
    <div className="flex justify-center gap-3 mb-6">
      {formats.map(f => (
        <button
          key={f.id}
          onClick={() => setFormat(f.id)}
          className={`flex flex-col items-center px-6 py-4 rounded-xl border-2 transition-all ${
            format === f.id 
              ? 'border-blue-500 bg-white shadow-sm' 
              : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
          }`}
        >
          <span className="text-2xl mb-1">{f.icon}</span>
          <span className={`text-sm font-medium ${format === f.id ? 'text-blue-600' : 'text-gray-600'}`}>
            {f.name}
          </span>
        </button>
      ))}
    </div>
  );

  const CardCounter = () => (
    <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-sm border">
      <button 
        onClick={() => setNumCards(Math.max(1, numCards - 1))}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
      >
        −
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-[70px] text-center">
        {numCards} cards
      </span>
      <button 
        onClick={() => setNumCards(Math.min(60, numCards + 1))}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
      >
        +
      </button>
    </div>
  );

  const ThemeDropdown = () => (
    <select
      value={selectedTheme}
      onChange={e => setSelectedTheme(e.target.value)}
      className="bg-white rounded-full px-4 py-2 shadow-sm border text-sm font-medium text-gray-700 cursor-pointer"
    >
      <option value="">🎨 Classic</option>
      <option value="modern">✨ Modern</option>
      <option value="minimal">◽ Minimal</option>
      <option value="bold">🔥 Bold</option>
    </select>
  );

  const LayoutDropdown = () => (
    <select
      className="bg-white rounded-full px-4 py-2 shadow-sm border text-sm font-medium text-gray-700 cursor-pointer"
    >
      <option value="default">⊞ Default</option>
    </select>
  );

  const LanguageDropdown = () => (
    <select
      value={language}
      onChange={e => setLanguage(e.target.value)}
      className="bg-white rounded-full px-4 py-2 shadow-sm border text-sm font-medium text-gray-700 cursor-pointer"
    >
      <option value="en">🌐 English (US)</option>
      <option value="es">🌐 Spanish</option>
      <option value="fr">🌐 French</option>
      <option value="de">🌐 German</option>
      <option value="no">🌐 Norwegian</option>
    </select>
  );

  // LANDING VIEW
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-blue-100">
        <nav className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="text-xl font-bold text-gray-800">StudySlides</span>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-8 pt-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif italic text-gray-800 mb-4">
              Create with AI
            </h1>
            <p className="text-xl text-gray-600">
              How would you like to get started?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Generate */}
            <button
              onClick={() => { setCreateMode('generate'); setView('generate'); }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all text-left group"
            >
              <div className="h-28 rounded-xl bg-gradient-to-br from-orange-200 via-pink-200 to-purple-300 mb-4 flex items-center justify-center">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Generate</h3>
              <p className="text-sm text-gray-500">Create from a one-line prompt in a few seconds</p>
              <span className="text-xs text-gray-400 mt-2 block">POPULAR</span>
            </button>

            {/* Paste in text */}
            <button
              onClick={() => { setCreateMode('paste'); setView('paste'); }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all text-left"
            >
              <div className="h-28 rounded-xl bg-gradient-to-br from-purple-300 via-pink-300 to-indigo-400 mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">Aa</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Paste in text</h3>
              <p className="text-sm text-gray-500">Create from notes, an outline, or existing content</p>
            </button>

            {/* Import */}
            <button
              onClick={() => { setCreateMode('import'); setView('import'); }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all text-left"
            >
              <div className="h-28 rounded-xl bg-gradient-to-br from-green-200 via-teal-200 to-cyan-300 mb-4 flex items-center justify-center">
                <span className="text-4xl">📤</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Import file or URL</h3>
              <p className="text-sm text-gray-500">Enhance existing docs, presentations, or webpages</p>
            </button>

            {/* Generate from template */}
            <button
              onClick={() => { setCreateMode('generate'); setView('generate'); }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all text-left relative"
            >
              <div className="h-28 rounded-xl bg-gradient-to-br from-rose-200 via-pink-300 to-red-300 mb-4 flex items-center justify-center">
                <span className="text-4xl">📑</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Generate from template</h3>
              <p className="text-sm text-gray-500">Fill in and customize a structured template</p>
              <span className="absolute top-4 right-4 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">NEW</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // GENERATE VIEW
  if (view === 'generate') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-blue-100 relative">
        <BackButton />
        
        <main className="max-w-3xl mx-auto px-8 pt-16">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-serif italic text-gray-700 mb-3">Generate</h1>
            <p className="text-gray-600">What would you like to create today?</p>
          </div>

          <FormatSelector />

          {/* Options row */}
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <CardCounter />
            <ThemeDropdown />
            <LayoutDropdown />
            <LanguageDropdown />
          </div>

          {/* Main input */}
          <div className="bg-white rounded-2xl shadow-sm border p-1 mb-8">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe what you'd like to make"
              className="w-full px-5 py-4 text-lg focus:outline-none rounded-xl"
              onKeyPress={e => e.key === 'Enter' && prompt.trim() && startGeneration()}
            />
          </div>

          {/* Example prompts */}
          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">Example prompts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {examplePrompts.map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex.text)}
                className="flex items-start gap-3 bg-blue-50/50 hover:bg-blue-100/50 rounded-xl p-4 text-left transition-all border border-transparent hover:border-blue-200"
              >
                <span className="text-xl">{ex.icon}</span>
                <span className="text-sm text-gray-700">{ex.text}</span>
                <span className="ml-auto text-gray-300">+</span>
              </button>
            ))}
          </div>

          {/* Shuffle button */}
          <div className="text-center">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border text-sm text-gray-600 hover:bg-gray-50">
              🔀 Shuffle
            </button>
          </div>

          {/* Generate button (floating) */}
          {prompt.trim() && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
              <button
                onClick={startGeneration}
                disabled={loading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-lg flex items-center gap-2"
              >
                Generate →
              </button>
            </div>
          )}

          {error && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </main>
      </div>
    );
  }

  // PASTE VIEW
  if (view === 'paste') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-blue-100 relative">
        <BackButton />
        
        <main className="max-w-4xl mx-auto px-8 pt-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">📄</span>
              <h1 className="text-4xl font-serif italic text-gray-700">Paste in text</h1>
            </div>
            <p className="text-gray-600">What would you like to create?</p>
          </div>

          <FormatSelector />

          {/* Theme dropdown centered */}
          <div className="flex justify-center mb-6">
            <select
              value={selectedTheme}
              onChange={e => setSelectedTheme(e.target.value)}
              className="bg-white rounded-lg px-4 py-2 shadow-sm border text-sm text-gray-700 min-w-[200px]"
            >
              <option value="">⊞ Default</option>
            </select>
          </div>

          <p className="text-center text-gray-600 mb-4">
            Paste in the notes, outline or text content you'd like to use
          </p>

          <div className="flex gap-6">
            {/* Text area */}
            <div className="flex-1">
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="Type or paste in content here"
                className="w-full h-64 p-4 bg-white rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Tips sidebar */}
            <div className="w-64 bg-blue-50/50 rounded-xl p-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <span>⚙️</span>
                <span>Optional: card-by-card control</span>
              </div>
              <p className="text-gray-600 text-xs mb-3">
                Know what you want on each card? Add three dashes --- between each section.
              </p>
              <div className="bg-white rounded-lg p-3 text-xs text-gray-600 space-y-2">
                <div>
                  <div className="font-medium">Intro to our new strategy</div>
                  <ul className="list-disc ml-4 text-gray-500">
                    <li>Key point 1</li>
                    <li>Key point 2</li>
                    <li>Key point 3</li>
                  </ul>
                </div>
                <div className="text-gray-400">---</div>
                <div>
                  <div className="font-medium">Key metrics from Q1</div>
                  <ul className="list-disc ml-4 text-gray-500">
                    <li>Key point 1</li>
                    <li>Key point 2</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Text mode options */}
          <div className="mt-8">
            <p className="text-center text-gray-600 mb-4">
              What do you want to do with this content?
            </p>
            
            <div className="space-y-3 max-w-2xl mx-auto">
              {textModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setTextMode(mode.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    textMode === mode.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    textMode === mode.id ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {textMode === mode.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{mode.name}</div>
                    <div className="text-sm text-gray-500">{mode.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Continue button */}
          <div className="mt-8 max-w-2xl mx-auto">
            <button
              onClick={startGeneration}
              disabled={!pastedText.trim() || loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                pastedText.trim()
                  ? 'bg-orange-400 hover:bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to prompt editor →
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-4">
            You can also <button className="text-blue-600 underline">import files</button>
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
        </main>
      </div>
    );
  }

  // IMPORT VIEW
  if (view === 'import') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-blue-100 relative">
        <BackButton />
        
        <main className="max-w-4xl mx-auto px-8 pt-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">📤</span>
              <h1 className="text-4xl font-serif italic text-gray-700">Import with AI</h1>
            </div>
            <p className="text-gray-600">Select the file you'd like to transform</p>
          </div>

          {/* Import options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Upload a file */}
            <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer">
              <div className="h-20 flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-purple-200 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📁</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Upload a file</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Powerpoint PPTX
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Word docs
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> PDFs
                </div>
              </div>
              <button className="mt-4 text-purple-600 text-sm font-medium flex items-center gap-1">
                Browse files <span>↗</span>
              </button>
            </div>

            {/* Import from Drive */}
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer">
              <div className="h-20 flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Import from Drive</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Google Slides
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Google Docs
                </div>
              </div>
              <button className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1">
                <span>🔍</span>
              </button>
            </div>

            {/* Import from URL */}
            <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 transition-all">
              <div className="h-20 flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-200 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🌐</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Import from URL</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Webpages
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Blog posts or articles
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Notion docs (public only)
                </div>
              </div>
              
              {/* URL input */}
              <div className="mt-4">
                <input
                  type="url"
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  placeholder="Paste URL here..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {importUrl.trim() && (
                  <button
                    onClick={startGeneration}
                    className="mt-2 w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                  >
                    Import →
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm">
            If your file isn't supported, you can also <button className="text-blue-600 underline">paste in text</button>
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
        </main>
      </div>
    );
  }

  // GENERATING VIEW
  if (view === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-8">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating your {format}</h2>
          <p className="text-gray-600 mb-2">This usually takes 30-60 seconds...</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>
              {generationStatus === 'pending' && 'Starting...'}
              {generationStatus === 'processing' && 'Processing content...'}
              {generationStatus === 'generating' && 'Generating slides...'}
              {!generationStatus && 'Connecting...'}
            </span>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-xl text-sm">
              {error}
              <button onClick={startNew} className="block mt-2 underline">Try again</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULT VIEW
  if (view === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-blue-100">
        <nav className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold">StudySlides</span>
          </div>
          <button onClick={startNew} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            + Create New
          </button>
        </nav>

        <main className="max-w-2xl mx-auto px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your {format} is ready!</h1>
            <p className="text-gray-600 mb-8">{result?.title || 'Successfully created'}</p>

            {result?.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 rounded-xl text-blue-700 font-medium mb-6"
              >
                👁️ Preview & Edit
              </a>
            )}

            <div className="flex gap-4 justify-center">
              {result?.pptxUrl && (
                <button
                  onClick={() => downloadPresentation('pptx')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                >
                  📥 Download PPTX
                </button>
              )}
              {result?.pdfUrl && (
                <button
                  onClick={() => downloadPresentation('pdf')}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium"
                >
                  📄 Download PDF
                </button>
              )}
            </div>

            {!result?.pptxUrl && !result?.pdfUrl && result?.url && (
              <p className="text-sm text-gray-500 mt-4">
                Use "Preview & Edit" to view and download your presentation
              </p>
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}
