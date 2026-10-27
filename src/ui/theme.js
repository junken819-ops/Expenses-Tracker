/**
 * Theme Management (Light / Dark / Sakura)
 * Modularized from Pocket Winnie Core
 */

// ── THEME (WINNIE THE POOH & HUNDRED ACRE WOOD) ────────
function applyTheme(){
  const theme = S.theme || 'light';
  document.getElementById('html-root').setAttribute('data-theme', theme);
  const btn = el('theme-btn');
  if(btn){
    if(theme === 'light') btn.textContent = '🍯';
    else if(theme === 'dark') btn.textContent = '🌙';
    else if(theme === 'sakura') btn.textContent = '🌸';
    else btn.textContent = '🍯';
  }
  const st = el('sval-theme');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(st){
    if(theme === 'light') st.textContent = isZh ? '🍯 维尼蜜糖暖金 (Winnie Honey)' : '🍯 Winnie\'s Honey Pot (Light)';
    else if(theme === 'dark') st.textContent = isZh ? '🌙 百亩森林星空夜 (Pooh Midnight)' : '🌙 Pooh\'s Midnight Woods (Dark)';
    else if(theme === 'sakura') st.textContent = isZh ? '🌸 小猪草莓粉樱 (Piglet Sakura)' : '🌸 Piglet\'s Sweet Sakura';
    else st.textContent = isZh ? '🍯 维尼蜜糖暖金 (Winnie Honey)' : '🍯 Winnie\'s Honey Pot (Light)';
  }
}

function toggleTheme(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(S.theme === 'light'){
    S.theme = 'dark';
    toast(isZh ? '🌙 已切换至【百亩森林星空夜】主题' : '🌙 Switched to Pooh\'s Midnight Woods');
  } else if(S.theme === 'dark'){
    S.theme = 'sakura';
    toast(isZh ? '🌸 已切换至【小猪草莓粉樱】主题' : '🌸 Switched to Piglet\'s Sweet Sakura');
  } else {
    S.theme = 'light';
    toast(isZh ? '🍯 已切换至【维尼蜜糖暖金】主题' : '🍯 Switched to Winnie\'s Honey Pot');
  }
  applyTheme();
  save();
}
