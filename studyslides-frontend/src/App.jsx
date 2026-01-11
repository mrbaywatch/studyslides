import React, { useState, useEffect } from 'react';

const API_URL = 'https://studyslides-api-i3ef.vercel.app';
const PRICE_PER_SLIDE = 20; // NOK

// Format options
const formats = [
  { id: 'presentation', name: 'Presentation', icon: '📊' },
  { id: 'webpage', name: 'Webpage', icon: '🌐' },
  { id: 'document', name: 'Document', icon: '📄' },
  { id: 'social', name: 'Social', icon: '📱' },
];

// All example prompts (will show 6 at a time, shuffle to see more)
const allExamplePrompts = [
  { icon: '📷', text: 'Photography portfolio presentation' },
  { icon: '🏎️', text: 'F1 Legends and their greatest races' },
  { icon: '💼', text: 'Sales techniques for closing deals' },
  { icon: '📈', text: 'Digital marketing trends 2025' },
  { icon: '🌍', text: 'The origin of human language' },
  { icon: '📚', text: 'Book report for "The Great Gatsby"' },
  { icon: '🚀', text: 'SpaceX and the future of space travel' },
  { icon: '🧠', text: 'How artificial intelligence works' },
  { icon: '🌱', text: 'Sustainable living tips for beginners' },
  { icon: '🎮', text: 'The evolution of video games' },
  { icon: '🏋️', text: 'Home workout routines for busy people' },
  { icon: '🍕', text: 'The history of Italian cuisine' },
  { icon: '🎬', text: 'How movies are made: from script to screen' },
  { icon: '💰', text: 'Personal finance basics for students' },
  { icon: '🌊', text: 'Ocean conservation and marine life' },
  { icon: '🏰', text: 'Medieval castles of Europe' },
  { icon: '🎵', text: 'The evolution of pop music' },
  { icon: '🔬', text: 'CRISPR and gene editing explained' },
  { icon: '☕', text: 'The global coffee industry' },
  { icon: '🐕', text: 'Dog breeds and their characteristics' },
  { icon: '🏥', text: 'Healthcare systems around the world' },
  { icon: '✈️', text: 'Budget travel tips for Europe' },
  { icon: '🎨', text: 'Modern art movements explained' },
  { icon: '🌋', text: 'Volcanoes and how they form' },
  { icon: '📱', text: 'The history of smartphones' },
  { icon: '🧘', text: 'Meditation and mindfulness guide' },
  { icon: '🏠', text: 'Interior design trends for small spaces' },
  { icon: '🌸', text: 'Japanese culture and traditions' },
  { icon: '⚽', text: 'World Cup history and memorable moments' },
  { icon: '🎓', text: 'Study tips for better grades' },
];

