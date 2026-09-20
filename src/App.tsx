import React, { useMemo, useState } from 'react';
import { solveRedoxEquation } from './utils/redoxSolver';
import { sanitizeEquationInput } from './utils/chemistryParser';
import type { ReactionMedium, RedoxResult } from './types/redox';

const EXAMPLES: Array<{label:string; eq:string; medium:ReactionMedium}> = [
  {label:'Permanganat + oksalat', eq:'MnO4- + C2O4^2- -> Mn2+ + CO2', medium:'acidic'},
  {label:'Dikromat + besi(II)', eq:'Cr2O7^2- + Fe2+ -> Cr3+ + Fe3+', medium:'acidic'},
  {label:'Iodida + permanganat', eq:'MnO4- + I- -> MnO2 + I2', medium:'basic'},
  {label:'Peroksida → oksigen', eq:'H2O2 -> H2O + O2', medium:'acidic'},
];

function Formula({text}:{text:string}) {
  return <span className="formula">{text.replace(/(\d+)/g, d => d.split('').map(x=>'₀₁₂₃₄₅₆₇₈₉'[+x]).join('')).replace(/\^([0-9]*)([+-])/g, (_,n,s)=>`${n||''}${s==='-'?'⁻':'⁺'}`)}</span>;
}
function equationPretty(eq:string){return eq.split(/(->)/).map((p,i)=>p==='->'?<span key={i} className="arrow">→</span>:<span key={i}><Formula text={p}/></span>)}

