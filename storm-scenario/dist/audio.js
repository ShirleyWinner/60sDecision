/* Original procedural score and UI cues. No downloads or external audio files. */
const gameAudio = (() => {
  let ctx, master, musicBus, fxBus, timer, nextBeat=0, step=0, lastSecond=-1;
  let music=true, effects=true, unlocked=false, lastOutcome=null;
  function note(frequency,time,duration,volume,bus,type='sine',endFrequency){
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,time);
    if(endFrequency)oscillator.frequency.exponentialRampToValueAtTime(endFrequency,time+duration);
    gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(volume,time+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    oscillator.connect(gain);gain.connect(bus);oscillator.start(time);oscillator.stop(time+duration+.03);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
  function initialize(){
    if(ctx)return true;
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;
    ctx=new Audio();master=ctx.createGain();master.gain.value=.65;
    const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=8;
    master.connect(limiter);limiter.connect(ctx.destination);
    musicBus=ctx.createGain();fxBus=ctx.createGain();musicBus.connect(master);fxBus.connect(master);
    musicBus.gain.value=music?.5:0;fxBus.gain.value=effects?.65:0;
    nextBeat=ctx.currentTime+.08;timer=setInterval(schedule,80);return true;
  }
  function unlock(){try{if(!initialize())return;unlocked=true;ctx.resume().catch(()=>{});}catch{}}
  function schedule(){
    if(!unlocked||ctx.state!=='running'||document.hidden)return;
    const urgent=state.deadline&&remaining()<=10;
    if(nextBeat<ctx.currentTime)nextBeat=ctx.currentTime+.04;
    while(nextBeat<ctx.currentTime+.16){
      if(music){
        // D minor / B-flat / F / C: slow pads beneath a restrained sonar pulse.
        const roots=[73.416,58.27,87.307,65.406];
        const root=roots[Math.floor(step/16)%4];
        if(step%16===0){[1,1.5,2.3784].forEach((ratio,i)=>note(root*ratio,nextBeat,6.8,.035-i*.004,musicBus,'sine'));}
        const pattern=[2,3,4,3,2,3,2.3784,3];
        if(step%2===0)note(root*pattern[(step/2)%8],nextBeat,.75,.035,musicBus,'triangle');
        if(step%4===0||urgent)note(70,nextBeat,.14,urgent?.065:.04,musicBus,'sine',38);
      }
      nextBeat+=.45;step++;
    }
    const second=state.deadline?Math.ceil(remaining()):-1;
    if(second!==lastSecond){lastSecond=second;if(second>0&&second<=10)cue(second<=3?'critical':'warning');}
  }
  function cue(kind){
    if(!effects||!ctx||ctx.state!=='running'||document.hidden)return;
    const t=ctx.currentTime+.005;
    const phrases={tap:[[500,0,.07]],switch:[[280,0,.08],[420,.07,.1]],source:[[660,0,.1],[880,.1,.14]],trust:[[440,0,.12],[660,.1,.2]],reject:[[330,0,.13],[247,.1,.2]],link:[[220,0,.12],[440,.12,.12],[660,.24,.22]],warning:[[760,0,.1]],critical:[[950,0,.08],[950,.14,.08]],success:[[293.66,0,.35],[369.99,.17,.35],[440,.34,.35],[587.33,.51,.7]],delayed:[[293.66,0,.4],[349.23,.2,.4],[440,.4,.6]],failure:[[220,0,.4],[164.81,.25,.5],[146.83,.5,.8]],timeout:[[440,0,.15],[440,.2,.15],[220,.45,.65]]};
    for(const [f,delay,length] of phrases[kind]||phrases.tap)note(f,t+delay,length,.09,fxBus,'sine');
  }
  function toggle(channel){unlock();if(channel==='music')music=!music;else effects=!effects;
    if(ctx){const bus=channel==='music'?musicBus:fxBus;bus.gain.cancelScheduledValues(ctx.currentTime);bus.gain.setTargetAtTime(channel==='music'?(music?.5:0):(effects?.65:0),ctx.currentTime,.04);}
    if(channel==='effects'&&effects)cue('tap');
  }
  function sync(){if(state.screen==='brief'){lastOutcome=null;lastSecond=-1;}
    if(state.screen==='outcome'&&state.outcome!==lastOutcome){lastOutcome=state.outcome;cue({balanced:'success',delayed:'delayed',storm:'failure',timeout:'timeout'}[state.outcome]);}
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-action], [data-mobile]');if(!target)return;
    unlock();const action=target.dataset.action||target.dataset.mobile;
    if(action==='music'||action==='effects')return;
    cue(action.startsWith('agent:')?'link':action==='answer:true'?'trust':action==='answer:false'?'reject':action==='source'?'source':action==='previous'||action==='next'||action.startsWith('preview:')?'switch':'tap');
  },true);
  document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend().catch(()=>{});else if(unlocked){nextBeat=ctx.currentTime+.1;ctx.resume().catch(()=>{});}});
  window.addEventListener('pagehide',()=>{clearInterval(timer);ctx?.close().catch(()=>{});});
  return {toggle,cue,sync,get music(){return music},get effects(){return effects}};
})();