// All Gamma themes - colors derived from Gamma's colorKeywords
const themeOptions = [
  // Light themes
  { id: 'default-light', name: 'Basic Light', colors: { bg: '#ffffff', accent: '#3b82f6', text: '#1e293b' }, category: 'Light' },
  { id: 'ash', name: 'Ash', colors: { bg: '#f8fafc', accent: '#64748b', text: '#0f172a' }, category: 'Light' },
  { id: 'breeze', name: 'Breeze', colors: { bg: '#f0f9ff', accent: '#0ea5e9', text: '#0c4a6e' }, category: 'Light' },
  { id: 'chimney-smoke', name: 'Chimney Smoke', colors: { bg: '#f1f5f9', accent: '#94a3b8', text: '#1e293b' }, category: 'Light' },
  { id: 'cornflower', name: 'Cornflower', colors: { bg: '#eff6ff', accent: '#3b82f6', text: '#1e40af' }, category: 'Light' },
  { id: 'consultant', name: 'Consultant', colors: { bg: '#f8fafc', accent: '#2563eb', text: '#1e3a8a' }, category: 'Professional' },
  { id: 'commons', name: 'Commons', colors: { bg: '#f8fafc', accent: '#22c55e', text: '#14532d' }, category: 'Light' },
  { id: 'gleam', name: 'Gleam', colors: { bg: '#f8fafc', accent: '#6b7280', text: '#111827' }, category: 'Professional' },
  { id: 'howlite', name: 'Howlite', colors: { bg: '#ffffff', accent: '#18181b', text: '#09090b' }, category: 'Light' },
  { id: 'icebreaker', name: 'Icebreaker', colors: { bg: '#f0f9ff', accent: '#0369a1', text: '#0c4a6e' }, category: 'Light' },
  { id: 'dialogue', name: 'Dialogue', colors: { bg: '#fffbeb', accent: '#f97316', text: '#7c2d12' }, category: 'Light' },
  { id: 'daydream', name: 'Daydream', colors: { bg: '#faf5ff', accent: '#a855f7', text: '#581c87' }, category: 'Colorful' },
  
  // Warm/Earthy themes
  { id: 'creme', name: 'Creme', colors: { bg: '#fefce8', accent: '#a16207', text: '#422006' }, category: 'Light' },
  { id: 'dune', name: 'Dune', colors: { bg: '#fef3c7', accent: '#b45309', text: '#78350f' }, category: 'Light' },
  { id: 'chisel', name: 'Chisel', colors: { bg: '#faf5f0', accent: '#92400e', text: '#451a03' }, category: 'Light' },
  { id: 'finesse', name: 'Finesse', colors: { bg: '#f5f5f0', accent: '#65a30d', text: '#365314' }, category: 'Light' },
  { id: 'flax', name: 'Flax', colors: { bg: '#faf5f0', accent: '#a3886a', text: '#44403c' }, category: 'Light' },
  { id: 'daktilo', name: 'Daktilo', colors: { bg: '#fefce8', accent: '#78716c', text: '#292524' }, category: 'Light' },
  { id: 'clementa', name: 'Clementa', colors: { bg: '#fef2e8', accent: '#ea580c', text: '#431407' }, category: 'Light' },
  { id: 'chocolate', name: 'Chocolate', colors: { bg: '#44403c', accent: '#fbbf96', text: '#fef2f2' }, category: 'Dark' },
  { id: 'cigar', name: 'Cigar', colors: { bg: '#292524', accent: '#b45309', text: '#fef3c7' }, category: 'Dark' },
  { id: 'cornfield', name: 'Cornfield', colors: { bg: '#fefce8', accent: '#65a30d', text: '#365314' }, category: 'Light' },
  
  // Pink/Coral themes
  { id: 'coral-glow', name: 'Coral Glow', colors: { bg: '#fff1f2', accent: '#fb7185', text: '#881337' }, category: 'Colorful' },
  { id: 'ashrose', name: 'Ashrose', colors: { bg: '#fdf4ff', accent: '#c084fc', text: '#581c87' }, category: 'Light' },
  { id: 'ag4mc9ggtxi8iyi', name: 'Flamingo', colors: { bg: '#fff1f2', accent: '#f472b6', text: '#9d174d' }, category: 'Colorful' },
  { id: 'bubble-gum', name: 'Bubble Gum', colors: { bg: '#27272a', accent: '#f472b6', text: '#fdf2f8' }, category: 'Dark' },
  { id: 'atmosphere', name: 'Atmosphere', colors: { bg: '#fdf4ff', accent: '#f97316', text: '#7c2d12' }, category: 'Colorful' },
  
  // Purple/Gradient themes  
  { id: 'gamma', name: 'Gamma', colors: { bg: '#fef3f2', accent: '#f97316', text: '#7c2d12' }, category: 'Colorful' },
  { id: 'elysia', name: 'Elysia', colors: { bg: '#faf5ff', accent: '#06b6d4', text: '#164e63' }, category: 'Colorful' },
  { id: 'electric', name: 'Electric', colors: { bg: '#1e1b4b', accent: '#f97316', text: '#fef3f2' }, category: 'Dark' },
  { id: 'aurora', name: 'Aurora', colors: { bg: '#1e1b4b', accent: '#e879f9', text: '#fdf4ff' }, category: 'Dark' },
  { id: 'nova', name: 'Nova', colors: { bg: '#fdf4ff', accent: '#d946ef', text: '#701a75' }, category: 'Colorful' },
  
  // Dark themes
  { id: 'default-dark', name: 'Basic Dark', colors: { bg: '#1e293b', accent: '#3b82f6', text: '#f1f5f9' }, category: 'Dark' },
  { id: 'coal', name: 'Coal', colors: { bg: '#18181b', accent: '#a1a1aa', text: '#fafafa' }, category: 'Dark' },
  { id: 'chimney-dust', name: 'Chimney Dust', colors: { bg: '#27272a', accent: '#71717a', text: '#e4e4e7' }, category: 'Dark' },
  { id: 'founder', name: 'Founder', colors: { bg: '#0f172a', accent: '#6366f1', text: '#e0e7ff' }, category: 'Dark' },
  { id: 'dawn', name: 'Dawn', colors: { bg: '#1e293b', accent: '#f472b6', text: '#fdf2f8' }, category: 'Dark' },
  { id: 'editoria', name: 'Editoria', colors: { bg: '#292524', accent: '#a8a29e', text: '#fafaf9' }, category: 'Dark' },
  
  // Blue themes
  { id: 'blues', name: 'Blues', colors: { bg: '#1e3a8a', accent: '#60a5fa', text: '#eff6ff' }, category: 'Dark' },
  { id: 'blue-steel', name: 'Blue Steel', colors: { bg: '#1e293b', accent: '#3b82f6', text: '#dbeafe' }, category: 'Dark' },
  { id: 'borealis', name: 'Borealis', colors: { bg: '#0f172a', accent: '#2dd4bf', text: '#ccfbf1' }, category: 'Dark' },
  { id: 'blueberry', name: 'Blueberry', colors: { bg: '#312e81', accent: '#c084fc', text: '#f5f3ff' }, category: 'Dark' },
  
  // Neon/Vibrant themes
  { id: 'alien', name: 'Alien', colors: { bg: '#14532d', accent: '#4ade80', text: '#dcfce7' }, category: 'Dark' },
  { id: 'fluo', name: 'Fluo', colors: { bg: '#18181b', accent: '#a3e635', text: '#ecfccb' }, category: 'Dark' },
  { id: 'atacama', name: 'Atacama', colors: { bg: '#18181b', accent: '#ec4899', text: '#fdf2f8' }, category: 'Dark' },
  { id: 'canaveral', name: 'Canaveral', colors: { bg: '#18181b', accent: '#f97316', text: '#fff7ed' }, category: 'Dark' },
  
  // Gold/Luxury themes
  { id: 'aurum', name: 'Aurum', colors: { bg: '#18181b', accent: '#fbbf24', text: '#fef3c7' }, category: 'Dark' },
  { id: 'gold-leaf', name: 'Gold Leaf', colors: { bg: '#fffbeb', accent: '#d97706', text: '#78350f' }, category: 'Light' },
  
  // Misc themes
  { id: 'bee-happy', name: 'Bee Happy', colors: { bg: '#18181b', accent: '#facc15', text: '#fef9c3' }, category: 'Dark' },
  { id: 'bonan-hale', name: 'Bonan Hale', colors: { bg: '#18181b', accent: '#facc15', text: '#fafafa' }, category: 'Dark' },
  { id: 'gamma-dark', name: 'Gamma Dark', colors: { bg: '#3b0764', accent: '#fb923c', text: '#fef3f2' }, category: 'Dark' },
];

