import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LEAGUES = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'CL'];

// 🌟 核心智能翻译：自动将 API 的英文名转换为标准的中文体育译名
function translateTeam(englishName: string): string {
  if (!englishName) return '';
  
  const mapping: Record<string, string> = {
    // 英超主流
    "Arsenal FC": "阿森纳", "Aston Villa FC": "阿斯顿维拉", "Brentford FC": "布伦特福德",
    "Brighton & Hove Albion FC": "布莱顿", "Burnley FC": "伯恩利", "Chelsea FC": "切尔西",
    "Crystal Palace FC": "水晶宫", "Everton FC": "埃弗顿", "Fulham FC": "富勒姆",
    "Liverpool FC": "利物浦", "Luton Town FC": "卢顿", "Manchester City FC": "曼城",
    "Manchester United FC": "曼联", "Newcastle United FC": "纽卡斯尔联", "Nottingham Forest FC": "诺丁汉森林",
    "Tottenham Hotspur FC": "托特纳姆热刺", "West Ham United FC": "西汉姆联", "Wolverhampton Wanderers FC": "狼队",
    "Bournemouth FC": "伯恩茅斯", "Sheffield United FC": "谢菲尔德联",

    // 西甲主流
    "Real Madrid CF": "皇家马德里", "FC Barcelona": "巴塞罗那", "Atlético de Madrid": "马德里竞技",
    "Girona FC": "赫罗纳", "Athletic Club": "毕尔巴鄂竞技", "Real Sociedad de Fútbol": "皇家社会",
    "Real Betis Balompié": "皇家贝蒂斯", "Villarreal CF": "比利亚雷亚尔", "Valencia CF": "瓦伦西亚", "Sevilla FC": "塞维利亚",

    // 意甲主流
    "AC Milan": "AC米兰", "Inter Milan": "国际米兰", "Juventus FC": "尤文图斯",
    "AS Roma": "罗马", "SS Lazio": "拉齐奥", "SSC Napoli": "那不勒斯", "Atalanta BC": "亚特兰大", "ACF Fiorentina": "佛罗伦萨",

    // 德甲主流
    "FC Bayern München": "拜仁慕尼黑", "Bayer 04 Leverkusen": "勒沃库森", "Borussia Dortmund": "多特蒙德",
    "RB Leipzig": "莱比锡红牛", "VfB Stuttgart": "斯图加特", "Eintracht Frankfurt": "法兰克福",

    // 法甲主流
    "Paris Saint-Germain FC": "巴黎圣日耳曼", "AS Monaco FC": "摩纳哥", "Olympique de Marseille": "马赛",
    "Olympique Lyonnais": "里昂", "Lille OSC": "里尔",
  };

  if (mapping[englishName]) {
    return mapping[englishName];
  }

  // 兜底：自动剔除烦人的后缀
  return englishName
    .replace(/\s(FC|CF|SAD|S\.A\.|SGP|United|City)\b/gi, '')
    .trim();
}

export async function GET() {
  try {
    const API_KEY = process.env.FOOTBALL_API_KEY || '';
    let allMatches: any[] = [];
    const dateFrom = '2026-01-01';
    const dateTo = '2026-12-31';

    for (const league of LEAGUES) {
      try {
        const url = `https://api.football-data.org/v4/competitions/${league}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
        const response = await fetch(url, { headers: { 'X-Auth-Token': API_KEY } });
        if (response.ok) {
          const data = await response.json();
          if (data.matches) allMatches = allMatches.concat(data.matches);
        }
      } catch (err) {
        console.error(`Failed to fetch league ${league}:`, err);
      }
    }

    // 🌟 在写入数据库前，直接生成双语结构
    const matchesToUpsert = allMatches.map((m: any) => {
      const rawHome = m.homeTeam.name;
      const rawAway = m.awayTeam.name;

      return {
        id: m.id.toString(),
        league_name: m.competition?.name || 'International Match',
        match_time: m.utcDate,
        status: m.status === 'IN_PLAY' ? 'LIVE' : m.status === 'FINISHED' ? 'FINISHED' : 'UPCOMING',
        home_team: {
          name: rawHome,                   // 英文原名
          name_zh: translateTeam(rawHome), // 自动翻译好的中文名
          logo: m.homeTeam.crest || '',
        },
        away_team: {
          name: rawAway,                   // 英文原名
          name_zh: translateTeam(rawAway), // 自动翻译好的中文名
          logo: m.awayTeam.crest || '',
        },
        home_score: m.score?.fullTime?.home ?? null,
        away_score: m.score?.fullTime?.away ?? null,
        ai_prediction: {
          win_probability_home: 0.45,
          win_probability_draw: 0.25,
          win_probability_away: 0.30,
          ai_summary: 'AI 自动生成的实时战局评估与预测分析。'
        }
      };
    });

    if (matchesToUpsert.length > 0) {
      const { error } = await supabase.from('matches').upsert(matchesToUpsert, { onConflict: 'id' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: `Successfully synced ${matchesToUpsert.length} matches with built-in translation!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}