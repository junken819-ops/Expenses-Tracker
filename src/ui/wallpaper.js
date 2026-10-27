/**
 * Cute Wallpaper Studio & Presets
 * Modularized from Pocket Winnie Core
 */

// ── 🎨 CUTE ONLINE WALLPAPER & BACKGROUND STUDIO ──────
const CUTE_WALLPAPERS = [
  {
    id: 'wp_pooh_balloon',
    name: '🎈 维尼气球百亩森林',
    nameEn: '🎈 Pooh Forest & Balloon',
    url: 'https://i.pinimg.com/736x/d4/f4/44/d4f4446eec7e530e612f30f10db39d77.jpg',
    thumb: 'https://i.pinimg.com/736x/d4/f4/44/d4f4446eec7e530e612f30f10db39d77.jpg'
  },
  {
    id: 'wp_pooh_floral',
    name: '🌸 维尼水彩花束',
    nameEn: '🌸 Pooh Floral Bouquets',
    url: 'https://thumbs.dreamstime.com/b/watercolor-winnie-pooh-floral-bouquets-405094895.jpg',
    thumb: 'https://thumbs.dreamstime.com/b/watercolor-winnie-pooh-floral-bouquets-405094895.jpg'
  },
  {
    id: 'wp_pooh_pattern',
    name: '🍯 维尼与好友萌趣印花',
    nameEn: '🍯 Pooh Friends Pattern',
    url: 'https://www.springscreative.com/cdn/shop/files/tiled_preview_square_20250828_145533_a1531b07-841f-4ae4-b0ea-5295a909f986.png?v=1774231993&width=2048',
    thumb: 'https://www.springscreative.com/cdn/shop/files/tiled_preview_square_20250828_145533_a1531b07-841f-4ae4-b0ea-5295a909f986.png?v=1774231993&width=2048'
  },
  {
    id: 'wp_pooh_vintage',
    name: '🧸 复古童话维尼绘本',
    nameEn: '🧸 Vintage Classic Pooh',
    url: 'https://i.etsystatic.com/60775807/r/il/e1db25/7143513889/il_fullxfull.7143513889_gt7m.jpg',
    thumb: 'https://i.etsystatic.com/60775807/r/il/e1db25/7143513889/il_fullxfull.7143513889_gt7m.jpg'
  },
  {
    id: 'wp_pooh_classic',
    name: '🌳 经典百亩森林插画',
    nameEn: '🌳 Classic Hundred Acre Wood',
    url: 'https://cdn.wallpapersafari.com/75/4/BV0XRo.jpg',
    thumb: 'https://cdn.wallpapersafari.com/75/4/BV0XRo.jpg'
  },
  {
    id: 'wp_none',
    name: '🚫 纯净极简',
    nameEn: '🚫 Minimal Clean',
    url: '',
    thumb: ''
  }
];

function applyAppBackground(){
  const bg = el('app-bg-layer');
  if(!bg) return;
  if(!S.wallpaperUrl){
    bg.style.backgroundImage = 'none';
    bg.style.opacity = '0';
  } else {
    bg.style.backgroundImage = `url("${S.wallpaperUrl}")`;
    const op = (S.wallpaperOpacity !== undefined ? S.wallpaperOpacity : 35) / 100;
    bg.style.opacity = String(op);
  }
}

function openWallpaperModal(){
  renderWallpaperPresets();
  const inp = el('custom-wallpaper-url');
  if(inp) inp.value = (S.wallpaperUrl && !CUTE_WALLPAPERS.some(w => w.url === S.wallpaperUrl)) ? S.wallpaperUrl : '';
  const slider = el('wallpaper-opacity-slider');
  if(slider) slider.value = S.wallpaperOpacity !== undefined ? S.wallpaperOpacity : 35;
  const valTxt = el('wallpaper-opacity-val');
  if(valTxt) valTxt.textContent = `${slider ? slider.value : 35}%`;
  openModal('wallpaper-modal');
}

function renderWallpaperPresets(){
  const grid = el('wallpaper-presets-grid');
  if(!grid) return;
  grid.innerHTML = '';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  CUTE_WALLPAPERS.forEach(wp => {
    const card = document.createElement('div');
    const isSelected = (wp.url === '' && !S.wallpaperUrl) || (wp.url && S.wallpaperUrl === wp.url);
    card.className = 'wp-preset-card' + (isSelected ? ' on' : '');
    
    if(wp.url){
      card.innerHTML = `
        <img src="${wp.thumb}" alt="${wp.nameEn}" loading="lazy"/>
        <div class="wp-preset-label">${isZh ? wp.name : wp.nameEn}</div>
      `;
    } else {
      card.innerHTML = `
        <div style="font-size:24px">🚫</div>
        <div class="wp-preset-label">${isZh ? wp.name : wp.nameEn}</div>
      `;
    }

    card.onclick = () => {
      selectWallpaper(wp.url);
    };

    grid.appendChild(card);
  });
}

function selectWallpaper(url){
  S.wallpaperUrl = url;
  save();
  applyAppBackground();
  renderWallpaperPresets();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? '🎨 壁纸已更新！' : '🎨 Wallpaper updated!');
}

function parseImageUrl(rawUrl){
  if(!rawUrl) return '';
  let url = rawUrl.trim();
  // Decode Google Image search result links
  if(url.includes('imgurl=')){
    try {
      const match = url.match(/[?&]imgurl=([^&]+)/i);
      if(match && match[1]){
        return decodeURIComponent(match[1]);
      }
    } catch(e){}
  }
  // Strip quotes if wrapped
  url = url.replace(/^['"]+|['"]+$/g, '');
  return url;
}

function applyCustomWallpaper(){
  const inp = el('custom-wallpaper-url');
  const raw = (inp ? inp.value : '').trim();
  if(!raw){
    selectWallpaper('');
    return;
  }
  const cleanUrl = parseImageUrl(raw);
  if(inp) inp.value = cleanUrl;
  selectWallpaper(cleanUrl);
}

function handleWallpaperFileUpload(event){
  const file = event.target.files && event.target.files[0];
  if(!file) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? '⏳ 正在加载照片...' : '⏳ Loading photo...');
  
  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      // Compress to max 1280px to save storage cleanly
      const canvas = document.createElement('canvas');
      const maxDim = 1280;
      let w = img.width, h = img.height;
      if(w > maxDim || h > maxDim){
        if(w > h){ h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      selectWallpaper(dataUrl);
      toast(isZh ? '🖼️ 照片已成功设为本地壁纸！' : '🖼️ Photo set as local wallpaper!');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateWallpaperOpacity(val){
  const num = parseInt(val) || 35;
  S.wallpaperOpacity = num;
  const valTxt = el('wallpaper-opacity-val');
  if(valTxt) valTxt.textContent = `${num}%`;
  applyAppBackground();
  save();
}

function toggleCustomWpDropdown(){
  const panel = el('wp-custom-panel');
  const arrow = el('wp-dropdown-arrow');
  if(!panel) return;
  const isHidden = panel.classList.contains('hidden');
  if(isHidden){
    panel.classList.remove('hidden');
    if(arrow) arrow.textContent = '▲';
  } else {
    panel.classList.add('hidden');
    if(arrow) arrow.textContent = '▼';
  }
}
