import MatchList from '@/components/MatchList';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10">
      {/* 欢迎标语区 */}
      <div className="text-center mb-10 px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-mono mb-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          aisport.win — 智能体育比分与 AI 深度分析
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-mono">
          实时赛事比分追踪 · AI 大数据战术拆解 · 全球顶级联赛覆盖
        </p>
      </div>

      {/* 赛事列表模块 */}
      <MatchList />
    </main>
  );
}