export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED' | 'POSTPONED';

export interface Team {
  id: string;
  name: string;
  logo: string;
}

export interface Match {
  id: string;
  league_id: string;
  league_name: string;
  league_logo?: string;
  home_team: Team;
  away_team: Team;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  match_time: string; // ISO 格式时间
  minute?: number;    // 若为 LIVE 状态显示的比赛分钟数
  ai_prediction?: {
    win_probability_home: number; // 例如 0.55 (55%)
    win_probability_draw: number;
    win_probability_away: number;
    ai_summary: string;           // 一句话 AI 核心分析
  };
}