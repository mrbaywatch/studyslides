import React, { useState } from 'react';

// ⚠️ IMPORTANT: Update this after deploying your backend!
const API_URL = 'https://studyslides-api-i3ef.vercel.app';

const themes = {
  midnight: { id: 'midnight', name: 'Midnight Gold', background: '#0B1426', text: '#F8F4E8', accent: '#D4A853' },
  ocean: { id: 'ocean', name: 'Deep Ocean', background: '#0C1929', text: '#E8F4F8', accent: '#2B788B' },
  forest: { id: 'forest', name: 'Forest', background: '#1A2E1A', text: '#F0F7F0', accent: '#4A7C59' },
  coral: { id: 'coral', name: 'Coral Sunset', background: '#2D1B1B', text: '#FFF5F0', accent: '#E07A5F' },
  minimal: { id: 'minimal', name: 'Clean White', background: '#FFFFFF', text: '#1A1A1A', accent: '#6366F1' },
  dark: { id: 'dark', name: 'Modern Dark', background: '#18181B', text: '#FAFAFA', accent: '#A855F7' }
};

const presentationTypes = [
  { id: 'academic', name: 'Academic', icon: '📚' },
  { id: 'project', name: 'Class Project', icon: '📋' },
  { id: 'thesis', name: 'Thesis', icon: '🎓' },
  { id: 'pitch', name: 'Pitch', icon: '🚀' },
  { id: 'report', name: 'Report', icon: '📖' },
  { id: 'science', name: 'Science', icon: '🔬' },
];

