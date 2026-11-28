import os; os.makedirs("out", exist_ok=True)
import numpy as np, wave
import json
T=json.load(open('data/timing.json'))
SR=48000; DUR=float(T['duration']); N=int(SR*DUR); rng=np.random.default_rng(7)
mus=np.zeros(N); sfx=np.zeros(N)
def add(buf,t,sig):
    i=int(t*SR)
    if i>=N: return
    j=min(N,i+len(sig)); buf[i:j]+=sig[:j-i]
def env(n,a=0.005,d=0.3):
    t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/d)
def lp(x,a=0.15):
    y=np.empty_like(x); s=0.
    for i,v in enumerate(x): s+=a*(v-s); y[i]=s
    return y
def note(f,dur,amp=.2,d=.9):
    n=int(dur*SR); t=np.arange(n)/SR
    s=np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*2*f*t)*np.exp(-t*3)+.12*np.sin(2*np.pi*3*f*t)*np.exp(-t*6)
    s*= (1+.004*np.sin(2*np.pi*5*t))
    return amp*s*env(n,.008,d)
m=lambda k:440*2**((k-69)/12)
BPM=88; beat=60/BPM; bar=4*beat
chords=[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]]  # Fmaj7 Em7 Dm7 Cmaj7
bass=[41,40,38,36]
t=0.0; b=0
while t<DUR:
    c=chords[b%4]
    for k,nn in enumerate(c): add(mus,t+k*0.018,note(m(nn),bar,.055,1.6))
    for k,nn in enumerate(c): add(mus,t+2.5*beat+k*0.018,note(m(nn+12),beat,.025,.4))
    add(mus,t,note(m(bass[b%4]),beat*1.6,.16,.5)); add(mus,t+2.5*beat,note(m(bass[b%4]),beat,.12,.35))
    for q in range(4):
        tb=t+q*beat
        if q in (0,2):  # kick
            n=int(.25*SR); tt=np.arange(n)/SR; f=55+70*np.exp(-tt*30)
            add(mus,tb,.35*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*14))
        if q in (1,3):  # soft snare
            n=int(.2*SR); add(mus,tb,.07*lp(rng.standard_normal(n),.35)*env(n,.002,.06))
        for h in (0,.5):  # hats, swung
            n=int(.05*SR); hh=rng.standard_normal(n); hh=hh-lp(hh,.5)
            add(mus,tb+h*beat+(0.04 if h else 0),.025*hh*env(n,.001,.015))
    t+=bar; b+=1
# vinyl crackle
cr=np.zeros(N); idx=rng.integers(0,N,int(DUR*25)); cr[idx]=rng.uniform(-.05,.05,len(idx)); mus+=lp(cr,.4)
mus=lp(mus,.35)
fade=np.ones(N); fi=int(.6*SR); fo=int(2.0*SR); fade[:fi]=np.linspace(0,1,fi); fade[-fo:]=np.linspace(1,0,fo); mus*=fade
# SFX
def pop(f=900,a=.22):
    n=int(.09*SR); tt=np.arange(n)/SR; fr=f*(1+1.2*np.exp(-tt*60)); return a*np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-tt*45)
def click(a=.18):
    n=int(.02*SR); x=rng.standard_normal(n); return a*(x-lp(x,.6))*env(n,.0005,.004)
def whoosh(dur=.35,a=.12):
    n=int(dur*SR); x=lp(rng.standard_normal(n),.08); w=np.sin(np.pi*np.arange(n)/n)**2; return a*x*w*3
def chime(a=.16):
    return note(m(84),.8,a,.35)+note(m(88),.8,a*.7,.3)

L=T['lines']; W=T['words']
for i,l in enumerate(L):
    if i: add(sfx,l['s']-0.2,whoosh(.3,.08)); add(sfx,l['s']-0.05,click(.12))
for w in W:
    if w['style']=='s': add(sfx,w['s'],pop(1000,.07))
def cue(line,word):
    for w in W:
        if w['line']==line and w['w'].strip('".,?!:').lower()==word.lower(): return w['s']
    return None
t=cue(0,'AI'); n=int(.3*SR); tt=np.arange(n)/SR
add(sfx,t,.45*np.sin(2*np.pi*np.cumsum(60+80*np.exp(-tt*25))/SR)*np.exp(-tt*9)); add(sfx,t,click(.3))
add(sfx,L[1]['s']-0.1,whoosh(.5,.16))
for (li,wd) in [(3,'folder'),(4,'kholo'),(5,'voice.md.'),(6,'learn'),(7,'topic'),(8,'Ab?'),(9,'fix'),(11,'Save')]:
    tw=cue(li,wd.strip('".,?!:'))
    if tw: add(sfx,tw,chime(.08))
out=mus*.55+sfx
out/=np.max(np.abs(out))*1.12
st=np.stack([out,out],1)
with wave.open('out/bed.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
