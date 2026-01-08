import React, { useState } from 'react';

// API URL - your deployed backend
const API_URL = 'https://studyslides-api-i3ef.vercel.app';

// Theme definitions with preview colors
const themes = {
  midnight: { 
    id: 'midnight', 
    name: 'Midnight', 
    background: '#0F172A', 
    text: '#F8FAFC', 
    accent: '#F59E0B',
    secondary: '#1E293B',
    preview: ['#0F172A', '#F59E0B', '#1E293B']
  },
  ocean: { 
    id: 'ocean', 
    name: 'Ocean', 
    background: '#0C4A6E', 
    text: '#F0F9FF', 
    accent: '#38BDF8',
    secondary: '#075985',
    preview: ['#0C4A6E', '#38BDF8', '#075985']
  },
  forest: { 
    id: 'forest', 
    name: 'Forest', 
    background: '#14532D', 
    text: '#F0FDF4', 
    accent: '#4ADE80',
    secondary: '#166534',
    preview: ['#14532D', '#4ADE80', '#166534']
  },
  sunset: { 
    id: 'sunset', 
    name: 'Sunset', 
    background: '#7C2D12', 
    text: '#FFF7ED', 
    accent: '#FB923C',
    secondary: '#9A3412',
    preview: ['#7C2D12', '#FB923C', '#9A3412']
  },
  minimal: { 
    id: 'minimal', 
    name: 'Minimal', 
    background: '#FFFFFF', 
    text: '#1E293B', 
    accent: '#6366F1',
    secondary: '#F1F5F9',
    preview: ['#FFFFFF', '#6366F1', '#F1F5F9']
  },
  dark: { 
    id: 'dark', 
    name: 'Dark', 
    background: '#18181B', 
    text: '#FAFAFA', 
    accent: '#A855F7',
    secondary: '#27272A',
    preview: ['#18181B', '#A855F7', '#27272A']
  }
};

const presentationTypes = [
  { id: 'academic', name: 'Academic', icon: '📚', desc: 'Research & essays' },
  { id: 'project', name: 'Project', icon: '📋', desc: 'Class assignments' },
  { id: 'thesis', name: 'Thesis', icon: '🎓', desc: 'Defense presentations' },
  { id: 'pitch', name: 'Pitch', icon: '🚀', desc: 'Ideas & proposals' },
  { id: 'report', name: 'Report', icon: '📖', desc: 'Book & lab reports' },
  { id: 'science', name: 'Science', icon: '🔬', desc: 'Experiments & data' },
];

