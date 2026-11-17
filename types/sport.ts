export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED' | 'POSTPONED';

export interface Team {
  id: string;
  name: string;
  logo: string;
}

export interface Match {
  id: string;
  league_name?: string;
  home_team: string;
  away_team: string;
  home_score?: number | null;
  away_score?: number | null;
  status: string;
  match_time?: string;
  ai_prediction?: {
    win_probability_home?: number;
    win_probability_draw?: number;
    win_probability_away?: number;
    ai_summary?: string;
  };
  // 🌟 在这里加上这行历史交锋记录的类型定义
  h2h_records?: Array<{
    date?: string;
    home_team_name?: string;
    away_team_name?: string;
    score?: string;
  }>;
}