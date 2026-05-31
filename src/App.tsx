import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const cards = [
    ['Capture', 'Frame ideas before they drift.'],
    ['Shape', 'Turn rough scenes into structured concepts.'],
    ['Launch', 'Ship locally, then publish with GitHub Pages.'],
  ]

  return (
    <main className="app">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">DreamFrame</p>
          <h1>Frame the first version of every vivid idea.</h1>
          <p className="intro">
            A fast React workspace with local development, production preview,
            and GitHub Pages deployment already wired in.
          </p>
          <div className="actions" aria-label="Project commands">
            <code>npm run dev</code>
            <code>npm run dev:host</code>
            <code>npm run build</code>
          </div>
        </div>
        <div className="frame-stage" aria-label="DreamFrame preview">
          <img src={heroImg} alt="" />
          <div className="glass-panel">
            <span>Localhost ready</span>
            <strong>GitHub Pages deploy</strong>
          </div>
        </div>
      </section>

      <section className="workflow" aria-label="DreamFrame workflow">
        {cards.map(([title, body]) => (
          <article className="workflow-card" key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="deploy-panel">
        <div>
          <h2>Deployment Path</h2>
          <p>
            Push to <code>main</code> and GitHub Actions publishes the built
            site to Pages.
          </p>
        </div>
        <div className="status-grid">
          <span>React</span>
          <span>Vite</span>
          <span>Pages</span>
        </div>
      </section>
    </main>
  )
}

export default App