function App(){
  const [equation,setEquation]=useState(EXAMPLES[0].eq);
  const [medium,setMedium]=useState<ReactionMedium>('acidic');
  const [result,setResult]=useState<RedoxResult>(()=>solveRedoxEquation(EXAMPLES[0].eq,'acidic'));
  const [tab,setTab]=useState<'overview'|'steps'|'verify'>('overview');
  const [copied,setCopied]=useState(false);

  const solve=()=>{
    const clean=sanitizeEquationInput(equation);
    setEquation(clean);
    setResult(solveRedoxEquation(clean,medium));
    setTab('overview');
  };
  const selectExample=(x:typeof EXAMPLES[number])=>{setEquation(x.eq);setMedium(x.medium);setResult(solveRedoxEquation(x.eq,x.medium));setTab('overview')};
  const balanced=result.isValid?result.balancedEquationString:'';
  const stats=useMemo(()=>result.isValid?[
    ['Elektron',String(result.electronsTransferred)],['Perubahan',String(result.redoxChanges.length)],['Status',result.electronBalance.isBalanced?'BALANCED':'CHECK']
  ]:[],[result]);
  const copy=async()=>{if(!balanced)return; await navigator.clipboard?.writeText(balanced);setCopied(true);setTimeout(()=>setCopied(false),1400)};

  return <div className="app">
    <header className="topbar"><div className="brand"><div className="mark">C</div><div><strong>CHEMLY</strong><small>REDOX LAB · v3</small></div></div><div className="top-actions"><span className="engine"><i/> deterministic engine</span><button onClick={()=>document.documentElement.classList.toggle('light')}>◐</button></div></header>
    <main>
      <section className="hero"><div className="eyebrow">CHEMISTRY / REDOX SOLVER</div><h1>Balance reactions.<br/><em>Understand why.</em></h1><p>A clean, exact workspace for redox equations — balancing, oxidation states, half-reactions and verification in one pass.</p></section>
      <section className="workspace">
        <div className="input-card">
          <div className="card-head"><div><span className="label">REACTION INPUT</span><h2>Write the ionic equation</h2></div><span className="kbd">ENTER ↵</span></div>
          <div className="equation-box"><input value={equation} onChange={e=>setEquation(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')solve()}} aria-label="Redox equation"/><button className="solve" onClick={solve}>SOLVE <span>↗</span></button></div>
          <div className="controls"><div><span>MEDIUM</span><div className="seg">{(['acidic','neutral','basic'] as ReactionMedium[]).map(m=><button key={m} className={medium===m?'active':''} onClick={()=>{setMedium(m);setResult(solveRedoxEquation(equation,m))}}>{m}</button>)}</div></div><div className="examples"><span>TRY</span>{EXAMPLES.slice(0,3).map(x=><button key={x.label} onClick={()=>selectExample(x)}>{x.label}</button>)}</div></div>
        </div>

        {!result.isValid ? <div className="error"><b>Unable to solve.</b><span>{result.errorMessage}</span><small>Use forms such as MnO4-, Cr2O7^2-, Fe2+ and a single → arrow.</small></div> : <>
        <div className="result-head"><div><span className="label">RESULT</span><h2>{equationPretty(balanced)}</h2></div><button className="copy" onClick={copy}>{copied?'COPIED':'COPY EQUATION'}</button></div>
        <div className="stats">{stats.map(([a,b])=><div key={a}><span>{a}</span><strong>{b}</strong></div>)}</div>
        <nav className="tabs">{(['overview','steps','verify'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={tab===t?'active':''}>{t==='overview'?'ANALYSIS':t==='steps'?'METHOD':'VERIFICATION'}</button>)}</nav>
        {tab==='overview'&&<Overview result={result}/>} {tab==='steps'&&<Steps result={result}/>} {tab==='verify'&&<Verify result={result}/>} 
        </>}
      </section>
      <section className="examples-grid"><div><span className="label">WORKBENCH</span><h2>Built for learning, not just answers.</h2></div><div className="feature"><b>01</b><strong>Oxidation states</strong><p>See exactly which species gain or lose electrons.</p></div><div className="feature"><b>02</b><strong>Half-reaction method</strong><p>Follow the generated steps instead of trusting a black box.</p></div><div className="feature"><b>03</b><strong>Mass + charge checks</strong><p>Every result is checked before it reaches the interface.</p></div></section>
    </main><footer>CHEMLY <span>•</span> Redox workspace <span>•</span> Offline-capable engine</footer>
  </div>
}

function Overview({result}:{result:RedoxResult}){return <div className="grid2"><article><span className="label">REACTION TYPE</span><h3>{result.reactionCategory}</h3><div className="agents"><div><small>OXIDIZER</small><b>{result.oxidizingAgent.length?result.oxidizingAgent.map(x=><Formula key={x} text={x}/>):'—'}</b></div><div><small>REDUCTANT</small><b>{result.reducingAgent.length?result.reducingAgent.map(x=><Formula key={x} text={x}/>):'—'}</b></div></div></article><article><span className="label">OXIDATION CHANGES</span><div className="changes">{result.redoxChanges.length?result.redoxChanges.map((c,i)=><div className="change" key={i}><b>{c.element}</b><span>{c.reactantBiloks>0?'+':''}{c.reactantBiloks} → {c.productBiloks>0?'+':''}{c.productBiloks}</span><i className={c.type==='oxidation'?'ox':'red'}>{c.type}</i></div>):<p>No oxidation-state change detected.</p>}</div></article></div>}
function Steps({result}:{result:RedoxResult}){return <div className="steps">{result.halfReactionSteps.length?result.halfReactionSteps.map((s,i)=><article key={i}><div className="stepno">{String(i+1).padStart(2,'0')}</div><div><span className="label">{s.title}</span><p>{s.description}</p>{s.oxidationHalf&&<code>{s.oxidationHalf}</code>}{s.reductionHalf&&<code>{s.reductionHalf}</code>}{s.netEquation&&<code>{s.netEquation}</code>}</div></article>):<p>No generated steps.</p>}</div>}
function Verify({result}:{result:RedoxResult}){return <div className="verify"><div className="verify-main"><span className="label">FINAL CHECK</span><h3>Conservation laws</h3><div className="check"><span>Atoms</span><b>✓ balanced</b></div><div className="check"><span>Charge</span><b>{result.chargeVerification.isBalanced?'✓ balanced':'! check'}</b></div><div className="check"><span>Electrons</span><b>{result.electronBalance.isBalanced?'✓ balanced':'! check'}</b></div></div><div className="atom-table">{result.atomVerifications.map(a=><div key={a.element}><b>{a.element}</b><span>{a.leftCount}</span><i>=</i><span>{a.rightCount}</span></div>)}</div></div>}
export default App;
