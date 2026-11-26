import sys, re, json, numpy as np, soundfile as sf
from pocketsphinx import Decoder
P=sys.argv[1]
x,sr=sf.read(P+'/'+sys.argv[2])
NUM={'2016':'twenty sixteen','18':'eighteen','37th':'thirty seventh','10,000':'ten thousand','4–1':'four one','78':'seventy eight','1':'one'}
# crude Hinglish g2p -> ARPAbet
DG=[('aa','AA'),('ai','EY'),('au','AO'),('ee','IY'),('oo','UW'),('ei','EY'),('ou','AW'),
    ('kh','K'),('gh','G'),('ch','CH'),('chh','CH'),('jh','JH'),('th','T'),('dh','D'),('ph','F'),('bh','B'),('sh','SH'),('zh','ZH'),('ny','N Y')]
SG={'a':'AH','e':'EY','i':'IH','o':'OW','u':'UH','y':'Y','w':'W','v':'V','b':'B','c':'K','d':'D','f':'F','g':'G','h':'HH','j':'JH','k':'K','l':'L','m':'M','n':'N','p':'P','q':'K','r':'R','s':'S','t':'T','x':'K S','z':'Z'}
def g2p(w):
    w=w.lower(); out=[]; i=0
    while i<len(w):
        for k,v in sorted(DG,key=lambda t:-len(t[0])):
            if w.startswith(k,i): out.append(v); i+=len(k); break
        else:
            out.append(SG.get(w[i],'')); i+=1
    return ' '.join(p for p in out if p)
def toks(text):
    disp=[];spoken=[]
    for t in text.replace('—',' ').replace('…',' ').split():
        core=re.sub(r"^[^\w]+|[^\w,]+$","",t).rstrip(',') if t not in NUM else t
        key=core if core in NUM else re.sub(r"[^\w']","",core)
        if not key: continue
        sp=NUM.get(core, key.lower()).split()
        disp.append((t.replace('—','').strip(), len(sp))); spoken+= [s.lower() for s in sp]
    return disp,spoken
allw=[]; fails=0
for line in open(P+'/'+sys.argv[3]):
    s,e,text=line.strip().split('|'); s=float(s); e=float(e)
    a=max(0,s-0.12); b=min(len(x)/sr,e+0.12)
    disp,spoken=toks(text)
    d=Decoder(samprate=16000,loglevel='ERROR')
    for w in set(spoken):
        if d.lookup_word(w) is None: d.add_word(w,g2p(w),True)
    times=None
    try:
        d.set_align_text(' '.join(spoken))
        d.start_utt(); d.process_raw((x[int(a*sr):int(b*sr)]*32767).astype(np.int16).tobytes(),full_utt=True); d.end_utt()
        seg=[(g.word,g.start_frame/100+a,g.end_frame/100+a) for g in d.seg() if g.word not in ('<s>','</s>','<sil>','(NULL)')]
        seg=[(re.sub(r'\(\d+\)$','',w),st,en) for w,st,en in seg]
        if [w for w,_,_ in seg]==spoken: times=[(st,en) for _,st,en in seg]
    except Exception as ex: pass
    if times is None:
        fails+=1
        syl=[max(1,len(re.findall('[aeiouy]+',w))) for w in spoken]; T=np.cumsum([0]+syl)/sum(syl)
        seg=x[int(s*sr):int(e*sr)]; nf=len(seg)//160
        dbv=20*np.log10(np.sqrt((seg[:nf*160].reshape(nf,160)**2).mean(1))+1e-9)
        v=(dbv>np.percentile(dbv,90)-24).astype(float); cv=np.concatenate([[0],np.cumsum(v)]); cv/=cv[-1]
        tm=lambda q: s+np.searchsorted(cv,q)/100
        times=[(tm(T[i]),tm(T[i+1])) for i in range(len(spoken))]
        print('fallback:',text[:50])
    k=0
    for dt,n in disp:
        allw.append({'w':dt,'s':round(times[k][0],3),'e':round(times[k+n-1][1],3),'piece':s}); k+=n
json.dump(allw,open(P+'/'+sys.argv[4],'w'),indent=0)
print('words',len(allw),'fallbacks',fails)