export default function App() {
  const [view, setView] = useState('landing');
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
    if (!prompt.trim()) return;
    
    setLoading(true);
    setLoadingMsg('Researching your topic...');
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/generate-outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: prompt, 
          slideCount, 
          presentationType 
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate outline');
      }
      
      const data = await res.json();
      
      if (!data.outline || data.outline.length === 0) {
        throw new Error('No outline generated');
      }
      
      setOutline(data.outline);
      setTitle(data.title || prompt);
      setView('outline');
    } catch (err) {
      console.error('Outline error:', err);
      setError(`Error: ${err.message}. Please try again.`);
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
      setLoadingMsg(`Creating slide ${i + 1} of ${outline.length}: ${outline[i].title}`);
      
      try {
        const res = await fetch(`${API_URL}/api/generate-slide`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            slideOutline: outline[i], 
            originalContent: prompt 
          })
        });

        let slideContent = {};
        if (res.ok) {
          slideContent = await res.json();
        }

        generated.push({
          id: outline[i].id,
          type: outline[i].slideType,
          title: slideContent.title || outline[i].title,
          subtitle: slideContent.subtitle || outline[i].subtitle,
          content: slideContent.content || outline[i].keyPoints || [],
          statValue: slideContent.statValue,
          statLabel: slideContent.statLabel,
          quote: slideContent.quote,
          quoteAuthor: slideContent.quoteAuthor,
          theme: themes[selectedTheme]
        });
      } catch (err) {
        console.error('Slide error:', err);
        generated.push({
          id: outline[i].id,
          type: outline[i].slideType,
          title: outline[i].title,
          content: outline[i].keyPoints || ['Content could not be generated'],
          theme: themes[selectedTheme]
        });
      }

      setSlides([...generated]);
      await new Promise(r => setTimeout(r, 300));
    }

    setLoading(false);
    setView('preview');
  };

  // Export PowerPoint
  const exportPPTX = async () => {
    setLoading(true);
    setLoadingMsg('Creating PowerPoint file...');

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
      // Fallback to HTML
      const theme = themes[selectedTheme];
      const html = `<!DOCTYPE html><html><head><title>${title}</title>
        <style>body{margin:0;font-family:system-ui}.slide{width:960px;height:540px;padding:60px;box-sizing:border-box;background:${theme.background};color:${theme.text};page-break-after:always}h1{font-size:36px;margin:0 0 30px 0}ul{font-size:20px;line-height:2}</style></head><body>
        ${slides.map(s => `<div class="slide"><h1>${s.title}</h1>${s.content?.length ? `<ul>${s.content.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}</div>`).join('')}
        </body></html>`;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.html`;
      a.click();
    } finally {
      setLoading(false);
    }
  };

  // Theme preview component
  const ThemePreview = ({ theme, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`relative w-24 h-16 rounded-lg overflow-hidden transition-all ${
        selected ? 'ring-2 ring-violet-500 ring-offset-2 scale-105' : 'hover:scale-105'
      }`}
      style={{ background: theme.background }}
    >
      {/* Mini slide preview */}
      <div className="absolute inset-1 rounded" style={{ background: theme.background }}>
        {/* Title bar */}
        <div className="h-1 w-full" style={{ background: theme.accent }} />
        {/* Title text */}
        <div className="mt-2 mx-2 h-2 w-12 rounded" style={{ background: theme.text, opacity: 0.9 }} />
        {/* Bullet points */}
        <div className="mt-2 mx-2 space-y-1">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full" style={{ background: theme.accent }} />
            <div className="h-1 w-10 rounded" style={{ background: theme.text, opacity: 0.5 }} />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full" style={{ background: theme.accent }} />
            <div className="h-1 w-8 rounded" style={{ background: theme.text, opacity: 0.5 }} />
          </div>
        </div>
      </div>
      {/* Theme name */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-0.5 text-center">
        {theme.name}
      </div>
    </button>
  );

  // Slide renderer
  const Slide = ({ slide, large }) => {
    const t = slide.theme || themes[selectedTheme];
    const p = large ? 'p-12' : 'p-4';
    const h1 = large ? 'text-4xl' : 'text-base';
    const h2 = large ? 'text-2xl' : 'text-sm';
    const txt = large ? 'text-xl' : 'text-xs';
    const small = large ? 'text-base' : 'text-xs';

    return (
      <div 
        className={`aspect-video rounded-lg ${p} flex flex-col relative overflow-hidden`}
        style={{ background: t.background, color: t.text }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
        
        {/* Decorative side element */}
        <div 
          className="absolute top-8 right-4 bottom-8 w-16 rounded-lg opacity-30"
          style={{ background: t.secondary }}
        />
        
        {slide.type === 'title' ? (
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <h1 className={`${h1} font-bold mb-3 leading-tight`}>{slide.title}</h1>
            {slide.subtitle && (
              <p className={`${h2} opacity-60 mb-6`}>{slide.subtitle}</p>
            )}
            <div className="w-20 h-1 rounded" style={{ background: t.accent }} />
          </div>
        ) : slide.type === 'stats' ? (
          <div className="flex-1 flex flex-col relative z-10">
            <h2 className={`${h2} font-bold mb-4`}>{slide.title}</h2>
            <div className="flex-1 flex items-center">
              <div>
                <p className={`${large ? 'text-7xl' : 'text-3xl'} font-bold`} style={{ color: t.accent }}>
                  {slide.statValue || '73%'}
                </p>
                <p className={`${txt} opacity-60 mt-2`}>{slide.statLabel}</p>
              </div>
            </div>
            {slide.content?.length > 0 && (
              <div className="mt-auto space-y-2">
                {slide.content.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: t.accent }} />
                    <span className={small}>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : slide.type === 'quote' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
            <span className={`${large ? 'text-8xl' : 'text-4xl'} leading-none opacity-30`} style={{ color: t.accent }}>"</span>
            <p className={`${txt} italic max-w-xl leading-relaxed -mt-4`}>
              {slide.quote || slide.content?.[0]}
            </p>
            {slide.quoteAuthor && (
              <p className={`${small} mt-4`} style={{ color: t.accent }}>— {slide.quoteAuthor}</p>
            )}
          </div>
        ) : slide.type === 'conclusion' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
            <h2 className={`${h1} font-bold mb-6`}>{slide.title}</h2>
            <div className="space-y-3 mb-8">
              {slide.content?.map((c, i) => (
                <p key={i} className={txt}>{c}</p>
              ))}
            </div>
            <span 
              className={`px-6 py-2 rounded-full ${small} font-medium`}
              style={{ background: t.accent, color: t.background }}
            >
              Thank You
            </span>
          </div>
        ) : slide.type === 'twoColumn' ? (
          <div className="flex-1 flex flex-col relative z-10">
            <h2 className={`${h2} font-bold mb-4`}>{slide.title}</h2>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {slide.content?.slice(0, Math.ceil(slide.content.length / 2)).map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: t.accent }} />
                    <span className={small}>{c}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-l border-white/20 pl-4">
                {slide.content?.slice(Math.ceil(slide.content.length / 2)).map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: t.accent }} />
                    <span className={small}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col relative z-10">
            <h2 className={`${h2} font-bold mb-4`}>{slide.title}</h2>
            <div className="space-y-3">
              {slide.content?.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: t.accent }} />
                  <span className={txt}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Slide number */}
        <span className={`absolute bottom-2 right-3 ${small} opacity-40`}>{slide.id}</span>
      </div>
    );
  };

  // VIEWS
  
  // Landing
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30" 
               style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)' }} />
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
            Turn your topic into a stunning, professional presentation in seconds.
          </p>

          <button onClick={() => setView('create')} className="px-8 py-4 text-lg font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full shadow-lg">
            Start Creating →
          </button>
        </section>
      </div>
    );
  }

  // Create / Input
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <nav className="flex items-center justify-between px-8 py-5 border-b bg-white/80 backdrop-blur">
          <button onClick={() => setView('landing')} className="text-gray-600 hover:text-gray-900">← Back</button>
          <span className="font-semibold">StudySlides</span>
          <div className="w-16" />
        </nav>

        <main className="max-w-2xl mx-auto px-8 py-10">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold mb-2">What's your presentation about?</h2>
            <p className="text-gray-500 mb-6">Enter a topic and we'll create a professional presentation with real content.</p>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., The impact of social media on teenage mental health"
              className="w-full h-28 px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-lg"
            />

            {/* Presentation Type */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Presentation Type</label>
              <div className="grid grid-cols-3 gap-3">
                {presentationTypes.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setPresentationType(t.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      presentationType === t.id 
                        ? 'border-violet-500 bg-violet-50' 
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <p className="font-medium mt-1">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Count */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Number of Slides</label>
              <div className="flex gap-2">
                {[5, 8, 10, 12].map(n => (
                  <button 
                    key={n} 
                    onClick={() => setSlideCount(n)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      slideCount === n 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {n} slides
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection with Previews */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="flex flex-wrap gap-3">
                {Object.values(themes).map(t => (
                  <ThemePreview 
                    key={t.id}
                    theme={t}
                    selected={selectedTheme === t.id}
                    onClick={() => setSelectedTheme(t.id)}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button 
              onClick={generateOutline} 
              disabled={loading || !prompt.trim()}
              className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                !loading && prompt.trim() 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? loadingMsg : 'Generate Outline →'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Outline
  if (view === 'outline') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <nav className="flex items-center justify-between px-8 py-5 border-b bg-white">
          <button onClick={() => setView('create')} className="text-gray-600 hover:text-gray-900">← Back</button>
          <span className="text-sm text-gray-500">{outline.length} slides</span>
          <button 
            onClick={generateSlides} 
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium"
          >
            Generate Slides →
          </button>
        </nav>

        <main className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-500 mb-8">Review your outline before generating slides</p>

          <div className="space-y-3">
            {outline.map((item, i) => (
              <div key={item.id} className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {item.slideType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    {item.keyPoints?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {item.keyPoints.map((point, j) => (
                          <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-violet-500">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Generating
  if (view === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-8">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Creating Your Slides</h2>
          <p className="text-gray-600 mb-8">{loadingMsg}</p>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${(slides.length / outline.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{slides.length} of {outline.length} slides</p>

          {/* Preview of generated slides */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {slides.map((s, i) => (
              <div key={i} className="w-20 h-12 rounded shadow-sm overflow-hidden">
                <Slide slide={s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Preview
  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-[#1a1a1e] text-white flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 flex flex-col bg-[#141416]">
          <div className="p-4 border-b border-white/10">
            <button onClick={() => setView('outline')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              ← Edit Outline
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {slides.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className={`w-full rounded-lg overflow-hidden transition-all ${
                  currentSlide === i 
                    ? 'ring-2 ring-violet-500' 
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Slide slide={s} />
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141416]">
            <h2 className="font-medium truncate">{title}</h2>
            <div className="flex gap-3">
              <button 
                onClick={() => { setView('landing'); setSlides([]); setOutline([]); setPrompt(''); }} 
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg"
              >
                New
              </button>
              <button 
                onClick={exportPPTX} 
                disabled={loading}
                className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Exporting...' : 'Export PPTX'}
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 flex items-center justify-center bg-[#0a0a0c]">
            <div className="w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden">
              {slides[currentSlide] && <Slide slide={slides[currentSlide]} large />}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 p-4 border-t border-white/10 bg-[#141416]">
            <button 
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} 
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-400 min-w-[80px] text-center">
              {currentSlide + 1} / {slides.length}
            </span>
            <button 
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} 
              disabled={currentSlide === slides.length - 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
