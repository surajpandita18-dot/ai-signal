# Estimated word timings (placeholder until the real voice is aligned).
import json, re
lines=json.load(open('data/script.json'))
words=[]; t=0.25; scenes=[]
for li,l in enumerate(lines):
    s0=t
    for ci,chunk in enumerate(l['text'].split('|')):
        for tok in chunk.split():
            style='n'
            m=re.match(r'^(["“]?)([*_])(.+)\2(["”.,?!:]*)$',tok)
            if m:
                style='b' if m.group(2)=='*' else 's'; tok=m.group(1)+m.group(3)+m.group(4)
            d=0.1+0.036*len(re.sub(r'\W','',tok))
            words.append({"w":tok,"s":round(t,3),"e":round(t+d,3),"line":li,"chunk":ci,"style":style})
            t+=d+0.03
            if tok[-1] in ',:': t+=0.12
            if tok[-1] in '.?!"': t+=0.22
        t+=0.08
    scenes.append({"scene":l['scene'],"s":round(s0,3),"e":round(t,3)})
    t+=0.25
json.dump({"duration":round(t+1.2,2),"words":words,"lines":scenes},open('data/timing.json','w'),indent=0)
print(round(t+1.2,2), len(words))
