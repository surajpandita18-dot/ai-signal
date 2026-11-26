import numpy as np, soundfile as sf, librosa, json, sys
P=sys.argv[1]
x,sr=sf.read(P+'/vid_audio16.wav')
def mf(a,b):
    y=x[int(a*sr):int(b*sr)]
    m=librosa.feature.mfcc(y=y,sr=sr,n_mfcc=20,hop_length=160,n_fft=512)[1:]
    m=(m-m.mean(1,keepdims=True))/(m.std(1,keepdims=True)+1e-6)
    e=librosa.feature.rms(y=y,hop_length=160,frame_length=512)[0]
    return m.T, 20*np.log10(e+1e-9)
def scan(a,b,win=45,hop=5,thr=None):
    M,E=mf(a,b); n=len(M); res=[]
    for i in range(0,n-win,hop):
        if (E[i:i+win]>-40).mean()<.6: continue
        for j in range(i+win+10,n-win,hop):
            if (E[j:j+win]>-40).mean()<.6: continue
            D,_=librosa.sequence.dtw(M[i:i+win].T,M[j:j+win].T,metric='euclidean')
            res.append((D[-1,-1]/win,a+i/100,a+j/100))
    return res
if sys.argv[2]=='cal':
    for a,b,lab in [(162.2,166.2,'known repeat AI ne sirf'),(26.0,30.3,'known repeat turns out'),(170.1,178.0,'known repeat machines'),(40.0,45.1,'no-repeat? Lee Sedol')]:
        r=sorted(scan(a,b))[:3]; print(lab,[(round(d,1),round(s,2),round(t,2)) for d,s,t in r])
else:
    E=json.load(open(P+'/edl.json'))['segs']
    for k,g in enumerate(E):
        r=scan(g['src_s'],g['src_e'])
        if r:
            d,s,t=min(r); print(f"#{k} best {d:.1f} at {s:.2f} ~ {t:.2f}  {g['text'][:40]}")
