// ============================================================
  // JORNAL
  // ============================================================
  const JOURNAL_CACHE_HOURS=8;
  const JOURNAL_CATEGORIES=[
    {id:'ia',label:'IA',
      query:'inteligência artificial OR IA OR ChatGPT',
      sources:[
        {label:'Google News (padrão)',type:'googleNews',query:'inteligência artificial OR IA OR ChatGPT'},
        {label:'OpenAI News',type:'rss',url:'https://openai.com/news/rss.xml'},
        {label:'Google DeepMind Blog',type:'rss',url:'https://deepmind.google/discover/blog/rss.xml'},
        {label:'Hugging Face Blog',type:'rss',url:'https://huggingface.co/blog/feed.xml'},
        {label:'MIT Tech Review AI',type:'googleNews',query:'site:technologyreview.com artificial intelligence'},
        {label:'VentureBeat AI',type:'googleNews',query:'site:venturebeat.com/category/ai artificial intelligence'},
      ]},
    {id:'programacao',label:'Programação',
      query:'programação OR desenvolvimento de software OR tecnologia',
      sources:[
        {label:'Google News (padrão)',type:'googleNews',query:'programação OR desenvolvimento de software OR tecnologia'},
        {label:'GitHub Blog',type:'rss',url:'https://github.blog/feed/'},
        {label:'GitHub Changelog',type:'rss',url:'https://github.blog/changelog/feed/'},
        {label:'Stack Overflow Blog',type:'rss',url:'https://stackoverflow.blog/feed/'},
        {label:'InfoQ Software',type:'rss',url:'https://feed.infoq.com/news'},
        {label:'Hacker News',type:'rss',url:'https://news.ycombinator.com/rss'},
      ]},
    {id:'esportes',label:'Esportes',
      query:'esportes hoje',
      sources:[
        {label:'Google News (padrão)',type:'googleNews',query:'esportes hoje'},
        {label:'ge.globo Esportes',type:'rss',url:'https://ge.globo.com/rss/ge/ultimas-noticias/'},
        {label:'ESPN Brasil',type:'googleNews',query:'site:espn.com.br esportes'},
        {label:'BBC Sport',type:'rss',url:'https://feeds.bbci.co.uk/sport/rss.xml'},
        {label:'Reuters Sports',type:'googleNews',query:'site:reuters.com/sports sports'},
      ]},
    {id:'nba',label:'NBA',
      query:'NBA basquete',
      sources:[
        {label:'Google News (padrão)',type:'googleNews',query:'NBA basquete'},
        {label:'ESPN NBA',type:'googleNews',query:'site:espn.com/nba NBA'},
        {label:'HoopsHype',type:'rss',url:'https://hoopshype.com/feed/'},
        {label:'The Athletic NBA',type:'googleNews',query:'site:nytimes.com/athletic/nba NBA'},
        {label:'NBA.com',type:'googleNews',query:'site:nba.com/news NBA'},
      ]},
    {id:'futebol',label:'Futebol',
      query:'futebol brasileiro OR futebol mundial',
      sources:[
        {label:'Google News (padrão)',type:'googleNews',query:'futebol brasileiro OR futebol mundial'},
        {label:'ge.globo Futebol',type:'rss',url:'https://ge.globo.com/rss/ge/futebol/'},
        {label:'ge.globo Brasileirão',type:'rss',url:'https://ge.globo.com/rss/ge/brasileirao-serie-a/'},
        {label:'ESPN Brasil Futebol',type:'googleNews',query:'site:espn.com.br/futebol futebol'},
        {label:'BBC Football',type:'rss',url:'https://feeds.bbci.co.uk/sport/football/rss.xml'},
      ]},
    {id:'ufc-mma',label:'UFC/MMA',
      query:'UFC OR MMA',
      sources:[
        {label:'Google News (padrão)',type:'googleNews',query:'UFC OR MMA'},
        {label:'Sherdog MMA News',type:'rss',url:'https://www.sherdog.com/rss/news.xml'},
        {label:'MMA Fighting',type:'rss',url:'https://www.mmafighting.com/rss/current'},
        {label:'MMA Junkie',type:'rss',url:'https://mmajunkie.usatoday.com/feed'},
        {label:'ESPN MMA',type:'googleNews',query:'site:espn.com.br/mma UFC OR MMA'},
      ]},
    {id:'mercado',label:'Mercado econômico',
      query:'mercado financeiro OR economia OR bolsa de valores',
      sources:[
        {label:'Google News (padrão)',type:'googleNews',query:'mercado financeiro OR economia OR bolsa de valores'},
        {label:'Reuters Markets',type:'googleNews',query:'site:reuters.com/markets economy markets finance'},
        {label:'Valor Econômico',type:'googleNews',query:'site:valor.globo.com mercado economia'},
        {label:'InfoMoney',type:'googleNews',query:'site:infomoney.com.br mercado'},
        {label:'CNBC Markets',type:'googleNews',query:'site:cnbc.com/markets economy finance'},
        {label:'Bloomberg',type:'googleNews',query:'site:bloomberg.com markets economy'},
      ]},
    {id:'mundo',label:'Mundo',
      query:'notícias internacionais OR mundo',
      sources:[
        {label:'Google News (padrão)',type:'googleNews',query:'notícias internacionais OR mundo'},
        {label:'BBC Brasil',type:'rss',url:'https://feeds.bbci.co.uk/portuguese/rss.xml'},
        {label:'Reuters World',type:'googleNews',query:'site:reuters.com world news'},
        {label:'Al Jazeera',type:'googleNews',query:'site:aljazeera.com world news'},
        {label:'The Guardian World',type:'rss',url:'https://www.theguardian.com/world/rss'},
        {label:'AP News World',type:'googleNews',query:'site:apnews.com world news'},
      ]},
  ];
  const CAT_COLORS={
    ia:'#7c5cbf',
    programacao:'#3a8abf',
    esportes:'#3abf7c',
    nba:'#bf7c3a',
    futebol:'#3a7cbf',
    'ufc-mma':'#bf3a3a',
    mercado:'#8abf3a',
    mundo:'#bf3abf'
  };
  const JOURNAL_ALL_SOURCES='all';
  let journalActiveSourceFilter={};

  // Funções de fonte por categoria
  function getJournalCatSource(catId){
    try{return JSON.parse(localStorage.getItem('durando_journal_source_'+catId)||'null');}
    catch{return null;}
  }
  function saveJournalCatSource(catId,sourceQuery){
    if(sourceQuery===null||sourceQuery===undefined)
      localStorage.removeItem('durando_journal_source_'+catId);
    else
      localStorage.setItem('durando_journal_source_'+catId,JSON.stringify(sourceQuery));
  }
  function getJournalQueryForCat(cat){
    const saved=getJournalCatSource(cat.id);
    if(saved===null||saved===undefined)return cat.query;
    return saved||cat.query;
  }

  function initJournal(){
    journalFavorites=loadJournalFavoritesLocal();
    renderJournalCategories();
    renderJournalSettingsUi();
    scheduleJournalNotificationLoop();
    if(currentUser&&(journalFcmToken||getJournalSettings().fcmToken)){
      saveJournalFcmToken(journalFcmToken||getJournalSettings().fcmToken).catch(e=>console.warn('FCM token update error:',e));
    }
  }

  function getJournalSettings(){
    const defaults={source:'rss2json',gnewsKey:'',notifyEnabled:false,notifyTime:'08:30',notifyCategory:'ia',lastNotifyDate:'',vapidKey:FIREBASE_MESSAGING_VAPID_KEY,fcmToken:''};
    try{return {...defaults,...(JSON.parse(localStorage.getItem('durando_journal_settings'))||{})};}
    catch{return defaults;}
  }
  function saveJournalSettings(s){localStorage.setItem('durando_journal_settings',JSON.stringify({...getJournalSettings(),...s}));}
  function journalCat(id){return JOURNAL_CATEGORIES.find(c=>c.id===id)||JOURNAL_CATEGORIES[0];}
  function journalTodayKey(){return new Date().toISOString().slice(0,10);}
  function journalHash(s){let h=0;for(let i=0;i<String(s).length;i++){h=((h<<5)-h)+String(s).charCodeAt(i);h|=0;}return Math.abs(h).toString(36);}
  function journalCacheKey(catId){return 'durando_journal_cache_'+catId;}

  function renderJournalCategories(){
    const host=document.getElementById('journalCategories');
    const notifySel=document.getElementById('journalNotifyCategory');
    if(host){
      const feed='<button class="journal-chip '+(journalSelectedCategory==='feed'?'active':'')+'" onclick="selectJournalCategory(\'feed\')">Feed</button>';
      host.innerHTML=feed+JOURNAL_CATEGORIES.map(c=>'<button class="journal-chip '+(journalSelectedCategory===c.id?'active':'')+'" onclick="selectJournalCategory(\''+c.id+'\')">'+esc(c.label)+'</button>').join('');
      renderJournalSourceTabs();
    }
    if(notifySel){
      notifySel.innerHTML=JOURNAL_CATEGORIES.map(c=>'<option value="'+c.id+'">'+esc(c.label)+'</option>').join('');
    }
  }

  function renderJournalSettingsUi(){
    const s=getJournalSettings();
    const source=document.getElementById('journalSourceSelect');
    const key=document.getElementById('journalGnewsKey');
    const enabled=document.getElementById('journalNotifyEnabled');
    const time=document.getElementById('journalNotifyTime');
    const cat=document.getElementById('journalNotifyCategory');
    const vapid=document.getElementById('journalVapidKey');
    if(source)source.value=s.source;
    if(key)key.value=s.gnewsKey||'';
    if(enabled)enabled.value=String(!!s.notifyEnabled);
    if(time)time.value=s.notifyTime||'08:30';
    if(cat)cat.value=s.notifyCategory||'ia';
    if(vapid)vapid.value=s.vapidKey||FIREBASE_MESSAGING_VAPID_KEY||'';
    renderJournalCatSourcesUi();
    renderJournalSettingsStatus();
  }

  function renderJournalCatSourcesUi(){
    const host=document.getElementById('journalCatSourcesGrid');
    if(!host)return;
    host.innerHTML=JOURNAL_CATEGORIES.map(function(cat){
      const saved=getJournalCatSource(cat.id);
      const opts=(cat.sources||[]).map(function(s){
        // Usa url (RSS direto) ou query (Google News) como identificador
        const val=(s.url||s.query||'');
        const isDefault=val===(cat.sources[0].url||cat.sources[0].query||'');
        const sel=((saved===null||saved===undefined)&&isDefault)||(saved===val)?'selected':'';
        return '<option value="'+esc(val)+'" '+sel+'>'+esc(s.label)+'</option>';
      }).join('');
      const catId=cat.id;
      return '<div class="journal-field"><label>'+esc(cat.label)+'</label>'+
        '<select class="journal-select" data-catid="'+esc(catId)+'">'+opts+'</select></div>';
    }).join('');
    host.querySelectorAll('select[data-catid]').forEach(function(sel){
      sel.addEventListener('change',function(){
        const catId=this.getAttribute('data-catid');
        const val=this.value===''?null:this.value;
        saveJournalCatSource(catId,val);
        invalidateJournalCache(catId);
      });
    });
  }

  function invalidateJournalCache(catId){
    localStorage.removeItem(journalCacheKey(catId));
    if(journalSelectedCategory===catId)refreshJournal(true);
  }

  function renderJournalSettingsStatus(){
    const el=document.getElementById('journalSettingsStatus');
    if(!el)return;
    const s=getJournalSettings();
    const perm=('Notification' in window)?Notification.permission:'indisponível';
    const fallback=s.source==='gnews'&&s.gnewsKey?'GNews direto':'Google News RSS via rss2json';
    const backend=journalFunctions?'Backend Firebase (Functions deployadas e acessíveis)':'Backend Firebase indisponível — Functions não deployadas ou SDK não carregado';
    const push=s.fcmToken?'FCM ativo':'FCM pendente';
    const vapid=s.vapidKey?'VAPID configurada':'VAPID ausente';
    el.innerHTML='Fonte principal: <strong>'+esc(backend)+'</strong>. Fallback/manual: <strong>'+esc(fallback)+'</strong>. Permissão de notificação: <strong>'+esc(perm)+'</strong>. Push: <strong>'+esc(push)+'</strong> ('+esc(vapid)+'). Se FCM não estiver disponível, o app usa notificação local como fallback enquanto estiver aberto.';
  }

  function toggleJournalSettings(){
    const p=document.getElementById('journalSettingsPanel');
    if(!p)return;
    p.classList.toggle('hidden');
    renderJournalSettingsUi();
  }

  function saveJournalSettingsFromUi(){
    saveJournalSettings({
      source:document.getElementById('journalSourceSelect')?.value||'rss2json',
      gnewsKey:(document.getElementById('journalGnewsKey')?.value||'').trim(),
      notifyEnabled:document.getElementById('journalNotifyEnabled')?.value==='true',
      notifyTime:document.getElementById('journalNotifyTime')?.value||'08:30',
      notifyCategory:document.getElementById('journalNotifyCategory')?.value||'ia',
      vapidKey:(document.getElementById('journalVapidKey')?.value||FIREBASE_MESSAGING_VAPID_KEY||'').trim(),
    });
    renderJournalSettingsStatus();
    scheduleJournalNotificationLoop();
    if(currentUser&&(journalFcmToken||getJournalSettings().fcmToken)){
      saveJournalFcmToken(journalFcmToken||getJournalSettings().fcmToken).catch(e=>console.warn('FCM token update error:',e));
    }
    showToast('Configuração do Jornal salva.');
  }

  function selectJournalCategory(id){
    journalSelectedCategory=id;
    journalFavoriteView=false;
    closeJournalDetail();
    renderJournalCategories();
    renderJournal();
    refreshJournal(false);
  }

  function selectJournalSource(catId,key){
    journalActiveSourceFilter[catId]=key||JOURNAL_ALL_SOURCES;
    renderJournal();
  }

  function toggleJournalFavoritesView(){
    journalFavoriteView=!journalFavoriteView;
    const btn=document.getElementById('journalFavViewBtn');
    if(btn)btn.textContent=journalFavoriteView?'Ver notícias':'Favoritos';
    closeJournalDetail();
    renderJournal();
  }

  // ============================================================
  // DETALHE DA NOTÍCIA
  // ============================================================
  function openJournalDetail(id){
    const a=getJournalArticle(id);
    if(!a)return;
    journalDetailArticle=a;
    const panel=document.getElementById('journalDetail');
    if(!panel)return;
    renderJournalDetailContent(a);
    panel.classList.add('open');
    document.getElementById('journalOverlay')?.classList.add('open');
    document.body.classList.add('journal-open');
  }

  function closeJournalDetail(){
    const panel=document.getElementById('journalDetail');
    if(panel)panel.classList.remove('open');
    document.getElementById('journalOverlay')?.classList.remove('open');
    journalDetailArticle=null;
    document.body.classList.remove('journal-open');
  }

  function renderJournalDetailContent(a){
    const fav=isJournalFavorite(a.id);
    const panel=document.getElementById('journalDetail');
    if(!panel)return;
    const heroHtml=a.image
      ?'<div class="jd-hero"><img src="'+esc(a.image)+'" alt="" onerror="this.parentElement.remove()"/></div>'
      :'';
    const summaryHtml=a.summary
      .split(/\n+/).filter(Boolean)
      .map(p=>'<p>'+esc(p)+'</p>').join('');
    const fallbackBadge=a.isFallback
      ?'<div class="jd-fallback-notice">⚠ Card de exemplo local — não é uma notícia real. Clique em Atualizar agora quando a internet estiver disponível.</div>'
      :'';
    panel.innerHTML=
      '<div class="jd-header">'+
        '<button class="jd-back" onclick="closeJournalDetail()">← Voltar</button>'+
        '<div class="jd-header-actions">'+
          '<button class="favorite-btn '+(fav?'active':'')+'" id="jdFavBtn" title="'+(fav?'Desfavoritar':'Favoritar')+'" onclick="toggleJournalFavoriteInDetail(\''+a.id+'\')">'+(fav?'★':'☆')+'</button>'+
          '<a class="jd-open-link" href="'+esc(a.link)+'" target="_blank" rel="noopener">↗ Original</a>'+
        '</div>'+
      '</div>'+
      '<div class="jd-scroll-wrap">'+
      heroHtml+
      '<div class="jd-content">'+
        '<div class="jd-meta">'+
          '<span class="news-cat">'+esc(a.categoryLabel||'')+'</span>'+
          '<span class="jd-source">'+esc(a.source||'')+'</span>'+
          '<span class="jd-date">'+formatJournalDateTime(a.date)+'</span>'+
        '</div>'+
        '<h1 class="jd-title">'+esc(a.title)+'</h1>'+
        fallbackBadge+
        '<div class="jd-section">'+
          '<div class="jd-section-label">Resumo</div>'+
          '<div class="jd-summary">'+(summaryHtml||'<p>'+esc(a.summary)+'</p>')+'</div>'+
        '</div>'+
        '<div class="jd-section">'+
          '<div class="jd-section-label">Inteligência Artificial <span class="jd-ai-hint">via Groq / OpenAI / Anthropic</span></div>'+
          '<div class="jd-ai-actions">'+
            '<button class="jd-ai-btn" onclick="runJournalAI(\'summarize\',\''+a.id+'\')">✦ Resumir</button>'+
            '<button class="jd-ai-btn" onclick="runJournalAI(\'insights\',\''+a.id+'\')">💡 Insights</button>'+
            '<button class="jd-ai-btn" onclick="runJournalAI(\'ideas\',\''+a.id+'\')">🎯 Ideias</button>'+
            '<button class="jd-ai-btn accent" onclick="runJournalAI(\'expand\',\''+a.id+'\')">📰 Expandir artigo</button>'+
            '<button class="jd-ai-btn" onclick="startJournalAudiobook(\''+a.id+'\')">🎧 Audiobook</button>'+
          '</div>'+
          '<div class="jd-ai-result" id="jdAiResult"></div>'+
        '</div>'+
      '</div>'+
      '</div>';
    const aiActions=panel.querySelector('.jd-ai-actions');
    if(aiActions&&!aiActions.querySelector('[data-journal-translate]')){
      const translateBtn=document.createElement('button');
      translateBtn.className='jd-ai-btn';
      translateBtn.setAttribute('data-journal-translate','1');
      translateBtn.textContent='Traduzir';
      translateBtn.onclick=function(){runJournalAI('translate',a.id);};
      aiActions.insertBefore(translateBtn,aiActions.querySelector('.accent')||aiActions.lastElementChild);
    }
    let _touchStartX=0;
    panel.addEventListener('touchstart',function(e){
      _touchStartX=e.touches[0].clientX;
    },{passive:true});
    panel.addEventListener('touchend',function(e){
      if(e.changedTouches[0].clientX-_touchStartX>80)closeJournalDetail();
    },{passive:true});
  }

  async function toggleJournalFavoriteInDetail(id){
    await toggleJournalFavorite(id);
    const btn=document.getElementById('jdFavBtn');
    if(btn){
      const fav=isJournalFavorite(id);
      btn.textContent=fav?'★':'☆';
      btn.title=fav?'Desfavoritar':'Favoritar';
      btn.classList.toggle('active',fav);
    }
  }

  // ============================================================
  // BUSCA E CACHE
  // ============================================================
  async function refreshJournal(force){
    if(journalSelectedCategory==='feed'){
      await refreshJournalFeed(force);
      return;
    }
    const cat=journalCat(journalSelectedCategory);
    if(journalFavoriteView){renderJournal();return;}
    if(journalLoading)return;
    const cached=getJournalCache(cat.id);
    if(cached&&!force){
      journalArticles[cat.id]=cached.items;
      const cachedMode=cached.mode||inferJournalMode(cached.items);
      journalSourceState[cat.id]={
        mode:'cache',
        cachedMode,
        fetchedAt:cached.fetchedAt||Date.now(),
        message:cachedMode==='fallback'
          ?'Exibindo fallback local salvo no cache. Clique em Atualizar agora para tentar buscar notícias reais.'
          :(cached.message||'Exibindo conteúdo salvo localmente para abrir o Jornal mais rápido.'),
        source:cached.source||'local-cache',
        sourceLabel:cached.sourceLabel||'cache local',
        error:cached.error||''
      };
      renderJournal();
      return;
    }
    journalLoading=true;
    journalSourceState[cat.id]={mode:'loading',message:force?'Atualizando e ignorando o cache local.':'Buscando notícias do dia.'};
    renderJournal();
    try{
      journalLastFetchMeta=null;
      const items=await fetchJournalCategorySources(cat);
      journalArticles[cat.id]=items;
      const mode=items.length?'real':'empty';
      const meta=journalLastFetchMeta||{};
      journalSourceState[cat.id]={
        mode,
        fetchedAt:Date.now(),
        message:meta.message||(items.length?'Notícias reais carregadas da fonte configurada.':'A fonte respondeu, mas não retornou notícias para esta categoria.'),
        source:meta.source||'unknown',
        sourceLabel:meta.sourceLabel||journalSourceLabel(meta.source),
        externalSource:meta.externalSource||'',
        error:meta.backendError?('Backend indisponível: '+meta.backendError):''
      };
      setJournalCache(cat.id,items,journalSourceState[cat.id]);
    }catch(e){
      console.warn('Journal fetch error:',e);
      const backendError=journalLastFetchMeta?.backendError;
      const readable=explainJournalError(e)+(backendError?' Backend: '+backendError:'');
      const fallback=buildJournalFallback(cat,readable);
      journalArticles[cat.id]=fallback;
      journalSourceState[cat.id]={
        mode:'fallback',
        fetchedAt:Date.now(),
        message:'A fonte de notícias falhou. Mostrando fallback local para você testar a experiência sem misturar com notícia real.',
        source:'fallback-local',
        sourceLabel:'fallback local',
        error:readable
      };
      setJournalCache(cat.id,fallback,journalSourceState[cat.id]);
      showToast('Fonte de notícias falhou. Usando fallback local.');
    }finally{
      journalLoading=false;
      renderJournal();
    }
  }

  async function refreshJournalFeed(force){
    if(journalFavoriteView){renderJournal();return;}
    if(journalLoading)return;
    const needsLoad=force||JOURNAL_CATEGORIES.some(cat=>!(journalArticles[cat.id]&&journalArticles[cat.id].length)&&!getJournalCache(cat.id));
    if(!needsLoad){
      JOURNAL_CATEGORIES.forEach(cat=>{
        const cached=getJournalCache(cat.id);
        if(cached&&(!journalArticles[cat.id]||!journalArticles[cat.id].length)){
          journalArticles[cat.id]=cached.items;
          journalSourceState[cat.id]={
            mode:'cache',
            cachedMode:cached.mode||inferJournalMode(cached.items),
            fetchedAt:cached.fetchedAt||Date.now(),
            message:cached.message||'Exibindo conteudo salvo localmente.',
            source:cached.source||'local-cache',
            sourceLabel:cached.sourceLabel||'cache local',
            error:cached.error||''
          };
        }
      });
      renderJournal();
      return;
    }
    journalLoading=true;
    renderJournal();
    for(const cat of JOURNAL_CATEGORIES){
      const cached=getJournalCache(cat.id);
      if(cached&&!force){
        journalArticles[cat.id]=cached.items;
        journalSourceState[cat.id]={
          mode:'cache',
          cachedMode:cached.mode||inferJournalMode(cached.items),
          fetchedAt:cached.fetchedAt||Date.now(),
          message:cached.message||'Exibindo conteudo salvo localmente.',
          source:cached.source||'local-cache',
          sourceLabel:cached.sourceLabel||'cache local',
          error:cached.error||''
        };
        continue;
      }
      try{
        journalLastFetchMeta=null;
        const items=await fetchJournalCategorySources(cat);
        journalArticles[cat.id]=items;
        const meta=journalLastFetchMeta||{};
        journalSourceState[cat.id]={
          mode:items.length?'real':'empty',
          fetchedAt:Date.now(),
          message:meta.message||(items.length?'Noticias reais carregadas da fonte configurada.':'A fonte respondeu, mas nao retornou noticias para esta categoria.'),
          source:meta.source||'unknown',
          sourceLabel:meta.sourceLabel||journalSourceLabel(meta.source),
          externalSource:meta.externalSource||'',
          error:meta.backendError?('Backend indisponivel: '+meta.backendError):''
        };
        setJournalCache(cat.id,items,journalSourceState[cat.id]);
      }catch(e){
        console.warn('Journal feed fetch error:',cat.id,e);
        const readable=explainJournalError(e);
        const fallback=buildJournalFallback(cat,readable);
        journalArticles[cat.id]=fallback;
        journalSourceState[cat.id]={
          mode:'fallback',
          fetchedAt:Date.now(),
          message:'A fonte de noticias falhou. Mostrando fallback local.',
          source:'fallback-local',
          sourceLabel:'fallback local',
          error:readable
        };
        setJournalCache(cat.id,fallback,journalSourceState[cat.id]);
      }
    }
    journalLoading=false;
    renderJournal();
  }

  function getJournalCache(catId){
    try{
      const c=JSON.parse(localStorage.getItem(journalCacheKey(catId))||'null');
      if(!c||!c.items)return null;
      c.items=c.items.map(normalizeJournalCachedArticle);
      const age=(Date.now()-(c.fetchedAt||0))/36e5;
      if(c.day===journalTodayKey()&&age<JOURNAL_CACHE_HOURS)return c;
    }catch{}
    return null;
  }

  function normalizeJournalCachedArticle(a){
    if(!a)return a;
    if(!a.sourceFilterKey)a.sourceFilterKey=a.source||'';
    if(!a.sourceFilterLabel)a.sourceFilterLabel=a.source||'Fonte externa';
    return a;
  }
  function setJournalCache(catId,items,state){
    localStorage.setItem(journalCacheKey(catId),JSON.stringify({
      day:journalTodayKey(),
      fetchedAt:state?.fetchedAt||Date.now(),
      mode:state?.mode||inferJournalMode(items),
      message:state?.message||'',
      error:state?.error||'',
      source:state?.source||'',
      sourceLabel:state?.sourceLabel||'',
      externalSource:state?.externalSource||'',
      items
    }));
  }

  function inferJournalMode(items){
    if(!items||!items.length)return'empty';
    return items.some(a=>a.isFallback)?'fallback':'real';
  }

  async function fetchJournalArticles(cat){
    try{
      return await fetchJournalFromBackend(cat);
    }catch(e){
      console.warn('Journal backend unavailable, using browser fallback:',e);
      journalLastFetchMeta={backendError:String(e?.message||e||'erro desconhecido no backend')};
    }
    const s=getJournalSettings();
    if(s.source==='gnews'&&s.gnewsKey){
      const items=await fetchJournalFromGNews(cat,s.gnewsKey);
      journalLastFetchMeta={
        ...journalLastFetchMeta,
        source:'browser-gnews',
        sourceLabel:'GNews direto',
        message:'Backend indisponível. Notícias reais carregadas no navegador pela GNews API configurada.'
      };
      return items;
    }
    const items=await fetchJournalFromRss2Json(cat);
    journalLastFetchMeta={
      ...journalLastFetchMeta,
      source:'browser-rss2json',
      sourceLabel:'rss2json',
      message:s.source==='gnews'&&!s.gnewsKey
        ?'Backend indisponível. GNews direto não foi usado porque não há chave no front; notícias carregadas via rss2json.'
        :'Backend indisponível. Notícias reais carregadas no navegador via rss2json.'
    };
    return items;
  }

  async function fetchJournalFromBackend(cat){
    if(!journalFunctions)throw new Error('SDK do Firebase Functions não carregado.');
    const getJournalNews=journalFunctions.httpsCallable('getJournalNews');
    const result=await getJournalNews({categoryId:cat.id});
    const payload=result?.data||{};
    const rawItems=Array.isArray(payload)?payload:(payload.items||[]);
    if(!Array.isArray(rawItems))throw new Error('Resposta inválida da função getJournalNews.');
    const items=rawItems.map(a=>normalizeJournalBackendArticle(a,cat)).filter(Boolean);
    journalLastFetchMeta={
      source:'backend-firebase',
      sourceLabel:payload.cached?'Backend Firebase (cache Firestore)':'Backend Firebase',
      externalSource:payload.source||'backend',
      cached:!!payload.cached,
      message:payload.cached
        ?'Notícias reais carregadas pelo backend usando cache diário do Firestore.'
        :'Notícias reais carregadas pelo backend e salvas no cache diário do Firestore.'
    };
    return items;
  }

  function journalSourceLabel(source){
    const labels={
      'backend-firebase':'Backend Firebase',
      'browser-gnews':'GNews direto',
      'browser-rss2json':'rss2json',
      'local-cache':'cache local',
      'fallback-local':'fallback local',
      'gnews':'GNews',
      'rss2json-google-news':'rss2json',
      'backend':'Backend Firebase'
    };
    return labels[source]||source||'fonte desconhecida';
  }

  function normalizeJournalBackendArticle(raw,cat){
    const title=stripHtml(raw?.title||'').trim();
    const link=String(raw?.link||'').trim();
    if(!title||!link)return null;
    return {
      id:String(raw.id||cat.id+'-'+journalHash(link||title)),
      title,
      summary:stripHtml(raw.summary||'').replace(/\s+/g,' ').trim()||'Abra a notícia original para ler os detalhes completos.',
      source:stripHtml(raw.source||'Fonte externa'),
      date:raw.date||new Date().toISOString(),
      link,
      image:raw.image||'',
      category:raw.category||cat.id,
      categoryLabel:raw.categoryLabel||cat.label,
      sourceFilterKey:stripHtml(raw.source||'Fonte externa'),
      sourceFilterLabel:stripHtml(raw.source||'Fonte externa')
    };
  }

  async function fetchJournalFromGNews(cat,key){
    const url='https://gnews.io/api/v4/search?q='+encodeURIComponent(cat.query)+'&lang=pt&country=br&max=10&apikey='+encodeURIComponent(key);
    let res;
    try{res=await fetch(url);}
    catch(e){throw new Error('GNews não respondeu. Verifique sua internet, bloqueador de rede ou CORS. Detalhe: '+(e.message||e));}
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const msg=Array.isArray(data.errors)?data.errors.join(' '):(data.errors||data.message||data.error||'');
      throw new Error('GNews retornou HTTP '+res.status+(msg?': '+msg:'. Confira a API key, cota e parâmetros.'));
    }
    return (data.articles||[]).map(a=>normalizeJournalArticle({
      title:a.title,description:a.description,content:a.content,link:a.url,source:a.source?.name,pubDate:a.publishedAt,thumbnail:a.image
    },cat)).filter(Boolean);
  }

  // Monta URL do rss2json a partir de um feed RSS direto ou de uma query Google News
  function buildRss2JsonUrl(source,cat){
    const catSource=source||{type:'googleNews',query:(cat.query||cat.label)};
    if(catSource.type==='rss'&&catSource.url){
      // URL RSS direta — ex: github.blog/feed/, ge.globo.com/rss/...
      return 'https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(catSource.url);
    }
    // Tipo googleNews (padrão): query via Google News RSS
    const q=catSource.query||cat.query||cat.label;
    const rss='https://news.google.com/rss/search?q='+encodeURIComponent(q)+'&hl=pt-BR&gl=BR&ceid=BR:pt-419';
    return 'https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(rss);
  }

  // Retorna o objeto de fonte selecionada (ou null para usar padrão)
  function journalSourceKey(source){
    return source?(source.url||source.query||source.label||''):'';
  }

  function getJournalSourcesForCat(cat){
    const sources=(cat.sources&&cat.sources.length)?cat.sources:[{label:'Google News (padrao)',type:'googleNews',query:(cat.query||cat.label)}];
    return sources.filter(s=>journalSourceKey(s));
  }

  function getSelectedCatSource(cat){
    const savedQuery=getJournalCatSource(cat.id);
    if(savedQuery===null||savedQuery===undefined)return null; // padrão
    // encontra na lista de fontes pelo query/url salvo
    return (cat.sources||[]).find(s=>(s.url||s.query)===savedQuery)||null;
  }

  async function fetchJournalFromRss2Json(cat){
    const source=getSelectedCatSource(cat);
    return fetchJournalSourceItems(cat,source);
  }

  async function fetchJournalSourceItems(cat,source){
    const url=buildRss2JsonUrl(source,cat);
    let res;
    try{res=await fetch(url);}
    catch(e){throw new Error('rss2json não respondeu. Verifique sua internet, bloqueador de rede ou CORS. Detalhe: '+(e.message||e));}
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error('rss2json retornou HTTP '+res.status+'. O serviço pode estar fora do ar ou limitado.');
    if(data.status==='error')throw new Error('rss2json recusou o feed: '+(data.message||'erro sem detalhe'));
    const sourceKey=journalSourceKey(source)||journalSourceKey((cat.sources||[])[0])||cat.query;
    const sourceLabel=source?.label||'Google News';
    return (data.items||[]).slice(0,12).map(function(item){
      const article=normalizeJournalArticle(item,cat);
      if(article){
        article.sourceFilterKey=sourceKey;
        article.sourceFilterLabel=sourceLabel;
      }
      return article;
    }).filter(Boolean);
  }

  async function fetchJournalCategorySources(cat){
    const sources=getJournalSourcesForCat(cat);
    if(!sources.length)return fetchJournalArticles(cat);
    const settled=await Promise.allSettled(sources.map(source=>fetchJournalSourceItems(cat,source)));
    const items=[];
    const errors=[];
    const seen=new Set();
    settled.forEach(function(result){
      if(result.status!=='fulfilled'){
        errors.push(result.reason?.message||String(result.reason));
        return;
      }
      result.value.forEach(function(article){
        const key=article.link||article.id;
        if(!key||seen.has(key))return;
        seen.add(key);
        items.push(article);
      });
    });
    if(!items.length&&errors.length)throw new Error(errors[0]);
    journalLastFetchMeta={
      source:'browser-rss2json',
      sourceLabel:items.length?'fontes da categoria':'rss2json',
      externalSource:'multiple',
      message:errors.length
        ?'Noticias carregadas parcialmente. Algumas fontes nao responderam.'
        :'Noticias reais carregadas das fontes configuradas da categoria.'
    };
    return items.sort((a,b)=>(new Date(b.date||0).getTime()||0)-(new Date(a.date||0).getTime()||0)).slice(0,48);
  }

  function explainJournalError(e){
    const msg=String(e?.message||e||'Erro desconhecido ao buscar notícias.');
    if(/Failed to fetch|NetworkError|não respondeu|CORS/i.test(msg))return msg+' O navegador não conseguiu acessar a fonte externa diretamente.';
    if(/HTTP 401|HTTP 403|API key|apikey|quota|limit|cota/i.test(msg))return msg+' Revise a chave, permissões ou limite diário da fonte escolhida.';
    if(/HTTP 429/i.test(msg))return msg+' A fonte limitou muitas requisições; tente novamente mais tarde.';
    return msg;
  }

  function normalizeJournalArticle(raw,cat){
    const title=stripHtml(raw.title||'').trim();
    const link=raw.link||raw.url||raw.guid||'';
    if(!title||!link)return null;
    const summary=stripHtml(raw.description||raw.contentSnippet||raw.content||'').replace(/\s+/g,' ').trim();
    const source=stripHtml(raw.source||raw.author||extractSourceFromTitle(title)||'Fonte externa');
    const date=raw.pubDate||raw.publishedAt||raw.isoDate||new Date().toISOString();
    const image=raw.thumbnail||raw.enclosure?.link||extractFirstImage(raw.description||raw.content||'');
    return {
      id:cat.id+'-'+journalHash(link||title),
      title:title.replace(/\s-\sGoogle News$/,''),
      summary:summary||'Abra a notícia original para ler os detalhes completos.',
      source,date,link,image,
      category:cat.id,
      categoryLabel:cat.label,
      sourceFilterKey:source,
      sourceFilterLabel:source,
    };
  }

  function extractSourceFromTitle(t){
    const parts=String(t).split(' - ');
    return parts.length>1?parts[parts.length-1]:'';
  }
  function extractFirstImage(html){
    const m=String(html||'').match(/<img[^>]+src=["']([^"']+)["']/i);
    return m?m[1]:'';
  }
  function stripHtml(html){
    const div=document.createElement('div');
    div.innerHTML=String(html||'');
    return div.textContent||div.innerText||'';
  }

  function buildJournalFallback(cat,reason){
    const now=new Date().toISOString();
    const errorShort=reason?reason.slice(0,180):'erro desconhecido';
    return [
      {
        id:cat.id+'-fallback-1',
        title:'⚠ Não foi possível carregar notícias reais de '+cat.label,
        summary:'Causa: '+errorShort+'\n\nO que fazer: (1) Verifique sua conexão com a internet. (2) Se o backend Firebase estiver deployado, aguarde e clique em Atualizar agora. (3) Nas configurações do Jornal, selecione "Google News RSS via rss2json" como fallback manual. (4) Opcionalmente, insira uma API Key da GNews para acesso direto.',
        source:'Fallback local — não é notícia real',date:now,
        link:'https://news.google.com/search?q='+encodeURIComponent(cat.query),
        image:'',category:cat.id,categoryLabel:cat.label,isFallback:true,fetchError:reason
      },
      {
        id:cat.id+'-fallback-2',
        title:'Teste os recursos do Jornal com este card de exemplo',
        summary:'Mesmo sem notícias reais, você pode testar favoritos, Resumir, Insights, Ideias e Audiobook. Quando a fonte externa responder corretamente, estes cards de exemplo serão substituídos automaticamente por notícias reais.',
        source:'Fallback local — não é notícia real',date:now,
        link:'https://news.google.com/',
        image:'',category:cat.id,categoryLabel:cat.label,isFallback:true,fetchError:reason
      }
    ];
  }

  // ============================================================
  // RENDER
  // ============================================================
  function renderJournalSourceTabs(){
    const catsHost=document.getElementById('journalCategories');
    if(!catsHost||!catsHost.parentElement)return;
    let host=document.getElementById('journalSourceTabs');
    if(!host){
      host=document.createElement('div');
      host.id='journalSourceTabs';
      host.className='journal-source-tabs';
      catsHost.parentElement.appendChild(host);
    }
    if(journalFavoriteView||journalSelectedCategory==='feed'){
      host.innerHTML='';
      host.classList.add('hidden');
      return;
    }
    const cat=journalCat(journalSelectedCategory);
    const items=journalArticles[cat.id]||[];
    const counts={};
    items.forEach(function(a){
      const key=a.sourceFilterKey||a.source||'';
      if(key)counts[key]=(counts[key]||0)+1;
    });
    const active=journalActiveSourceFilter[cat.id]||JOURNAL_ALL_SOURCES;
    const tabs=['<button class="journal-source-chip '+(active===JOURNAL_ALL_SOURCES?'active':'')+'" onclick="selectJournalSource(\''+cat.id+'\',\''+JOURNAL_ALL_SOURCES+'\')">Todas <span>'+items.length+'</span></button>'];
    const rendered=new Set();
    getJournalSourcesForCat(cat).forEach(function(source){
      const key=journalSourceKey(source);
      rendered.add(key);
      const count=counts[key]||0;
      tabs.push('<button class="journal-source-chip '+(active===key?'active':'')+'" onclick="selectJournalSource(\''+cat.id+'\',\''+escJs(key)+'\')">'+esc(source.label||key)+' <span>'+count+'</span></button>');
    });
    items.forEach(function(a){
      const key=a.sourceFilterKey||a.source||'';
      if(!key||rendered.has(key))return;
      rendered.add(key);
      tabs.push('<button class="journal-source-chip '+(active===key?'active':'')+'" onclick="selectJournalSource(\''+cat.id+'\',\''+escJs(key)+'\')">'+esc(a.sourceFilterLabel||a.source||key)+' <span>'+(counts[key]||0)+'</span></button>');
    });
    host.classList.remove('hidden');
    host.innerHTML=tabs.join('');
  }

  function filterJournalItemsBySource(cat,items){
    const active=journalActiveSourceFilter[cat.id]||JOURNAL_ALL_SOURCES;
    if(active===JOURNAL_ALL_SOURCES)return items;
    return items.filter(a=>(a.sourceFilterKey||a.source||'')===active);
  }

  function escJs(s){
    return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,' ');
  }

  function renderJournal(){
    renderJournalCategories();
    renderJournalSourceTabs();
    renderJournalSettingsStatus();
    const status=document.getElementById('journalStatus');
    const grid=document.getElementById('journalNewsGrid');
    if(!status||!grid)return;
    const isFeed=journalSelectedCategory==='feed'&&!journalFavoriteView;
    grid.classList.toggle('journal-feed-list',isFeed);
    if(isFeed){
      const items=getJournalFeedItems();
      if(journalLoading){
        status.innerHTML=renderJournalFeedState(items,true);
        grid.innerHTML='';
        return;
      }
      status.innerHTML=renderJournalFeedState(items,false);
      if(!items.length){
        grid.innerHTML='<div class="journal-empty"><div class="journal-empty-title">Feed ainda vazio</div><div>Clique em <strong>Atualizar agora</strong> para buscar noticias de todos os temas.</div></div>';
        return;
      }
      grid.innerHTML=items.map(renderFeedCard).join('');
      return;
    }
    const cat=journalCat(journalSelectedCategory);
    const allItems=journalFavoriteView?journalFavorites:(journalArticles[cat.id]||[]);
    const items=journalFavoriteView?allItems:filterJournalItemsBySource(cat,allItems);
    if(journalLoading){
      status.innerHTML=renderJournalState({...journalSourceState[cat.id],mode:'loading'},cat);
      grid.innerHTML='';
      return;
    }
    status.innerHTML=journalFavoriteView?renderJournalFavoritesState(items):renderJournalState(journalSourceState[cat.id],cat,items);
    if(!items.length){
      const emptyMsg=journalFavoriteView
        ?'Favorite notícias para montar sua lista de leitura.'
        :(journalSourceState[cat.id]
          ?'Clique em <strong>Atualizar agora</strong> para tentar buscar novamente.'
          :'Clique em <strong>Atualizar agora</strong> para buscar as notícias do dia.');
      grid.innerHTML='<div class="journal-empty" style="grid-column:1/-1;"><div class="journal-empty-title">'+(journalFavoriteView?'Nenhuma notícia favorita':'Nenhuma notícia carregada')+'</div><div>'+emptyMsg+'</div></div>';
      return;
    }
    grid.innerHTML=items.map(renderNewsCard).join('');
  }

  function getJournalFeedItems(){
    const seen=new Set();
    const items=[];
    JOURNAL_CATEGORIES.forEach(cat=>{
      (journalArticles[cat.id]||[]).forEach(a=>{
        const key=a.link||a.id;
        if(!key||seen.has(key))return;
        seen.add(key);
        items.push(a);
      });
    });
    return items.sort((a,b)=>(new Date(b.date||0).getTime()||0)-(new Date(a.date||0).getTime()||0));
  }

  function renderJournalFeedState(items,loading){
    const loaded=JOURNAL_CATEGORIES.filter(cat=>journalArticles[cat.id]&&journalArticles[cat.id].length).length;
    if(loading){
      return '<div class="journal-state cache"><div class="journal-state-left"><div class="spinner"></div><div><div class="journal-state-title">Carregando Feed</div><div class="journal-state-desc">Buscando noticias das categorias configuradas.</div></div></div><div class="journal-state-meta">'+loaded+'/'+JOURNAL_CATEGORIES.length+' temas</div></div>';
    }
    return '<div class="journal-state '+(items.length?'real':'empty')+'"><div class="journal-state-left"><div class="journal-state-dot"></div><div><div class="journal-state-title">Feed geral</div><div class="journal-state-desc">Noticias de todos os temas misturadas e ordenadas por data.</div></div></div><div class="journal-state-meta">'+items.length+' noticia(s) · '+loaded+'/'+JOURNAL_CATEGORIES.length+' temas</div></div>';
  }

  function renderJournalState(state,cat,items){
    const mode=state?.mode||(items&&items.length?'real':'empty');
    if(mode==='loading'){
      return '<div class="journal-state cache"><div class="journal-state-left"><div class="spinner"></div><div><div class="journal-state-title">Carregando notícias de '+esc(cat.label)+'</div><div class="journal-state-desc">'+esc(state?.message||'Buscando a fonte configurada...')+'</div></div></div></div>';
    }
    const labels={
      real:['notícias reais','Notícias reais carregadas','Dados obtidos agora da fonte configurada.'],
      cache:['cache local','Usando cache local','Mostrando a última busca salva neste navegador. Clique em Atualizar agora para ignorar o cache.'],
      fallback:['fallback local','Usando fallback local','A fonte externa falhou. Estes cards são exemplos locais e não devem ser tratados como notícia real.'],
      empty:['sem notícias','Sem notícias nesta categoria','A fonte respondeu, mas não retornou itens para este tema agora.'],
      error:['erro','Erro ao carregar notícias','Não foi possível buscar a fonte configurada.']
    };
    let visual=mode;
    let [badge,title,desc]=labels[mode]||labels.empty;
    if(mode==='cache'&&state?.cachedMode==='fallback'){
      visual='fallback';badge='cache local / fallback';title='Usando cache de fallback local';
      desc='A última busca salva era um fallback local. Clique em Atualizar agora para tentar notícias reais.';
    }else if(mode==='cache'&&state?.cachedMode==='real'){
      desc='Mostrando notícias reais salvas no cache local. Clique em Atualizar agora para buscar dados novos.';
    }
    const error=state?.error?'<div class="journal-state-desc">Detalhe: '+esc(state.error)+'</div>':'';
    const activeSource=state?.sourceLabel||(state?.source?journalSourceLabel(state.source):'');
    const externalSource=state?.externalSource?'<div class="journal-state-desc">Fonte externa: '+esc(journalSourceLabel(state.externalSource))+'</div>':'';
    const metaBadge=activeSource||badge;
    const meta=state?.fetchedAt?'<div class="journal-state-meta">'+esc(metaBadge)+' · '+formatJournalDateTime(state.fetchedAt)+'</div>':'<div class="journal-state-meta">'+esc(metaBadge)+'</div>';
    return '<div class="journal-state '+visual+'">'+
      '<div class="journal-state-left"><div class="journal-state-dot"></div><div><div class="journal-state-title">'+esc(title)+'</div><div class="journal-state-desc">'+esc(state?.message||desc)+'</div>'+externalSource+error+'</div></div>'+
      meta+
    '</div>';
  }

  function renderJournalFavoritesState(items){
    return '<div class="journal-state cache"><div class="journal-state-left"><div class="journal-state-dot"></div><div><div class="journal-state-title">Lista de favoritos</div><div class="journal-state-desc">'+(items.length?'Mostrando notícias salvas por você.':'Você ainda não favoritou notícias.')+'</div></div></div><div class="journal-state-meta">'+items.length+' favorito(s)</div></div>';
  }

  function renderNewsCard(a){
    const fav=isJournalFavorite(a.id);
    const img=a.image?'<img src="'+esc(a.image)+'" alt="" loading="lazy" onerror="this.parentElement.classList.add(\'no-img\');this.remove();"/>':'';
    const initials=(a.categoryLabel||'J').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return '<article class="news-card '+(a.isFallback?'fallback':'')+'" onclick="openJournalDetail(\''+a.id+'\')" role="button" tabindex="0">'+
      '<div class="news-img '+(a.image?'':'no-img')+'">'+(img||'<span class="news-initials">'+initials+'</span>')+'</div>'+
      '<div class="news-body">'+
        (a.isFallback?'<div class="news-fallback-label">Exemplo local</div>':'')+
        '<div class="news-kicker"><span class="news-cat">'+esc(a.categoryLabel||'')+'</span><span class="news-source">'+esc(a.source||'')+'</span><span class="news-date">'+formatJournalDate(a.date)+'</span></div>'+
        '<div class="news-title">'+esc(a.title)+'</div>'+
        (function(){var snip=(a.summary||'').replace(/\s+/g,' ').trim().slice(0,110);return snip?'<div class="news-synopsis">'+esc(snip+(snip.length>=110?'\u2026':''))+'</div>':'';})()+
        '<button class="favorite-btn '+(fav?'active':'')+'" title="'+(fav?'Desfavoritar':'Favoritar')+'" onclick="event.stopPropagation();toggleJournalFavorite(\''+a.id+'\')">'+(fav?'★':'☆')+'</button>'+
      '</div>'+
    '</article>';
  }

  function renderFeedCard(a){
    const color=CAT_COLORS[a.category]||'#6b3fa0';
    const snip=(a.summary||'').replace(/\s+/g,' ').trim().slice(0,200);
    return '<article class="feed-card '+(a.isFallback?'fallback':'')+'" style="--cat-color:'+esc(color)+'" onclick="openJournalDetail(\''+a.id+'\')" role="button" tabindex="0">'+
      '<div class="feed-card-kicker"><span class="news-cat">'+esc(a.categoryLabel||'')+'</span><span class="feed-card-source">'+esc(a.source||'')+'</span><span class="feed-card-date">'+formatJournalDate(a.date)+'</span></div>'+
      (a.isFallback?'<div class="news-fallback-label">Exemplo local</div>':'')+
      '<div class="feed-card-title">'+esc(a.title)+'</div>'+
      (snip?'<div class="feed-card-synopsis">'+esc(snip+(snip.length>=200?'\u2026':''))+'</div>':'')+
      '<button class="feed-card-btn" onclick="event.stopPropagation();openJournalDetail(\''+a.id+'\')">Ler noticia completa &rarr;</button>'+
    '</article>';
  }

  function getJournalArticle(id){
    for(const list of Object.values(journalArticles)){const a=list.find(x=>x.id===id);if(a)return a;}
    return journalFavorites.find(x=>x.id===id)||null;
  }
  function journalArticleText(a){return [a.title,a.summary,'Fonte: '+(a.source||''),'Categoria: '+(a.categoryLabel||''),a.link].filter(Boolean).join('\n\n');}
  function formatJournalDate(d){try{return new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});}catch{return'';}}
  function formatJournalDateTime(d){try{return new Date(d).toLocaleString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}catch{return'';}}

  // ============================================================
  // IA DO JORNAL — prompts estruturados
  // ============================================================
  async function runJournalAI(action,id){
    const a=getJournalArticle(id);if(!a)return;
    const cfg=getApiConfig();if(!canUseAI()){openApiModal();return;}
    if(action==='translate'){
      const title='Tradução';
      const prompt='Detecte automaticamente o idioma da noticia abaixo e traduza para portugues brasileiro natural, preservando nomes, numeros, datas e o sentido jornalistico. Nao resuma e nao acrescente opinioes. Estruture assim:\n\n## Traducao\n\n[texto traduzido]\n\n## Idioma detectado\n\n[idioma detectado]\n\nNoticia:\n\n';
      setJournalAiLoading(title);
      try{setJournalAiResult(title,await callAI(cfg,prompt+journalArticleText(a)));}
      catch(e){setJournalAiResult('Erro ao traduzir','Erro: '+e.message);}
      return;
    }
    const titles={summarize:'Resumo',insights:'Insights',ideas:'Ideias práticas',expand:'Artigo expandido'};
    const title=titles[action]||'IA';
    const prompts={
      summarize:
        'Você é um jornalista sênior. Resuma a notícia abaixo em português brasileiro com precisão e clareza.\n\n'+
        '## Resumo\n[2 a 3 frases objetivas explicando O QUÊ aconteceu, QUEM está envolvido e ONDE/QUANDO]\n\n'+
        '## Pontos principais\n- [fato 1 — o mais importante]\n- [fato 2]\n- [fato 3]\n- [fato 4 se relevante]\n\n'+
        '## Impacto\n[Uma frase: quem é afetado e como? Qual a consequência prática?]\n\n'+
        '## Contexto\n[1 parágrafo com histórico, causa raíz ou comparação com situações anteriores]\n\n'+
        'Seja direto, evite repetir o título e não use frases genéricas como "é importante notar que".\n\nNotícia:\n\n',
      insights:
        'Analise a notícia abaixo e gere insights estruturados em português brasileiro:\n\n'+
        '## Impacto imediato\n[o que muda agora]\n\n'+
        '## Tendência\n[onde isso aponta no médio prazo]\n\n'+
        '## O que observar\n[indicadores ou eventos para acompanhar]\n\n'+
        '## Conexões não óbvias\n- [conexão 1]\n- [conexão 2]\n\nNotícia:\n\n',
      ideas:
        'Gere 5 ideias práticas a partir da notícia abaixo em português brasileiro.\n\n'+
        '## 5 Ideias práticas\n\n'+
        '**1. Estudo:** [ideia de aprendizado ou pesquisa]\n\n'+
        '**2. Conteúdo:** [ideia de artigo, post ou vídeo]\n\n'+
        '**3. Trabalho / negócio:** [ideia profissional ou empreendedora]\n\n'+
        '**4. Decisão:** [ação ou decisão que esta notícia pode influenciar]\n\n'+
        '**5. Criativa:** [ideia diferente, lateral ou inusitada]\n\nNotícia:\n\n',
      expand:
        'Com base na notícia abaixo, escreva um artigo expandido e informativo em português brasileiro. '+
        'Estruture assim:\n\n'+
        '## [Título do artigo]\n\n'+
        '[Parágrafo introdutório — lead]\n\n'+
        '## O que aconteceu\n[narrativa detalhada dos fatos]\n\n'+
        '## Por que isso importa\n[relevância e impacto]\n\n'+
        '## Contexto e histórico\n[o que levou até aqui]\n\n'+
        '## O que esperar\n[perspectivas e próximos passos]\n\nNotícia original:\n\n'
    };
    setJournalAiLoading(title);
    try{setJournalAiResult(title,await callAI(cfg,prompts[action]+journalArticleText(a)));}
    catch(e){setJournalAiResult('Erro ao processar','Erro: '+e.message);}
  }

  function setJournalAiLoading(title){
    document.querySelectorAll('.jd-ai-btn').forEach(b=>b.disabled=true);
    const inline=document.getElementById('jdAiResult');
    if(inline){
      inline.innerHTML='<div class="jd-ai-loading"><div class="spinner"></div><span>Gerando '+esc(title.toLowerCase())+'...</span></div>';
      return;
    }
    // fallback para o painel antigo (compatibilidade)
    const p=document.getElementById('journalAiResultPanel');if(p)p.classList.add('open');
    const t=document.getElementById('journalAiResultTitle');if(t)t.textContent=title;
    const b=document.getElementById('journalAiResultBody');if(b)b.innerHTML='<div class="ai-loading"><div class="spinner"></div> Processando...</div>';
  }

  function setJournalAiResult(title,text){
    document.querySelectorAll('.jd-ai-btn').forEach(b=>b.disabled=false);
    const inline=document.getElementById('jdAiResult');
    if(inline){
      inline.innerHTML=
        '<div class="jd-ai-result-inner">'+
          '<div class="jd-ai-result-title">'+esc(title)+'</div>'+
          '<div class="jd-ai-result-body">'+mdLite(text)+'</div>'+
        '</div>';
      inline.scrollIntoView({behavior:'smooth',block:'nearest'});
      return;
    }
    // fallback para o painel antigo
    const p=document.getElementById('journalAiResultPanel');if(p)p.classList.add('open');
    const t=document.getElementById('journalAiResultTitle');if(t)t.textContent=title;
    const b=document.getElementById('journalAiResultBody');if(b)b.innerHTML=mdLite(text);
  }

  function closeJournalAiPanel(){
    const inline=document.getElementById('jdAiResult');
    if(inline)inline.innerHTML='';
    document.querySelectorAll('.jd-ai-btn').forEach(b=>b.disabled=false);
    const p=document.getElementById('journalAiResultPanel');if(p)p.classList.remove('open');
  }

  // ============================================================
  // AUDIOBOOK
  // ============================================================
  async function startJournalAudiobook(id){
    const a=getJournalArticle(id);if(!a)return;
    if(!journalFunctions&&!('speechSynthesis' in window)){alert('Seu navegador não suporta leitura de voz.');return;}
    abQueue=[{title:a.title,content:a.summary,source:a.source,link:a.link,audiobookSource:'journal'}];
    abCurrentIdx=0;abPlaying=true;abPaused=false;
    document.getElementById('abPlayer').classList.remove('hidden');
    await abPrepareVoices();
    abPlayCurrent();
  }

  // ============================================================
  // FAVORITOS
  // ============================================================
  function loadJournalFavoritesLocal(){try{return JSON.parse(localStorage.getItem('durando_journal_favorites'))||[];}catch{return[];}}
  function saveJournalFavoritesLocal(){localStorage.setItem('durando_journal_favorites',JSON.stringify(journalFavorites));}
  function isJournalFavorite(id){return journalFavorites.some(f=>f.id===id);}
  async function toggleJournalFavorite(id){
    const existing=journalFavorites.find(f=>f.id===id);
    if(existing){
      journalFavorites=journalFavorites.filter(f=>f.id!==id);
      saveJournalFavoritesLocal();
      if(currentUser){try{await userCol('journalFavorites').doc(existing.favId||id).delete();}catch(e){console.warn('Favorite delete error:',e);}}
      showToast('Notícia removida dos favoritos.');
    }else{
      const a=getJournalArticle(id);if(!a)return;
      const fav={...a,savedAt:new Date().toISOString()};
      journalFavorites=[fav,...journalFavorites.filter(f=>f.id!==id)];
      saveJournalFavoritesLocal();
      if(currentUser){try{await userCol('journalFavorites').doc(id).set(fav);}catch(e){console.warn('Favorite save error:',e);}}
      showToast('Notícia favoritada.');
    }
    renderJournal();
  }

  // ============================================================
  // NOTIFICAÇÕES
  // ============================================================
  async function requestJournalNotificationPermission(){
    if(!('Notification' in window)){alert('Este navegador não suporta notificações.');return;}
    const perm=await Notification.requestPermission();
    if(perm==='granted'){
      saveJournalSettings({
        notifyEnabled:true,
        notifyCategory:document.getElementById('journalNotifyCategory')?.value||getJournalSettings().notifyCategory,
        notifyTime:document.getElementById('journalNotifyTime')?.value||getJournalSettings().notifyTime,
        vapidKey:(document.getElementById('journalVapidKey')?.value||getJournalSettings().vapidKey||FIREBASE_MESSAGING_VAPID_KEY||'').trim()
      });
      try{
        const token=await enableJournalFirebaseMessaging();
        if(token)showToast('Push do Jornal ativado com Firebase Messaging.');
      }catch(e){
        console.warn('FCM setup error:',e);
        showToast('Notificação local ativada. FCM pendente: '+(e.message||e));
      }
      renderJournalSettingsUi();
      showToast('Notificações do Jornal ativadas.');
    }else alert('Permissão de notificação não concedida.');
  }

  async function getJournalMessaging(){
    if(!firebase.messaging)return null;
    if(firebase.messaging.isSupported){
      const supported=await firebase.messaging.isSupported().catch(()=>false);
      if(!supported)return null;
    }
    if(!journalMessaging){
      journalMessaging=firebase.messaging();
      journalMessaging.onMessage(payload=>{
        const title=payload.notification?.title||payload.data?.title||'Jornal Durando Mind';
        const body=payload.notification?.body||payload.data?.body||'Abra o Jornal para ver o destaque.';
        if(('Notification' in window)&&Notification.permission==='granted'){
          new Notification(title,{body,icon:'icon-192.png',data:payload.data||{}});
        }
      });
    }
    return journalMessaging;
  }

  async function enableJournalFirebaseMessaging(){
    if(!currentUser)throw new Error('entre na sua conta para salvar o token FCM');
    if(!('serviceWorker' in navigator))throw new Error('service worker indisponivel');
    const messaging=await getJournalMessaging();
    if(!messaging)throw new Error('Firebase Messaging nao suportado neste navegador');
    const s=getJournalSettings();
    const vapidKey=s.vapidKey||FIREBASE_MESSAGING_VAPID_KEY;
    if(!vapidKey)throw new Error('configure a chave publica VAPID nas configuracoes do Jornal');
    const registration=pwaRegistration||await navigator.serviceWorker.register('./sw.js');
    pwaRegistration=registration;
    const token=await messaging.getToken({vapidKey,serviceWorkerRegistration:registration});
    if(!token)throw new Error('Firebase nao retornou token FCM');
    journalFcmToken=token;
    await saveJournalFcmToken(token);
    saveJournalSettings({fcmToken:token,notifyEnabled:true,vapidKey});
    return token;
  }

  async function saveJournalFcmToken(token){
    const s=getJournalSettings();
    const ref=db.collection('users').doc(currentUser.uid).collection('fcmTokens').doc(journalHash(token));
    await ref.set({
      token,
      userId:currentUser.uid,
      journalNotifyEnabled:!!s.notifyEnabled,
      notifyCategory:s.notifyCategory||'ia',
      notifyTime:s.notifyTime||'08:30',
      timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Fortaleza',
      platform:navigator.userAgent,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }

  function scheduleJournalNotificationLoop(){
    if(journalNotifyTimer)clearInterval(journalNotifyTimer);
    journalNotifyTimer=setInterval(()=>sendJournalNotification(false),60000);
  }

  async function sendJournalNotification(force){
    const s=getJournalSettings();
    if(!force&&(!s.notifyEnabled||!('Notification' in window)||Notification.permission!=='granted'))return;
    if(('Notification' in window)&&Notification.permission!=='granted'){
      if(force)await requestJournalNotificationPermission();
      if(Notification.permission!=='granted')return;
    }
    if(force&&journalFunctions&&(journalFcmToken||s.fcmToken)){
      try{
        const sendTest=journalFunctions.httpsCallable('sendJournalTestNotification');
        await sendTest({categoryId:s.notifyCategory||'ia'});
        showToast('Teste enviado pelo Firebase Messaging.');
        renderJournalSettingsStatus();
        return;
      }catch(e){
        console.warn('FCM test notification failed, using local fallback:',e);
        showToast('FCM falhou no teste. Usando notificação local.');
      }
    }
    const now=new Date();
    const today=journalTodayKey();
    if(!force){
      const hhmm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
      if(hhmm<s.notifyTime||s.lastNotifyDate===today)return;
    }
    const cat=journalCat(s.notifyCategory||'ia');
    if(!journalArticles[cat.id]||!journalArticles[cat.id].length){
      try{journalArticles[cat.id]=await fetchJournalArticles(cat);setJournalCache(cat.id,journalArticles[cat.id]);}
      catch{journalArticles[cat.id]=buildJournalFallback(cat,'notificação');}
    }
    const top=(journalArticles[cat.id]||[])[0];
    const title=force?'Teste do Jornal':'Veja as principais notícias de '+cat.label+' de hoje';
    const body=top?top.title:'Abra o Jornal para ler as notícias do dia.';
    new Notification(title,{body,icon:'icon-192.png'});
    saveJournalSettings({lastNotifyDate:today});
    renderJournalSettingsStatus();
  }
