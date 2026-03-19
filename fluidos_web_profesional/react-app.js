const {useState, useEffect} = React;

function Formula({tex, display=true}){
  const ref = React.useRef(null);
  useEffect(()=>{
    if(window.katex && ref.current){
      try{ ref.current.innerHTML = katex.renderToString(tex || '', {throwOnError:false, displayMode: !!display}); }
      catch(e){ ref.current.textContent = tex; }
    }
  },[tex,display]);
  return <div ref={ref} className={display? 'equation katex-display' : 'inline-eq'} aria-hidden>{/* rendered by KaTeX */}</div>
}

function ReCalculator(){
  const [rho,setRho]=useState(900), [mu,setMu]=useState(0.05), [D,setD]=useState(0.02), [V,setV]=useState(1.5);
  const Re = rho*V*D/mu;
  const regime = Re<2300? 'Laminar' : (Re<=4000? 'Transición' : 'Turbulento');
  return (
    <div className="card">
      <h3 className="section-title">Calculadora Reynolds</h3>
      <div className="calculator">
        <div className="form-row"><input className="input" value={rho} onChange={e=>setRho(parseFloat(e.target.value)||0)} /><label>ρ kg/m³</label></div>
        <div className="form-row"><input className="input" value={mu} onChange={e=>setMu(parseFloat(e.target.value)||0)} /><label>μ Pa·s</label></div>
        <div className="form-row"><input className="input" value={D} onChange={e=>setD(parseFloat(e.target.value)||0)} /><label>D m</label></div>
        <div className="form-row"><input className="input" value={V} onChange={e=>setV(parseFloat(e.target.value)||0)} /><label>V m/s</label></div>
        <div className="result">Re = {Re.toExponential(3)} — {regime}</div>
      </div>
    </div>
  )
}

function PoiseuilleCalculator(){
  const [mu,setMu]=useState(0.2), [L,setL]=useState(50), [R,setR]=useState(0.01), [Q,setQ]=useState(0.0001);
  const dP = 8*mu*L*Q/(Math.PI*Math.pow(R,4));
  return (
    <div className="card">
      <h3 className="section-title">Calculadora Poiseuille</h3>
      <div className="calculator">
        <div className="form-row"><input className="input" value={mu} onChange={e=>setMu(parseFloat(e.target.value)||0)} /><label>μ</label></div>
        <div className="form-row"><input className="input" value={L} onChange={e=>setL(parseFloat(e.target.value)||0)} /><label>L m</label></div>
        <div className="form-row"><input className="input" value={R} onChange={e=>setR(parseFloat(e.target.value)||0)} /><label>R m</label></div>
        <div className="form-row"><input className="input" value={Q} onChange={e=>setQ(parseFloat(e.target.value)||0)} /><label>Q m³/s</label></div>
        <div className="result">ΔP = {dP.toExponential(4)} Pa</div>
      </div>
    </div>
  )
}

function StokesCalculator(){
  const [rhop,setRhop]=useState(2650), [rhof,setRhof]=useState(997), [mu,setMu]=useState(0.001002), [D,setD]=useState(0.00005);
  const r = D/2; const vt = 2*Math.pow(r,2)*(rhop-rhof)*9.81/(9*mu);
  const Rep = rhof*vt*D/mu;
  return (
    <div className="card">
      <h3 className="section-title">Calculadora Stokes</h3>
      <div className="calculator">
        <div className="form-row"><input className="input" value={rhop} onChange={e=>setRhop(parseFloat(e.target.value)||0)} /><label>ρp</label></div>
        <div className="form-row"><input className="input" value={rhof} onChange={e=>setRhof(parseFloat(e.target.value)||0)} /><label>ρf</label></div>
        <div className="form-row"><input className="input" value={mu} onChange={e=>setMu(parseFloat(e.target.value)||0)} /><label>μ</label></div>
        <div className="form-row"><input className="input" value={D} onChange={e=>setD(parseFloat(e.target.value)||0)} /><label>D m</label></div>
        <div className="result">vₜ = {vt.toExponential(4)} m/s — Reₚ = {Rep.toExponential(3)}</div>
      </div>
    </div>
  )
}

function Collapsible({title,children,defaultOpen=true}){
  const [open,setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <div className="summary" onClick={()=>setOpen(!open)}>
        <h4>{title}</h4>
        <div className="controls"><button className="btn">{open? 'Ocultar' : 'Mostrar'}</button></div>
      </div>
      {open && <div className="content">{children}</div>}
    </div>
  )
}

function App(){
  return (
    <div className="container">
      <header className="header">
        <div className="brand"><div className="brand-mark">μ</div><div><strong>Fluidos — React</strong><div style={{color:'var(--muted)'}}>Demo interactiva modernizada</div></div></div>
        <div className="controls"><a className="btn" href="index.html">Volver al sitio</a></div>
      </header>

      <div className="grid">
        <main>
          <div className="hero-card">
            <h2>Viscosidad, Reynolds, Poiseuille y Stokes</h2>
            <p className="muted">Material interactivo reimplementado con React para una UX más moderna.</p>
            <Formula tex="Q = \\frac{\\pi R^{4} \\Delta P}{8 \\mu L}" display={true} />
          </div>

          <Collapsible title="Sección teórica">
            <h3>Fundamentos</h3>
            <p>Viscosidad y conceptos claves.</p>
            <Formula tex="\\tau = \\mu \\frac{du}{dy}" display={false} />
            <Formula tex="\\nu = \\frac{\\mu}{\\rho}" display={false} />
          </Collapsible>

          <Collapsible title="Ejercicios resueltos">
            <p>Ejemplo 1: Re = \rho V D / \mu</p>
            <Formula tex="Re = \\frac{\\rho V D}{\\mu}" display={false} />
          </Collapsible>

        </main>

        <aside>
          <ReCalculator />
          <PoiseuilleCalculator />
          <StokesCalculator />
        </aside>
      </div>

    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
