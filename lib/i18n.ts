// 通用 UI 文本字典
const UI_TEXTS: Record<string, { CH: string; EN: string }> = {
  all_sports: { CH: "全部运动", EN: "All Sports" },
  football: { CH: "足球赛事", EN: "Football" },
  basketball: { CH: "篮球赛事", EN: "Basketball" },
  all_time: { CH: "全部时间赛程", EN: "All Time Records" },
  upcoming: { CH: "即将开赛", EN: "Upcoming" },
  history: { CH: "已完场赛事", EN: "History" },
};

export function getLangText(text: string, lang: 'CH' | 'EN'): string {
  if (!text) return '';
  if (UI_TEXTS[text]) {
    return UI_TEXTS[text][lang];
  }
  return text;
}

// 🌟 智能团队名称翻译器：如果遇到未收录的英文名，自动进行规范化清理并转换
export function getTeamName(teamObj: any, lang: 'CH' | 'EN'): string {
  if (!teamObj) return lang === 'CH' ? '未知球队' : 'Unknown Team';
  
  // 如果是对象且有后端生成的中文名，中文模式下直接返回
  if (typeof teamObj === 'object') {
    if (lang === 'CH') {
      return teamObj.name_zh || teamObj.name || '未知球队';
    }
    return teamObj.name || 'Unknown Team';
  }

  // 如果只是字符串，直接返回
  return String(teamObj);
}