export default function App() {
  const [view, setView] = useState('landing');
  const [mode, setMode] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [selectedTheme, setSelectedTheme] = useState('midnight');
  const [presentationType, setPresentationType] = useState('academic');
  const [outline, setOutline] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState(null);

  // Generate outline from API
  const generateOutline = async () => {
    setLoading(true);
    setLoadingMsg('Creating outline...');
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/generate-outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prompt, slideCount, presentationType })
      });

      if (!res.ok) throw new Error('Failed to generate outline');
      
      const data = await res.json();
      setOutline(data.outline || []);
      setTitle(data.title || 'My Presentation');
      setView('outline');
    } catch (err) {
      setError(err.message);
      // Fallback outline
      const fallback = Array.from({ length: slideCount }, (_, i) => ({
        id: i + 1,
        slideType: i === 0 ? 'title' : i === slideCount - 1 ? 'conclusion' : 'content',
        title: i === 0 ? prompt.slice(0, 50) : `Section ${i}`,
        description: 'Content section',
        keyPoints: ['Point 1', 'Point 2', 'Point 3']
      }));
      setOutline(fallback);
      setTitle(prompt.slice(0, 50) || 'My Presentation');
      setView('outline');
    } finally {
      setLoading(false);
    }
  };

  // Generate all slides
  const generateSlides = async () => {
    setView('generating');
    setLoading(true);
    setSlides([]);
    const generated = [];

    for (let i = 0; i < outline.length; i++) {
      setLoadingMsg(`Creating slide ${i + 1} of ${outline.length}...`);
      
      try {
        const res = await fetch(`${API_URL}/api/generate-slide`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slideOutline: outline[i], originalContent: prompt })
        });

        const data = res.ok ? await res.json() : {};
        generated.push({
          id: outline[i].id,
          type: outline[i].slideType,
          title: data.title || outline[i].title,
          subtitle: data.subtitle,
          content: data.content || outline[i].keyPoints,
          statValue: data.statValue,
          statLabel: data.statLabel,
          quote: data.quote,
          quoteAuthor: data.quoteAuthor,
          theme: themes[selectedTheme]
        });
      } catch {
        generated.push({
          id: outline[i].id,
          type: outline[i].slideType,
          title: outline[i].title,
          content: outline[i].keyPoints || ['Content'],
          theme: themes[selectedTheme]
        });
      }

      setSlides([...generated]);
      await new Promise(r => setTimeout(r, 200));
    }

    setLoading(false);
    setView('preview');
  };

  // Export PowerPoint
  const exportPPTX = async () => {
    setLoading(true);
    setLoadingMsg('Creating PowerPoint...');

    try {
      const res = await fetch(`${API_URL}/api/generate-pptx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides, theme: selectedTheme, title })
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export failed. Downloading as HTML instead...');
      exportHTML();
    } finally {
      setLoading(false);
    }
  };

  const exportHTML = () => {
    const theme = themes[selectedTheme];
    const html = `<!DOCTYPE html><html><head><title>${title}</title><style>
      body{margin:0;font-family:system-ui}
      .slide{width:960px;height:540px;padding:48px;box-sizing:border-box;background:${theme.background};color:${theme.text};page-break-after:always}
      h1{font-size:36px;margin-bottom:24px}
      ul{font-size:20px;line-height:1.8}
    </style></head><body>
    ${slides.map(s => `<div class="slide"><h1>${s.title}</h1>${s.content ? `<ul>${s.content.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}</div>`).join('')}
    </body></html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    a.click();
  };

  // Slide renderer
  const Slide = ({ slide, large }) => {
    const t = slide.theme || themes[selectedTheme];
    const p = large ? 'p-12' : 'p-4';
    const h1 = large ? 'text-4xl' : 'text-lg';
    const txt = large ? 'text-xl' : 'text-sm';

    return (
      <div className={`aspect-video rounded-lg ${p} flex flex-col relative overflow-hidden`} style={{ background: t.background, color: t.text }}>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10" style={{ background: `linear-gradient(135deg, ${t.accent}, transparent)` }} />
        
        {slide.type === 'title' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className={`${h1} font-bold mb-4`}>{slide.title}</h1>
            {slide.subtitle && <p className={`${txt} opacity-60`}>{slide.subtitle}</p>}
            <div className="mt-6 w-20 h-1 rounded" style={{ background: t.accent }} />
          </div>
        ) : slide.type === 'stats' ? (
          <div className="flex-1 flex flex-col">
            <h2 className={`${h1} font-bold mb-4`}>{slide.title}</h2>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className={large ? 'text-7xl font-bold' : 'text-4xl font-bold'} style={{ color: t.accent }}>{slide.statValue || '73%'}</p>
                <p className={`${txt} opacity-60 mt-2`}>{slide.statLabel}</p>
              </div>
            </div>
          </div>
        ) : slide.type === 'quote' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className={large ? 'text-6xl' : 'text-3xl'} style={{ color: t.accent }}>"</span>
            <p className={`${txt} italic max-w-xl`}>{slide.quote || slide.content?.[0]}</p>
            {slide.quoteAuthor && <p className="text-sm opacity-60 mt-4">— {slide.quoteAuthor}</p>}
          </div>
        ) : slide.type === 'conclusion' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className={`${h1} font-bold mb-6`}>{slide.title}</h2>
            <div className="space-y-2 mb-6">{slide.content?.map((c, i) => <p key={i} className={txt}>{c}</p>)}</div>
            <span className="px-6 py-2 rounded-full text-sm font-medium" style={{ background: t.accent, color: t.background }}>Thank You!</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <h2 className={`${h1} font-bold mb-4`}>{slide.title}</h2>
            <div className="space-y-3">
              {slide.content?.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full mt-2" style={{ background: t.accent }} />
                  <span className={txt}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <span className="absolute bottom-2 right-3 text-xs opacity-40">{slide.id}</span>
      </div>
    );
  };

  // VIEWS
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)' }} />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-semibold">StudySlides</span>
          </div>
          <button onClick={() => setView('create')} className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full">
            Get Started
          </button>
        </nav>

        <section className="relative z-10 max-w-4xl mx-auto px-8 pt-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-gray-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">100% Free</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            AI Presentations
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">for Students</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-xl mx-auto mb-10">
            Turn your notes into stunning presentations in seconds.
          </p>

          <button onClick={() => setView('create')} className="px-8 py-4 text-lg font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full shadow-lg">
            Start Creating →
          </button>
        </section>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <nav className="flex items-center justify-between px-8 py-5 border-b bg-white/80">
          <button onClick={() => setView('landing')} className="text-gray-600 hover:text-gray-900">← Back</button>
          <span className="font-semibold">StudySlides</span>
          <div className="w-16" />
        </nav>

        <main className="max-w-2xl mx-auto px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold mb-6">What's your presentation about?</h2>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., Climate change causes and effects for Environmental Science class..."
              className="w-full h-32 px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {presentationTypes.map(t => (
                  <button key={t.id} onClick={() => setPresentationType(t.id)}
                    className={`p-3 rounded-lg border text-left ${presentationType === t.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}>
                    <span>{t.icon}</span>
                    <p className="text-sm font-medium mt-1">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Slides</label>
              <div className="flex gap-2">
                {[5, 8, 10, 12].map(n => (
                  <button key={n} onClick={() => setSlideCount(n)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${slideCount === n ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="flex gap-2">
                {Object.values(themes).map(t => (
                  <button key={t.id} onClick={() => setSelectedTheme(t.id)}
                    className={`w-10 h-10 rounded-lg ${selectedTheme === t.id ? 'ring-2 ring-violet-500 ring-offset-2' : ''}`}
                    style={{ background: t.background }} title={t.name} />
                ))}
              </div>
            </div>

            {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

            <button onClick={generateOutline} disabled={loading || !prompt.trim()}
              className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg ${!loading && prompt.trim() ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {loading ? loadingMsg : 'Generate Outline →'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'outline') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <nav className="flex items-center justify-between px-8 py-5 border-b bg-white">
          <button onClick={() => setView('create')} className="text-gray-600">← Back</button>
          <span className="text-sm text-gray-500">{outline.length} slides</span>
          <button onClick={generateSlides} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium">
            Generate Slides
          </button>
        </nav>

        <main className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 mb-8">Review your outline</p>

          <div className="space-y-3">
            {outline.map((item, i) => (
              <div key={item.id} className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-semibold">{i + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{item.slideType}</span>
                    </div>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Creating Slides</h2>
          <p className="text-gray-600 mb-8">{loadingMsg}</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(slides.length / outline.length) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-[#1a1a1e] text-white flex">
        <div className="w-64 border-r border-white/10 flex flex-col bg-[#141416]">
          <div className="p-4 border-b border-white/10">
            <button onClick={() => setView('outline')} className="text-sm text-gray-400 hover:text-white">← Edit</button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {slides.map((s, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`w-full ${currentSlide === i ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[#141416]' : ''}`}>
                <Slide slide={s} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141416]">
            <h2 className="font-medium truncate">{title}</h2>
            <div className="flex gap-3">
              <button onClick={() => { setView('landing'); setSlides([]); setOutline([]); setPrompt(''); }} 
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg">New</button>
              <button onClick={exportPPTX} disabled={loading}
                className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg disabled:opacity-50">
                {loading ? 'Exporting...' : 'Export PPTX'}
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 flex items-center justify-center bg-[#0a0a0c]">
            <div className="w-full max-w-4xl shadow-2xl">
              {slides[currentSlide] && <Slide slide={slides[currentSlide]} large />}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 p-4 border-t border-white/10 bg-[#141416]">
            <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-30">←</button>
            <span className="text-sm text-gray-400">{currentSlide + 1} / {slides.length}</span>
            <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-30">→</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
