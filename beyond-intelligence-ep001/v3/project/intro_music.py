import numpy as np, soundfile as sf, sys
sr=48000; T=7.0; t=np.arange(int(T*sr))/sr; L=np.zeros_like(t); R=np.zeros_like(t)
hz=lambda n:440*2**((n-69)/12)
def add(sig,st,pan=0.0,g=1.0):
    i=int(st*sr); n=min(len(sig),len(L)-i); l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    L[i:i+n]+=sig[:n]*g*l; R[i:i+n]+=sig[:n]*g*r
def pluck(f,d=1.2):
    tt=np.arange(int(d*sr))/sr; env=np.exp(-tt*5)*(1-np.exp(-tt*400))
    return env*(np.sin(2*np.pi*f*tt)+.35*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*9)+.12*np.sin(2*np.pi*3*f*tt)*np.exp(-tt*14))
# 9 node plucks: D minor pentatonic ascending
notes=[62,65,67,69,72,74,77,79,81]
for k,n in enumerate(notes): add(pluck(hz(n)),0.12+k*.085,pan=-.5+k/8,g=.16)
# sub swell into the hit
sw=(t<1.45)*np.clip(t/1.45,0,1)**2*np.sin(2*np.pi*hz(38)*t)*.22; L+=sw; R+=sw
# filtered noise riser 0.85-1.42
rng=np.random.default_rng(3); nz=rng.standard_normal(len(t))
from scipy.signal import butter,sosfilt
rise=sosfilt(butter(2,[1500,7000],'bp',fs=sr,output='sos'),nz)*np.clip((t-.85)/.57,0,1)**3*(t<1.44)*.10; L+=rise; R+=rise[::-1][:len(t)]*0+rise
# chord hit at 1.42: D minor add9 pad, slow decay
def pad(f,d=5.5):
    tt=np.arange(int(d*sr))/sr; env=(1-np.exp(-tt*30))*np.exp(-tt*.55)
    return env*sum(np.sin(2*np.pi*f*(1+dt)*tt+ph) for dt,ph in [(-.003,0),(0,1),(.004,2)])/3
for n,p in [(38,0),(50,-.2),(57,.2),(62,-.3),(65,.3),(69,0),(76,.1)]: add(pad(hz(n)),1.42,pan=p,g=.11 if n>45 else .2)
# soft low boom
tt=np.arange(int(1.5*sr))/sr; boom=np.sin(2*np.pi*(55*np.exp(-tt*3)+38)*tt)*np.exp(-tt*4)*.5; add(boom,1.42,g=.8)
# shimmer bell on wordmark
for k,n in enumerate([86,93]): add(pluck(hz(n),2.5)*.6,1.62+k*.12,pan=.4-.8*k,g=.08)
# simple reverb: multi-tap echoes
out=np.stack([L,R],1)
for d,gn in [(.071,.25),(.113,.2),(.167,.15),(.241,.1),(.337,.07)]:
    k=int(d*sr); out[k:,0]+=out[:-k,1]*gn; out[k:,1]+=out[:-k,0]*gn
out*=np.minimum(1,np.clip((T-t)/2.5,0,1))[:,None]
out/=np.abs(out).max()/0.89
sf.write(sys.argv[1],out,sr)
