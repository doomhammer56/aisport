import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🌐 终极万能中英文翻译字典
const GLOBAL_TEAM_MAP: Record<string, string> = {
  // 西甲
  "Real Madrid CF": "皇家马德里", "FC Barcelona": "巴塞罗那", "Atlético de Madrid": "马德里竞技",
  "Girona FC": "赫罗纳", "Athletic Club": "毕尔巴鄂竞技", "Real Sociedad de Fútbol": "皇家社会",
  "Real Betis Balompié": "皇家贝蒂斯", "Villarreal CF": "比利亚雷亚尔", "Valencia CF": "瓦伦西亚", 
  "Sevilla FC": "塞维利亚", "Rayo Vallecano de Madrid": "巴列卡诺", "Real Racing Club de Santander": "桑坦德竞技", 
  "RCD Espanyol de Barcelona": "西班牙人", "Levante UD": "莱万特", "CA Osasuna": "奥萨苏纳", 
  "Getafe CF": "赫塔费", "RCD Mallorca": "马略卡", "Cádiz CF": "加的斯", "Deportivo Alavés": "阿拉维斯",

  // 英超
  "Arsenal FC": "阿森纳", "Aston Villa FC": "阿斯顿维拉", "Chelsea FC": "切尔西",
  "Everton FC": "埃弗顿", "Fulham FC": "富勒姆", "Liverpool FC": "利物浦",
  "Manchester City FC": "曼城", "Manchester United FC": "曼联", "Newcastle United FC": "纽卡斯尔联",
  "Nottingham Forest FC": "诺丁汉森林", "Tottenham Hotspur FC": "托特纳姆热刺", "West Ham United FC": "西汉姆联",
  "Wolverhampton Wanderers FC": "狼队", "Brighton & Hove Albion FC": "布莱顿", "Crystal Palace FC": "水晶宫",
  "Brentford FC": "布伦特福德", "Bournemouth FC": "伯恩茅斯", "Burnley FC": "伯恩利",

  // 意甲
  "AC Milan": "AC米兰", "Inter Milan": "国际米兰", "Juventus FC": "尤文图斯",
  "AS Roma": "罗马", "SS Lazio": "拉齐奥", "SSC Napoli": "那不勒斯", "Atalanta BC": "亚特兰大", "ACF Fiorentina": "佛罗伦萨",

  // 德甲
  "FC Bayern München": "拜仁慕尼黑", "Bayer 04 Leverkusen": "勒沃库森", "Borussia Dortmund": "多特蒙德",
  "RB Leipzig": "莱比锡红牛", "VfB Stuttgart": "斯图加特", "Eintracht Frankfurt": "法兰克福",

  // 法甲
  "Paris Saint-Germain FC": "巴黎圣日耳曼", "AS Monaco FC": "摩纳哥", "Olympique de Marseille": "马赛",
  "Olympique Lyonnais": "里昂", "Lille OSC": "里尔",
};

// 🌟 核心双语转换函数：严格根据 lang 返回对应的中文或英文
export function formatTeamName(teamData: any, lang: 'CH' | 'EN'): { name: string; logo: string } {
  if (!teamData) {
    return { name: lang === 'CH' ? '未知球队' : 'Unknown Team', logo: '' };
  }

  let rawName = '';
  let logo = '';

  if (typeof teamData === 'object') {
    rawName = teamData.name || '';
    logo = teamData.logo || '';
  } else {
    rawName = String(teamData);
  }

  // 如果当前是英文模式，直接返回数据库原英文名
  if (lang === 'EN') {
    return { name: rawName, logo };
  }

  // 如果当前是中文模式，优先查字典
  if (GLOBAL_TEAM_MAP[rawName]) {
    return { name: GLOBAL_TEAM_MAP[rawName], logo };
  }

  // 兜底清洗英文后缀
  const cleaned = rawName
    .replace(/\b(Real|CF|FC|CD|UD|SAD|Club|de|Y|Sociedad|Balompié|S\.A\.)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { name: cleaned || rawName, logo };
}

// 获取比赛列表
export async function fetchMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_time', { ascending: true });

  if (error) {
    console.error('Supabase 读取报错:', error);
    return [];
  }
  return data || [];
}

// 🌟 严格只从数据库读取真实比赛及关联的 h2h_records，绝不生成、绝不伪造任何假数据
export async function fetchMatchById(id: string) {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*, h2h_records(*)')
      .eq('id', id)
      .single();

    if (!error && data) {
      // 确保 h2h_records 严格使用数据库真实返回的值（如果没有就是空数组 []）
      return {
        ...data,
        h2h_records: data.h2h_records || []
      };
    }
  } catch (e) {}

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();

  if (fallbackError) return null;

  return {
    ...fallbackData,
    h2h_records: []
  };
}