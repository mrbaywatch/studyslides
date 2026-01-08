import React, { useState } from 'react';

const API_URL = 'https://studyslides-api-i3ef.vercel.app';

const themes = {
  midnight: { 
    id: 'midnight', name: 'Midnight', 
    background: '#0F172A', text: '#F8FAFC', accent: '#F59E0B', secondary: '#1E293B'
  },
  ocean: { 
    id: 'ocean', name: 'Ocean', 
    background: '#0C4A6E', text: '#F0F9FF', accent: '#38BDF8', secondary: '#075985'
  },
  forest: { 
    id: 'forest', name: 'Forest', 
    background: '#14532D', text: '#F0FDF4', accent: '#4ADE80', secondary: '#166534'
  },
  sunset: { 
    id: 'sunset', name: 'Sunset', 
    background: '#7C2D12', text: '#FFF7ED', accent: '#FB923C', secondary: '#9A3412'
  },
  minimal: { 
    id: 'minimal', name: 'Minimal', 
    background: '#FFFFFF', text: '#1E293B', accent: '#6366F1', secondary: '#F1F5F9'
  },
  dark: { 
    id: 'dark', name: 'Dark', 
    background: '#18181B', text: '#FAFAFA', accent: '#A855F7', secondary: '#27272A'
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

  const generateOutline = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setLoadingMsg('Researching your topic...');
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/generate-outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prompt, slideCount, presentationType })
      });

      if (!res.ok) throw new Error('Failed to generate outline');
      const data = await res.json();
      if (!data.outline?.length) throw new Error('No outline generated');
      
      setOutline(data.outline);
      setTitle(data.title || prompt);
      setView('outline');
    } catch (err) {
      setError(`Error: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const generateSlides = async () => {
    setView('generating');
    setLoading(true);
    setSlides([]);
    const generated = [];

    for (let i = 0; i < outline.length; i++) {
      setLoadingMsg(`Creating slide ${i + 1}: ${outline[i].title}`);
      
      try {
        const res = await fetch(`${API_URL}/api/generate-slide`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slideOutline: outline[i], originalContent: prompt })
        });

        let slideContent = res.ok ? await res.json() : {};

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
          imageUrl: slideContent.imageUrl,
          imageKeyword: slideContent.imageKeyword || outline[i].imageKeyword,
          theme: themes[selectedTheme]
        });
      } catch (err) {
        generated.push({
          id: outline[i].id,
          type: outline[i].slideType,
          title: outline[i].title,
          content: outline[i].keyPoints || [],
          theme: themes[selectedTheme]
        });
      }

      setSlides([...generated]);
      await new Promise(r => setTimeout(r, 200));
    }

    setLoading(false);
    setView('preview');
  };

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
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Theme preview
  const ThemePreview = ({ theme, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`relative w-20 h-14 rounded-lg overflow-hidden transition-all ${
        selected ? 'ring-2 ring-violet-500 ring-offset-2 scale-105' : 'hover:scale-105'
      }`}
      style={{ background: theme.background }}
    >
      <div className="absolute inset-1">
        <div className="h-0.5 w-full rounded" style={{ background: theme.accent }} />
        <div className="mt-1.5 mx-1 h-1.5 w-8 rounded" style={{ background: theme.text, opacity: 0.9 }} />
        <div className="mt-1 mx-1 flex gap-1">
          <div className="h-4 w-5 rounded" style={{ background: theme.secondary }} />
          <div className="flex-1 space-y-0.5">
            <div className="h-1 w-6 rounded" style={{ background: theme.text, opacity: 0.5 }} />
            <div className="h-1 w-4 rounded" style={{ background: theme.text, opacity: 0.5 }} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center">
        {theme.name}
      </div>
    </button>
  );

  // Slide renderer with image support
  const Slide = ({ slide, large }) => {
    const t = slide.theme || themes[selectedTheme];
    const hasImage = slide.imageUrl && ['imageRight', 'imageLeft', 'imageBackground', 'title', 'stats', 'quote'].includes(slide.type);
    
    // Generate fallback image URL if we have keyword but no URL
    const imageUrl = slide.imageUrl || (slide.imageKeyword ? `https://source.unsplash.com/800x600/?${encodeURIComponent(slide.imageKeyword)}` : null);

    const basePadding = large ? 'p-8' : 'p-3';
    const titleSize = large ? 'text-3xl' : 'text-sm';
    const subtitleSize = large ? 'text-lg' : 'text-xs';
    const textSize = large ? 'text-base' : 'text-[10px]';
    const smallSize = large ? 'text-sm' : 'text-[8px]';

    // Title slide
    if (slide.type === 'title') {
      return (
        <div className={`aspect-video rounded-lg overflow-hidden relative`} style={{ background: t.background }}>
          {imageUrl && (
            <>
              <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
          <div className={`relative z-10 h-full flex flex-col items-center justify-center text-center ${basePadding}`}>
            <h1 className={`${titleSize} font-bold text-white mb-2`}>{slide.title}</h1>
            {slide.subtitle && <p className={`${subtitleSize} text-white/70`}>{slide.subtitle}</p>}
            <div className={`${large ? 'mt-6 w-20 h-1' : 'mt-2 w-8 h-0.5'} rounded`} style={{ background: t.accent }} />
          </div>
        </div>
      );
    }

    // Image Right
    if (slide.type === 'imageRight') {
      return (
        <div className={`aspect-video rounded-lg overflow-hidden relative ${basePadding}`} style={{ background: t.background, color: t.text }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
          <div className="h-full flex gap-4">
            <div className="flex-1 flex flex-col">
              <h2 className={`${titleSize} font-bold mb-3`}>{slide.title}</h2>
              <div className="space-y-2">
                {slide.content?.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`${large ? 'w-2 h-2 mt-1.5' : 'w-1 h-1 mt-1'} rounded-full flex-shrink-0`} style={{ background: t.accent }} />
                    <span className={textSize}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            {imageUrl && (
              <div className={`${large ? 'w-2/5' : 'w-1/3'} flex-shrink-0`}>
                <div className="h-full rounded-lg overflow-hidden" style={{ background: t.secondary }}>
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Image Left
    if (slide.type === 'imageLeft') {
      return (
        <div className={`aspect-video rounded-lg overflow-hidden relative ${basePadding}`} style={{ background: t.background, color: t.text }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
          <div className="h-full flex gap-4">
            {imageUrl && (
              <div className={`${large ? 'w-2/5' : 'w-1/3'} flex-shrink-0`}>
                <div className="h-full rounded-lg overflow-hidden" style={{ background: t.secondary }}>
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <h2 className={`${titleSize} font-bold mb-3`}>{slide.title}</h2>
              <div className="space-y-2">
                {slide.content?.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`${large ? 'w-2 h-2 mt-1.5' : 'w-1 h-1 mt-1'} rounded-full flex-shrink-0`} style={{ background: t.accent }} />
                    <span className={textSize}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Image Background
    if (slide.type === 'imageBackground') {
      return (
        <div className={`aspect-video rounded-lg overflow-hidden relative`} style={{ background: t.background }}>
          {imageUrl && (
            <>
              <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
          <div className={`relative z-10 h-full flex flex-col items-center justify-center text-center ${basePadding}`}>
            <h2 className={`${titleSize} font-bold text-white mb-4`}>{slide.title}</h2>
            <div className="space-y-2 max-w-lg">
              {slide.content?.slice(0, 3).map((c, i) => (
                <p key={i} className={`${textSize} text-white/90`}>{c}</p>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Stats
    if (slide.type === 'stats') {
      return (
        <div className={`aspect-video rounded-lg overflow-hidden relative ${basePadding}`} style={{ background: t.background, color: t.text }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
          <div className="h-full flex gap-4">
            <div className="flex-1">
              <h2 className={`${subtitleSize} font-bold mb-2`}>{slide.title}</h2>
              <p className={`${large ? 'text-6xl' : 'text-2xl'} font-bold`} style={{ color: t.accent }}>
                {slide.statValue || '73%'}
              </p>
              <p className={`${smallSize} opacity-60 mt-1`}>{slide.statLabel}</p>
              {slide.content?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {slide.content.slice(0, 2).map((c, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="w-1 h-1 rounded-full mt-1" style={{ background: t.accent }} />
                      <span className={smallSize}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {imageUrl && (
              <div className={`${large ? 'w-1/3' : 'w-1/4'} flex-shrink-0`}>
                <div className="h-full rounded-lg overflow-hidden">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Quote
    if (slide.type === 'quote') {
      return (
        <div className={`aspect-video rounded-lg overflow-hidden relative`} style={{ background: t.background }}>
          {imageUrl && (
            <>
              <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60" />
            </>
          )}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
          <div className={`relative z-10 h-full flex flex-col items-center justify-center text-center ${basePadding}`}>
            <span className={`${large ? 'text-6xl' : 'text-2xl'} opacity-40`} style={{ color: t.accent }}>"</span>
            <p className={`${textSize} italic text-white max-w-lg -mt-2`}>
              {slide.quote || slide.content?.[0]}
            </p>
            {slide.quoteAuthor && (
              <p className={`${smallSize} mt-3`} style={{ color: t.accent }}>— {slide.quoteAuthor}</p>
            )}
          </div>
        </div>
      );
    }

    // Two Column
    if (slide.type === 'twoColumn') {
      const mid = Math.ceil((slide.content?.length || 0) / 2);
      return (
        <div className={`aspect-video rounded-lg overflow-hidden relative ${basePadding}`} style={{ background: t.background, color: t.text }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
          <h2 className={`${titleSize} font-bold mb-3`}>{slide.title}</h2>
          <div className="flex gap-3 h-[calc(100%-2rem)]">
            <div className="flex-1 rounded-lg p-3" style={{ background: t.secondary }}>
              {slide.content?.slice(0, mid).map((c, i) => (
                <div key={i} className="flex items-start gap-1 mb-2">
                  <span className="w-1 h-1 rounded-full mt-1" style={{ background: t.accent }} />
                  <span className={smallSize}>{c}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 rounded-lg p-3" style={{ background: t.secondary }}>
              {slide.content?.slice(mid).map((c, i) => (
                <div key={i} className="flex items-start gap-1 mb-2">
                  <span className="w-1 h-1 rounded-full mt-1" style={{ background: t.accent }} />
                  <span className={smallSize}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Conclusion
    if (slide.type === 'conclusion') {
      return (
        <div className={`aspect-video rounded-lg overflow-hidden relative ${basePadding}`} style={{ background: t.background, color: t.text }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
          <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className={`${titleSize} font-bold mb-4`}>{slide.title}</h2>
            <div className="space-y-2 mb-4">
              {slide.content?.map((c, i) => (
                <p key={i} className={textSize}>✓ {c}</p>
              ))}
            </div>
            <span className={`px-4 py-1.5 rounded-full ${smallSize} font-medium`} style={{ background: t.accent, color: t.background }}>
              Thank You!
            </span>
          </div>
        </div>
      );
    }

    // Default content
    return (
      <div className={`aspect-video rounded-lg overflow-hidden relative ${basePadding}`} style={{ background: t.background, color: t.text }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
        <h2 className={`${titleSize} font-bold mb-3`}>{slide.title}</h2>
        <div className="space-y-2">
          {slide.content?.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`${large ? 'w-2 h-2 mt-1.5' : 'w-1 h-1 mt-1'} rounded-full flex-shrink-0`} style={{ background: t.accent }} />
              <span className={textSize}>{c}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // VIEWS

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <nav className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-semibold">StudySlides</span>
          </div>
          <button onClick={() => setView('create')} className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full">
            Get Started
          </button>
        </nav>

        <section className="max-w-4xl mx-auto px-8 pt-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-gray-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">100% Free • With Images</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Beautiful AI Presentations
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">for Students</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-xl mx-auto mb-10">
            Generate stunning slides with images, real content, and professional layouts in seconds.
          </p>

          <button onClick={() => setView('create')} className="px-8 py-4 text-lg font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full shadow-lg">
            Start Creating →
          </button>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            <span>✓ Auto images</span>
            <span>✓ 6 themes</span>
            <span>✓ Export to PPTX</span>
          </div>
        </section>
      </div>
    );
  }

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
            <p className="text-gray-500 mb-6">We'll create slides with real content and relevant images.</p>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., The impact of social media on teenage mental health"
              className="w-full h-28 px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-lg"
            />

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
              <div className="grid grid-cols-3 gap-3">
                {presentationTypes.map(t => (
                  <button key={t.id} onClick={() => setPresentationType(t.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      presentationType === t.id ? 'border-violet-500 bg-violet-50' : 'border-gray-100 bg-gray-50'
                    }`}>
                    <span className="text-xl">{t.icon}</span>
                    <p className="font-medium mt-1 text-sm">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Slides</label>
              <div className="flex gap-2">
                {[5, 8, 10, 12].map(n => (
                  <button key={n} onClick={() => setSlideCount(n)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium ${
                      slideCount === n ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="flex flex-wrap gap-3">
                {Object.values(themes).map(t => (
                  <ThemePreview key={t.id} theme={t} selected={selectedTheme === t.id} onClick={() => setSelectedTheme(t.id)} />
                ))}
              </div>
            </div>

            {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

            <button onClick={generateOutline} disabled={loading || !prompt.trim()}
              className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg ${
                !loading && prompt.trim() ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
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
          <button onClick={generateSlides} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium">
            Generate Slides →
          </button>
        </nav>

        <main className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-500 mb-8">Review outline • Images will be added automatically</p>

          <div className="space-y-3">
            {outline.map((item, i) => (
              <div key={item.id} className="bg-white rounded-xl p-5 border shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">{item.slideType}</span>
                      {item.imageKeyword && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">📷 {item.imageKeyword}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
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
        <div className="text-center max-w-lg mx-auto px-8">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Creating Your Slides</h2>
          <p className="text-gray-600 mb-8">{loadingMsg}</p>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(slides.length / outline.length) * 100}%` }} />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-8">
            {slides.map((s, i) => (
              <div key={i} className="rounded shadow-sm overflow-hidden">
                <Slide slide={s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-[#1a1a1e] text-white flex">
        <div className="w-56 border-r border-white/10 flex flex-col bg-[#141416]">
          <div className="p-4 border-b border-white/10">
            <button onClick={() => setView('outline')} className="text-sm text-gray-400 hover:text-white">← Edit</button>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {slides.map((s, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`w-full rounded-lg overflow-hidden transition-all ${currentSlide === i ? 'ring-2 ring-violet-500' : 'opacity-60 hover:opacity-100'}`}>
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
                className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg font-medium disabled:opacity-50">
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
            <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30">← Prev</button>
            <span className="text-sm text-gray-400">{currentSlide + 1} / {slides.length}</span>
            <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30">Next →</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