// Text mode options for Paste
const textModes = [
  { id: 'generate', name: 'Generate from notes or an outline', desc: 'Turn rough ideas, bullet points, or outlines into beautiful content' },
  { id: 'condense', name: 'Summarize long text or document', desc: 'Great for condensing detailed content into something more presentable' },
  { id: 'preserve', name: 'Preserve this exact text', desc: 'Create using your text, exactly as you\'ve written it' },
];

// Helper function to shuffle array
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function App() {
  const [view, setView] = useState('landing');
  const [createMode, setCreateMode] = useState(null);
  
  // Common options
  const [format, setFormat] = useState('presentation');
  const [numCards, setNumCards] = useState(10);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [language, setLanguage] = useState('en');
  
  // Example prompts state (for shuffling)
  const [displayedPrompts, setDisplayedPrompts] = useState(allExamplePrompts.slice(0, 6));
  
  // Theme modal state
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themeFilter, setThemeFilter] = useState('Light');
  const [themeSearch, setThemeSearch] = useState('');
  
  // Generate mode
  const [prompt, setPrompt] = useState('');
  
  // Paste mode
  const [pastedText, setPastedText] = useState('');
  const [textMode, setTextMode] = useState('generate');
  
  // Import mode
  const [importUrl, setImportUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  
  // Generation state
  const [generationId, setGenerationId] = useState(null);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Check for successful payment on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');
    
    if (success === 'true' && sessionId) {
      // Payment successful - verify and start generation
      verifyPaymentAndGenerate(sessionId);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (canceled === 'true') {
      setError('Payment was canceled. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Verify payment and start generation
  const verifyPaymentAndGenerate = async (sessionId) => {
    setLoading(true);
    setView('generating');
    setError(null);
    
    try {
      // Verify payment
      const verifyRes = await fetch(`${API_URL}/api/verify-payment?session_id=${sessionId}`);
      const verifyData = await verifyRes.json();
      
      if (!verifyData.paid) {
        throw new Error('Payment not completed');
      }
      
      // Start generation with verified session
      const requestBody = {
        inputText: verifyData.prompt || prompt,
        textMode: 'generate',
        format: verifyData.format || format,
        numCards: verifyData.numSlides,
        sessionId: sessionId,
        textOptions: {
          language: verifyData.language || language
        }
      };
      
      if (verifyData.theme) {
        requestBody.themeId = verifyData.theme;
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
      setGenerationStatus('pending');
      setPollCount(0);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setView('landing');
    }
  };

  // Initiate payment
  const initiatePayment = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt first');
      return;
    }
    
    setIsProcessingPayment(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_URL}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numSlides: numCards,
          prompt: prompt,
          theme: selectedTheme,
          language: language,
          format: format
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setIsProcessingPayment(false);
    }
  };

  // Shuffle example prompts
  const shufflePrompts = () => {
    const shuffled = shuffleArray(allExamplePrompts);
    setDisplayedPrompts(shuffled.slice(0, 6));
  };

  // Poll for generation status
  useEffect(() => {
    if (!generationId) return;
    if (generationStatus === 'failed') return;
    
    // Stop if we have download URL
    if (result?.downloadUrl) {
      setLoading(false);
      setView('result');
      return;
    }

    let isCancelled = false;
    let pollNumber = 0;
    const maxPolls = 40; // 40 polls x 15 seconds = 10 minutes max
    const pollInterval = 15000; // 15 seconds

    const pollStatus = async () => {
      if (isCancelled) return;
      
      pollNumber++;
      setPollCount(pollNumber);
      
      if (pollNumber > maxPolls) {
        // Timeout - show result with whatever we have
        if (result?.gammaUrl) {
          setLoading(false);
          setView('result');
        } else {
          setError('Generation timed out. Please try again.');
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/status?id=${generationId}`);
        const data = await res.json();
        
        console.log(`Poll #${pollNumber}:`, data);
        setGenerationStatus(data.status);
        setResult(data);
        
        // If we have a download URL, we're done!
        if (data.downloadUrl) {
          console.log('Download URL found:', data.downloadUrl);
          setLoading(false);
          setView('result');
          return;
        }
        
        // If completed with gamma URL, show result
        if (data.status === 'completed' && data.gammaUrl) {
          console.log('Completed with gammaUrl:', data.gammaUrl);
          setLoading(false);
          setView('result');
          return;
        }
        
        if (data.status === 'failed') {
          setError('Generation failed. Please try again.');
          setLoading(false);
          return;
        }
        
        // Schedule next poll
        if (!isCancelled) {
          setTimeout(pollStatus, pollInterval);
        }
      } catch (err) {
        console.error('Status check failed:', err);
        // Retry on error
        if (!isCancelled) {
          setTimeout(pollStatus, pollInterval);
        }
      }
    };

    // Start polling immediately
    pollStatus();

    return () => {
      isCancelled = true;
    };
  }, [generationId]); // Only depend on generationId

  // Start generation
  const startGeneration = async () => {
    setLoading(true);
    setError(null);
    setGenerationStatus('pending');
    setPollCount(0);
    setResult(null);
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
    setPollCount(0);
  };

  // Download via proxy (white-label)
  const downloadPresentation = () => {
    if (result?.downloadUrl) {
      // Use our proxy to hide Gamma URL
      const proxyUrl = `${API_URL}/api/download?url=${encodeURIComponent(result.downloadUrl)}`;
      window.open(proxyUrl, '_blank');
    } else if (result?.gammaUrl) {
      // Fallback: open Gamma URL
      window.open(result.gammaUrl, '_blank');
    }
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

  const ThemeDropdown = () => {
    const currentTheme = themeOptions.find(t => t.id === selectedTheme) || themeOptions[0];
    return (
      <button
        onClick={() => setShowThemeModal(true)}
        className="bg-white rounded-full px-4 py-2 shadow-sm border text-sm font-medium text-gray-700 cursor-pointer hover:border-blue-300 transition-all flex items-center gap-2"
      >
        <div 
          className="w-4 h-4 rounded"
          style={{ backgroundColor: currentTheme.colors.bg, border: '1px solid #e5e7eb' }}
        />
        {currentTheme.name}
        <span className="text-gray-400 text-xs">▼</span>
      </button>
    );
  };

  // Theme Preview Card - like Gamma
  const ThemeCard = ({ theme, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden border-2 transition-all hover:shadow-md w-full ${
        isSelected ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Theme preview box */}
      <div 
        className="p-3 h-20"
        style={{ backgroundColor: theme.colors.bg }}
      >
        <div 
          className="text-sm font-semibold mb-1"
          style={{ color: theme.colors.text }}
        >
          Title
        </div>
        <div 
          className="text-xs"
          style={{ color: theme.colors.text, opacity: 0.8 }}
        >
          Body & <span style={{ color: theme.colors.accent, textDecoration: 'underline' }}>link</span>
        </div>
      </div>
      
      {/* Theme name below */}
      <div className="py-1.5 text-center bg-white border-t">
        <span className="text-xs font-medium text-gray-700">{theme.name}</span>
      </div>
      
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </button>
  );

  // Theme Modal - like Gamma with working scroll and filters
  const ThemeModal = () => {
    if (!showThemeModal) return null;
    
    const categories = ['Dark', 'Light', 'Professional', 'Colorful'];
    
    // Filter by category and search
    let filteredThemes = themeOptions;
    if (themeFilter) {
      filteredThemes = filteredThemes.filter(t => t.category === themeFilter);
    }
    if (themeSearch.trim()) {
      filteredThemes = themeOptions.filter(t => 
        t.name.toLowerCase().includes(themeSearch.toLowerCase())
      );
    }

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && setShowThemeModal(false)}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl flex flex-col"
          style={{ width: '340px', maxHeight: '85vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - fixed */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">All themes</h2>
                <p className="text-xs text-gray-500">View and select from all themes</p>
              </div>
              <button 
                onClick={() => setShowThemeModal(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 text-lg"
              >
                ×
              </button>
            </div>
            
            {/* Search */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                <input 
                  type="text"
                  value={themeSearch}
                  onChange={(e) => setThemeSearch(e.target.value)}
                  placeholder="Search for a theme"
                  className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                className="p-1.5 border rounded-lg hover:bg-gray-50 text-xs"
              >
                🔀
              </button>
            </div>
            
            {/* Category filters */}
            <div className="flex gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setThemeFilter(cat); setThemeSearch(''); }}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    themeFilter === cat && !themeSearch
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Theme grid - scrollable */}
          <div className="overflow-y-auto flex-1 p-3" style={{ maxHeight: '400px' }}>
            <div className="grid grid-cols-2 gap-2">
              {filteredThemes.map(theme => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedTheme === theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                />
              ))}
            </div>
            {filteredThemes.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No themes found</p>
            )}
          </div>
          
          {/* Footer - fixed */}
          <div className="p-3 border-t bg-gray-50 flex justify-end gap-2 flex-shrink-0">
            <button
              onClick={() => setShowThemeModal(false)}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition-all border bg-white"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowThemeModal(false)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium transition-all"
            >
              Select theme
            </button>
          </div>
        </div>
      </div>
    );
  };

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
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

            {/* Upload a file */}
            <button
              onClick={() => { setCreateMode('import'); setView('import'); }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all text-left"
            >
              <div className="h-28 rounded-xl bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-300 mb-4 flex items-center justify-center">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Upload a file</h3>
              <p className="text-sm text-gray-500">Transform docs, PDFs, or text files into presentations</p>
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
            {displayedPrompts.map((ex, i) => (
              <button
                key={`${ex.text}-${i}`}
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
            <button 
              onClick={shufflePrompts}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-all"
            >
              🔀 Shuffle
            </button>
          </div>

          {/* Generate button (floating) - shows price */}
          {prompt.trim() && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
              <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">{numCards} slides</div>
                  <div className="text-xl font-bold text-gray-900">{numCards * PRICE_PER_SLIDE} NOK</div>
                </div>
                <button
                  onClick={initiatePayment}
                  disabled={loading || isProcessingPayment}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Processing...' : 'Pay & Generate →'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Theme Modal */}
          <ThemeModal />
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
    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setUploadedFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setFileContent(content);
      };
      
      // Read as text for txt, md files
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        // For other files, just store the name
        setFileContent(`File uploaded: ${file.name}`);
      }
    };

    const handleImportGenerate = () => {
      if (uploadedFile) {
        // Use file content or name as input
        setPrompt(`Create a presentation based on this content: ${fileContent || uploadedFile.name}`);
        setCreateMode('generate');
        startGeneration();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-blue-100 relative">
        <BackButton />
        
        <main className="max-w-2xl mx-auto px-8 pt-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">📁</span>
              <h1 className="text-4xl font-serif italic text-gray-700">Upload a file</h1>
            </div>
            <p className="text-gray-600">Select the file you'd like to transform into a presentation</p>
          </div>

          {/* File upload area */}
          <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all mb-6">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".txt,.md,.pdf,.docx,.pptx"
              onChange={handleFileUpload}
            />
            
            {!uploadedFile ? (
              <label 
                htmlFor="file-upload"
                className="cursor-pointer block text-center"
              >
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📄</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Drop your file here or click to browse</h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Supported formats:</p>
                  <div className="flex justify-center gap-4 mt-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">.txt</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">.md</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">.pdf</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">.docx</span>
                  </div>
                </div>
                <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium">
                  Browse files
                </button>
              </label>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{uploadedFile.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => { setUploadedFile(null); setFileContent(''); }}
                    className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                  <button 
                    onClick={handleImportGenerate}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium"
                  >
                    Generate presentation →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview of file content (for text files) */}
          {fileContent && fileContent.length < 1000 && !fileContent.startsWith('File uploaded:') && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-6">{fileContent.substring(0, 500)}...</p>
            </div>
          )}

          <p className="text-center text-gray-500 text-sm">
            If your file isn't supported, you can also{' '}
            <button 
              onClick={() => { setCreateMode('paste'); setView('paste'); }}
              className="text-blue-600 underline hover:text-blue-800"
            >
              paste in text
            </button>
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
    const getStatusMessage = () => {
      if (generationStatus === 'pending') return 'Starting generation...';
      if (generationStatus === 'processing') return 'Processing content...';
      if (generationStatus === 'generating') return 'Generating slides...';
      if (generationStatus === 'completed') return 'Finalizing presentation...';
      if (generationStatus === 'waiting_for_export') return 'Preparing download file...';
      return 'Connecting...';
    };

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
          <p className="text-gray-600 mb-2">This may take a few minutes for larger presentations...</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{getStatusMessage()}</span>
          </div>
          
          {pollCount > 0 && (
            <p className="mt-4 text-xs text-gray-400">
              Checking status... ({pollCount}/40)
            </p>
          )}

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
    const hasDownloadUrl = !!result?.downloadUrl;
    
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
            <p className="text-gray-600 mb-8">
              {hasDownloadUrl 
                ? 'Click below to download your presentation.'
                : 'Your presentation has been created successfully.'}
            </p>

            {/* Download button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={downloadPresentation}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="text-2xl">📥</span>
                {hasDownloadUrl ? 'Download PowerPoint' : 'Open Presentation'}
              </button>
            </div>

            {!hasDownloadUrl && result?.gammaUrl && (
              <p className="mt-4 text-sm text-gray-500">
                Click "Export" in the toolbar to download as PowerPoint
              </p>
            )}

            {/* Debug info */}
            <div className="mt-6 text-xs text-gray-400">
              {hasDownloadUrl ? '✅ Direct download available' : '⚠️ Using fallback link'}
              {result?.availableKeys && (
                <div className="mt-1">
                  Response keys: {result.availableKeys.join(', ')}
                </div>
              )}
            </div>

            {/* Credits used */}
            {result?.creditsUsed && (
              <p className="mt-4 text-sm text-gray-400">
                Credits used: {result.creditsUsed}
              </p>
            )}
          </div>

          {/* Create another */}
          <div className="mt-8 text-center">
            <button
              onClick={startNew}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ✨ Create another presentation
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}