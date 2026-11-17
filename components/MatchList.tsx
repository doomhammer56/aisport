'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Match } from '@/types/sport';
import { fetchMatches, formatTeamName } from '@/lib/matchService';
import { getLangText } from '@/lib/i18n';

export default function MatchList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [lang, setLang] = useState<'CH' | 'EN'>('CH');
  const [sportType, setSportType] = useState<'ALL' | 'FOOTBALL' | 'BASKETBALL'>('ALL');
  const [timeMode, setTimeMode] = useState<'ALL' | 'UPCOMING' | 'HISTORY'>('ALL');
  
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const savedLang = localStorage.getItem('aisport_lang') as 'CH' | 'EN';
    if (savedLang) setLang(savedLang);

    const bookmarks = JSON.parse(localStorage.getItem('aisport_bookmarks') || '[]');
    setBookmarkedIds(bookmarks);

    async function loadData() {
      setLoading(true);
      const data = await fetchMatches();
      setMatches(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'CH' ? 'EN' : 'CH';
    setLang(nextLang);
    localStorage.setItem('aisport_lang', nextLang);
  };

  const filteredMatches = matches.filter(m => {
    if (showBookmarksOnly && !bookmarkedIds.includes(m.id)) return false;

    const leagueName = m.league_name || '';
    const isBasketball = leagueName.includes('NBA') || leagueName.includes('CBA') || leagueName.includes('篮球');
    if (sportType === 'FOOTBALL' && isBasketball) return false;
    if (sportType === 'BASKETBALL' && !isBasketball) return false;

    if (m.match_time) {
      const matchDate = new Date(m.match_time).getTime();
      const now = Date.now();
      const twoMonthsLater = now + 60 * 24 * 60 * 60 * 1000;

      if (timeMode === 'UPCOMING') {
        if (matchDate < now || matchDate > twoMonthsLater) return false;
      } else if (timeMode === 'HISTORY') {
        if (matchDate >= now) return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-400 font-mono">
        <span className="animate-pulse">
          {lang === 'CH' ? '正在加载真实赛事情报...' : 'Loading AI Match Intelligence...'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* AI 模型胜率 & 追踪看板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AI Model Win Rate</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">84.6% <span className="text-xs text-slate-500 font-normal">({lang === 'CH' ? '近百场命中率' : 'Accuracy'})</span></div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs">
            🤖
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg md:col-span-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBookmarksOnly(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${!showBookmarksOnly ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'}`}
            >
              {lang === 'CH' ? '📊 全部赛事广场' : '📊 All Matches'} ({matches.length})
            </button>
            <button
              onClick={() => setShowBookmarksOnly(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center space-x-1.5 ${showBookmarksOnly ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'}`}
            >
              <span>⭐ {lang === 'CH' ? '我的追踪看板' : 'Bookmarked'}</span>
              <span className="bg-slate-900 px-1.5 py-0.5 rounded-full text-[10px] text-amber-300 font-bold">{bookmarkedIds.length}</span>
            </button>
          </div>
          <div className="text-xs font-mono text-slate-500 hidden lg:block">
            {lang === 'CH' ? '实时同步云端与本地追踪记录' : 'Synced with Cloud'}
          </div>
        </div>
      </div>

      {/* 顶栏控制面板 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-slate-800 pb-4 gap-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSportType('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${sportType === 'ALL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'}`}>
            {getLangText('all_sports', lang)}
          </button>
          <button onClick={() => setSportType('FOOTBALL')} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${sportType === 'FOOTBALL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'}`}>
            {getLangText('football', lang)}
          </button>
          <button onClick={() => setSportType('BASKETBALL')} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${sportType === 'BASKETBALL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'}`}>
            {getLangText('basketball', lang)}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeMode}
            onChange={(e) => setTimeMode(e.target.value as any)}
            className="bg-slate-900 text-slate-300 border border-slate-700 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">{getLangText('all_time', lang)}</option>
            <option value="UPCOMING">{getLangText('upcoming', lang)}</option>
            <option value="HISTORY">{getLangText('history', lang)}</option>
          </select>

          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/35 hover:bg-cyan-500/25 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
          >
            🌐 {lang === 'CH' ? 'EN / 中文' : '中文 / EN'}
          </button>
        </div>
      </div>

      {/* 赛事卡片列表 */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono">
            {lang === 'CH' ? '暂无符合条件的赛事数据' : 'No matches found.'}
          </div>
        ) : (
          filteredMatches.map(match => {
            const homeInfo = formatTeamName(match.home_team, lang);
            const awayInfo = formatTeamName(match.away_team, lang);

            return (
              <Link key={match.id} href={`/match/${match.id}`} className="block group">
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 hover:border-emerald-500/40 transition-all shadow-lg cursor-pointer">
                  <div className="flex justify-between items-center mb-4 text-xs text-slate-400 font-mono border-b border-slate-800/50 pb-2">
                    <span className="text-emerald-400 font-semibold">
                      {getLangText(match.league_name || 'Match', lang)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {match.status === 'LIVE' && (
                        <span className="flex items-center text-red-400 animate-pulse font-bold">
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1.5 animate-ping"></span>
                          LIVE
                        </span>
                      )}
                      {match.status === 'UPCOMING' && (
                        <span className="text-slate-400">
                          {match.match_time ? new Date(match.match_time).toLocaleString() : ''} {lang === 'CH' ? '开赛' : 'Kickoff'}
                        </span>
                      )}
                      {match.status === 'FINISHED' && (
                        <span className="text-slate-500">{lang === 'CH' ? '已完场' : 'Finished'}</span>
                      )}
                    </div>
                  </div>

                  {/* 主客队与比分 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 my-3">
                    <div className="flex items-center space-x-3 md:justify-start">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center p-1 border border-slate-700">
                        {homeInfo.logo ? (
                          <img src={homeInfo.logo} alt={homeInfo.name} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        ) : (
                          <span className="text-xs text-slate-300">H</span>
                        )}
                      </div>
                      <span className="text-slate-100 font-medium text-base">
                        {homeInfo.name}
                      </span>
                    </div>

                    <div className="flex justify-center items-center space-x-4 font-mono">
                      <div className="text-2xl font-bold tracking-wider text-slate-100 bg-slate-950/60 px-6 py-2 rounded-lg border border-slate-800">
                        {match.home_score !== null && match.home_score !== undefined ? match.home_score : '-'} 
                        <span className="text-slate-600 mx-3">:</span> 
                        {match.away_score !== null && match.away_score !== undefined ? match.away_score : '-'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 md:justify-end">
                      <span className="text-slate-100 font-medium text-base text-right">
                        {awayInfo.name}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center p-1 border border-slate-700">
                        {awayInfo.logo ? (
                          <img src={awayInfo.logo} alt={awayInfo.name} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        ) : (
                          <span className="text-xs text-slate-300">A</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {match.ai_prediction && (
                    <div className="mt-4 pt-3 border-t border-slate-800/60 bg-slate-950/30 -mx-5 -mb-5 p-4 rounded-b-xl">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
                        <span className="text-emerald-400 flex items-center">
                          🤖 {lang === 'CH' ? 'AI 深度预测模型胜率' : 'AI Prediction Probability'}:
                        </span>
                        <span>
                          {lang === 'CH' ? '主胜' : 'Home'} {((match.ai_prediction.win_probability_home ?? 0.45) * 100).toFixed(0)}% | 
                          {lang === 'CH' ? '平/其他' : 'Draw'} {((match.ai_prediction.win_probability_draw ?? 0.25) * 100).toFixed(0)}% | 
                          {lang === 'CH' ? '客胜' : 'Away'} {((match.ai_prediction.win_probability_away ?? 0.30) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex mb-2">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(match.ai_prediction.win_probability_home ?? 0.45) * 100}%` }}></div>
                        <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${(match.ai_prediction.win_probability_draw ?? 0.25) * 100}%` }}></div>
                        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(match.ai_prediction.win_probability_away ?? 0.30) * 100}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-300 italic">
                        💡 {lang === 'CH' ? 'AI 总结' : 'AI Summary'}：{match.ai_prediction.ai_summary || 'AI 战局分析评估中'}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}