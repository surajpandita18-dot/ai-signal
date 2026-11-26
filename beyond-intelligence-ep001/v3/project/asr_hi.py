import sys, json, numpy as np, soundfile as sf, sherpa_onnx
D=sys.argv[1]; wav=sys.argv[2]; out=sys.argv[3]
x,sr=sf.read(wav); assert sr==16000
f=160; n=len(x)//f
db=20*np.log10(np.sqrt((x[:n*f].reshape(n,f)**2).mean(1)+1e-12))
th=-40; voiced=db>th
# segments of speech separated by >=250ms silence
segs=[];i=0
while i<n:
    if voiced[i]:
        j=i;last=i
        while j<n and (j-last)<25:
            if voiced[j]: last=j
            j+=1
        segs.append([i,last+1]); i=j
    else: i+=1
# merge into 3-9s pieces
pieces=[]
for s,e in segs:
    if pieces and (e-pieces[-1][0])<900 and (s-pieces[-1][1])<60 and (pieces[-1][1]-pieces[-1][0])<300: pieces[-1][1]=e
    else: pieces.append([s,e])
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{D}/small-encoder.int8.onnx',decoder=f'{D}/small-decoder.int8.onnx',tokens=f'{D}/small-tokens.txt',language='hi',task='transcribe',num_threads=4)
res=[]
for s,e in pieces:
    a=max(0,s*f-1600); b=min(len(x),e*f+1600)
    st=rec.create_stream(); st.accept_waveform(16000,x[a:b].astype(np.float32)); rec.decode_stream(st)
    t=st.result.text.strip(); res.append({'s':round(s/100,2),'e':round(e/100,2),'t':t}); print(f"{s/100:7.2f}-{e/100:7.2f}  {t}",flush=True)
json.dump(res,open(out,'w'),indent=1)
