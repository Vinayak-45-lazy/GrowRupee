import React, { useState, useEffect } from 'react';
import { getMerchantInsight } from '../services/api';
import { Sparkles, Send, BrainCircuit, Lightbulb, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function MerchantInsights() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [insightData, setInsightData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial fetch of default AI strategy
    handleAskQuestion('');
  }, []);

  const handleAskQuestion = async (customPrompt) => {
    try {
      setLoading(true);
      setError(null);
      const q = customPrompt !== undefined ? customPrompt : question;
      const res = await getMerchantInsight(q);

      if (res.success) {
        setInsightData(res);
      } else {
        setError('Failed to generate AI insight');
      }
    } catch (err) {
      console.error('Error fetching merchant insight:', err);
      setError('Error connecting to Groq AI service');
    } finally {
      setLoading(false);
    }
  };

  const presetQuestions = [
    'How can I grow total sales this month?',
    'Which top co-occurring items should I bundle into combos?',
    'How do I boost my current Average Order Value (AOV)?',
    'What pricing tweaks will improve my checkout upsell rate?',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span>Groq Llama 3 Powered Agent</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          AI Merchant Growth Advisor
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ask strategic questions about your store. Express computes order history stats deterministically, and Groq converts them into executable growth plays.
        </p>
      </div>

      {/* Preset Question Chips */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Suggested Questions</span>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuestion(q);
                handleAskQuestion(q);
              }}
              className="text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all text-left"
            >
              💡 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Query Input */}
      <div className="glass-card p-2 rounded-2xl border border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
          placeholder="Ask a question (e.g. How can I increase order value for weekend lunch?)"
          className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleAskQuestion()}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask Agent</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* AI Insight Output Panel */}
      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-slate-200 font-bold text-sm">Aggregating Store Data & Consulting Groq Llama 3...</p>
            <p className="text-slate-400 text-xs">Evaluating revenue, order co-occurrences, and AOV benchmarks.</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 glass-card rounded-2xl text-center border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      ) : insightData && (
        <div className="space-y-6">
          
          {/* Key Metrics Snapshot Banner */}
          {insightData.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-panel p-3 rounded-xl text-center border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Analyzed Revenue</span>
                <span className="text-sm font-extrabold text-white">₹{insightData.stats.totalRevenue?.toLocaleString()}</span>
              </div>
              <div className="glass-panel p-3 rounded-xl text-center border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Avg Order Value</span>
                <span className="text-sm font-extrabold text-sky-400">₹{insightData.stats.avgOrderValue}</span>
              </div>
              <div className="glass-panel p-3 rounded-xl text-center border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Upsell Conv. Rate</span>
                <span className="text-sm font-extrabold text-purple-400">{insightData.stats.upsellAcceptanceRate}%</span>
              </div>
              <div className="glass-panel p-3 rounded-xl text-center border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Top Pair Count</span>
                <span className="text-sm font-extrabold text-emerald-400">{insightData.stats.topPair?.count || 0} orders</span>
              </div>
            </div>
          )}

          {/* AI Advisor Response Box */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-indigo-500/30 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">PayPilot Strategic Growth Output</h3>
              </div>
              <span className="text-[11px] text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Llama 3.3 70B Model
              </span>
            </div>

            {/* Markdown Advice Content */}
            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {insightData.insight}
            </div>

            {/* Architectural Integrity Footer */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Express Analytics + Natural Language Groq Phrasing</span>
              </div>
              <button
                onClick={() => handleAskQuestion()}
                className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3 inline" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
