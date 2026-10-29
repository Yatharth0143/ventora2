import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const api = async (url, body, token) => {
  const response = await fetch(`/api${url}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('ventora-token'));
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [ideas, setIdeas] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeIdea, setActiveIdea] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    api('/me', null, token).then((person) => { setUser(person); setPage(person.role === 'investor' ? (person.verified ? 'feed' : 'onboarding') : 'dashboard'); }).catch(() => { localStorage.removeItem('ventora-token'); setToken(null); });
  }, [token]);

  const refresh = async () => {
    if (!token || !user) return;
    try {
      if (user.role === 'innovator' || page === 'feed' || page === 'preview') setIdeas(await api('/ideas', null, token));
      if (['dashboard', 'requests', 'messages'].includes(page)) setRequests(await api('/requests', null, token));
    } catch (error) { setNotice(error.message); }
  };
  useEffect(() => { refresh(); }, [token, user, page]);
  useEffect(() => {
    if (!activeRequest || page !== 'messages') return;
    const load = () => api(`/messages/${activeRequest._id}`, null, token).then(setMessages).catch((error) => setNotice(error.message));
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [activeRequest, page, token]);

  const signIn = async (event, mode) => {
    event.preventDefault(); setBusy(true); setNotice('');
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api(`/${mode}`, fields);
      localStorage.setItem('ventora-token', result.token); setToken(result.token);
    } catch (error) { setNotice(error.message); }
    setBusy(false);
  };
  const logout = () => { localStorage.removeItem('ventora-token'); setToken(null); setUser(null); setPage('home'); };
  const submitIdea = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try { const idea = await api('/ideas', Object.fromEntries(new FormData(event.currentTarget)), token); setIdeas([idea, ...ideas]); setActiveIdea(idea); setPage('score'); }
    catch (error) { setNotice(error.message); }
    setBusy(false);
  };
  const sendRequest = async () => {
    try { await api('/requests', { ideaId: activeIdea._id, note: 'I would like to learn more about your idea.' }, token); setNotice('Request sent. One token used.'); setPage('requests'); }
    catch (error) { setNotice(error.message); }
  };
  const respond = async (request, status) => {
    try {
      await fetch(`/api/requests/${request._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) }).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.error); });
      setRequests(await api('/requests', null, token));
    } catch (error) { setNotice(error.message); }
  };
  const onboard = async (event) => {
    event.preventDefault(); setNotice('');
    const form = new FormData(event.currentTarget);
    try { await fetch('/api/onboard', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ investorType: form.get('investorType'), range: form.get('range'), industries: form.getAll('industries'), stages: form.getAll('stages') }) }).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.error); }); setUser({ ...user, verified: true }); setPage('feed'); }
    catch (error) { setNotice(error.message); }
  };
  const sendMessage = async (event) => {
    event.preventDefault(); const form = event.currentTarget; const text = new FormData(form).get('text');
    try { await fetch(`/api/messages/${activeRequest._id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text }) }).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.error); }); form.reset(); setMessages(await api(`/messages/${activeRequest._id}`, null, token)); }
    catch (error) { setNotice(error.message); }
  };

  const nav = (key, label) => <button className={page === key ? 'nav on' : 'nav'} onClick={() => { setNotice(''); setPage(key); }}>{label}</button>;
  const money = (value) => value ? `₹${value}L` : 'Open to offers';
  const initials = user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'V';

  if (user) return <div className="app-layout">
    <aside className="sidebar"><a className="brand" onClick={() => setPage(user.role === 'investor' ? 'feed' : 'dashboard')}><span className="brand-icon">V</span> ventora</a><div className="side-label">WORKSPACE</div>
      {user.role === 'innovator' ? <>{nav('dashboard', 'Overview')}{nav('idea', '＋  Submit an idea')}{nav('requests', 'Connections')}{nav('messages', 'Messages')}</> : <>{nav('feed', 'Discover ideas')}{nav('requests', 'My requests')}{nav('messages', 'Messages')}{nav('onboarding', 'Preferences')}</>}
      <div className="sidebar-bottom"><div className="profile"><div className="avatar">{initials}</div><div><b>{user.name}</b><small>{user.role}</small></div></div><button className="nav" onClick={logout}>Sign out</button></div>
    </aside>
    <main className="main"><header className="topbar"><div className="crumb">Workspace <span>/</span> {page === 'dashboard' ? 'Overview' : page[0].toUpperCase() + page.slice(1)}</div><div className="top-user"><span className="status-dot"/>{user.verified || user.role === 'innovator' ? 'Account ready' : 'Setup needed'}<div className="avatar small">{initials}</div></div></header>
      <div className="content">{notice && <div className="notice" onClick={() => setNotice('')}>{notice}<button>×</button></div>}
      {page === 'dashboard' && <><div className="eyebrow">YOUR STUDIO</div><h1>Good to see you, {user.name.split(' ')[0]}.</h1><p className="lead">A little progress today can take your idea a long way.</p><div className="stats"><div className="stat"><span>Ideas submitted</span><b>{ideas.length}</b></div><div className="stat"><span>Published</span><b>{ideas.filter((idea) => idea.status === 'Published').length}</b></div><div className="stat"><span>Connection requests</span><b>{requests.filter((request) => request.status === 'Pending').length}</b></div></div><div className="section-head"><div><h2>Your ideas</h2><p>Only the teaser is visible until you accept a connection.</p></div><button className="button dark" onClick={() => setPage('idea')}>＋ New idea</button></div>{ideas.length ? <div className="idea-list">{ideas.map((idea) => <article className="idea-row" key={idea._id}><div className="idea-mark">{idea.title[0]}</div><div className="idea-info"><b>{idea.title}</b><span>{idea.industry} · {idea.stage}</span></div><div className="score"><b>{idea.score}</b><small>completeness</small></div><span className="pill">{idea.status}</span></article>)}</div> : <div className="empty"><span>✳</span><h3>Your first idea starts here</h3><p>Share the problem and your approach. You can keep the sensitive details private.</p><button className="button dark" onClick={() => setPage('idea')}>Submit an idea</button></div>}</>}
      {page === 'idea' && <><div className="eyebrow">NEW SUBMISSION</div><h1>Tell us what you’re building.</h1><p className="lead">Share the public version. Keep trade secrets and private details to yourself.</p><form className="form-card" onSubmit={submitIdea}><div className="form-grid"><label>Idea or startup name<input name="title" required placeholder="e.g. AgriDrone Analytics" /></label><label>Industry<select name="industry" required><option value="">Choose one</option>{['AgriTech','FinTech','HealthTech','EdTech','SaaS','D2C','CleanTech','Other'].map(x => <option>{x}</option>)}</select></label><label>Current stage<select name="stage" required><option value="">Choose one</option>{['Idea','MVP','Early traction','Growth'].map(x => <option>{x}</option>)}</select></label><label>Funding target (₹ lakhs)<input name="funding" type="number" min="0" placeholder="15" /></label><label className="wide">One-line pitch <small>Shown in the investor feed · 140 characters</small><input name="pitch" maxLength="140" required placeholder="A clear sentence about what you do" /></label><label className="wide">What problem are you solving?<textarea name="problem" required rows="4" placeholder="Who has this problem, and why does it matter?" /></label><label className="wide">How does your solution work?<textarea name="solution" rows="3" placeholder="Keep this high level. Sensitive details stay private." /></label><label>Who will use it?<textarea name="audience" rows="2" placeholder="Your target customers" /></label><label>Market opportunity<textarea name="market" rows="2" placeholder="What does the market look like?" /></label><label>How will it make money?<textarea name="businessModel" rows="2" placeholder="Your business model" /></label><label>Competitors or alternatives<textarea name="competitors" rows="2" placeholder="What do people use today?" /></label></div><div className="form-foot"><span>✦ Your completeness score is based on how much detail you share.</span><button className="button dark" disabled={busy}>{busy ? 'Saving…' : 'Publish idea →'}</button></div></form></>}
      {page === 'score' && activeIdea && <div className="score-result"><div className="eyebrow">IDEA PUBLISHED</div><div className="score-circle">{activeIdea.score}<small>/100</small></div><h1>{activeIdea.title}</h1><p className="lead">Completeness score — this is not a prediction of success.</p><div className="notice">{activeIdea.score < 70 ? 'Add detail to your solution, audience, market, business model, and funding plan to improve the score.' : 'Nice start. Investors can now discover your public teaser.'}</div><button className="button dark" onClick={() => setPage('dashboard')}>Back to my studio</button></div>}
      {page === 'onboarding' && <><div className="eyebrow">INVESTOR SETUP</div><h1>What are you looking for?</h1><p className="lead">A few preferences help us find ideas worth your time. Verification here is just a prototype checkbox.</p><form className="form-card" onSubmit={onboard}><label>Investor type<select name="investorType"><option>Angel investor</option><option>Venture fund</option><option>Corporate</option><option>Other</option></select></label><p className="label">Industries</p><div className="checks">{['AgriTech','FinTech','HealthTech','EdTech','SaaS','CleanTech'].map(x => <label><input type="checkbox" name="industries" value={x} />{x}</label>)}</div><p className="label">Stages</p><div className="checks">{['Idea','MVP','Early traction','Growth'].map(x => <label><input type="checkbox" name="stages" value={x} />{x}</label>)}</div><label className="field-label">Typical investment range<select name="range"><option>₹5L–₹25L</option><option>₹25L–₹1Cr</option><option>₹1Cr+</option><option>Flexible</option></select></label><button className="button dark">Save and see ideas →</button></form></>}
      {page === 'feed' && <><div className="eyebrow">THE VENTORA NETWORK</div><h1>Good ideas, meet good people.</h1><p className="lead">A small batch of ideas picked for you. Only public details show here.</p>{!user.verified && <div className="notice">Finish investor setup to send a connection request. <button onClick={() => setPage('onboarding')}>Set up →</button></div>}<div className="feed-grid">{ideas.map((idea) => <article className="feed-card" key={idea._id}><div className="card-top"><span className="pill">{idea.industry}</span><span className="score-label">✳ {idea.score} score</span></div><h3>{idea.title}</h3><p>{idea.pitch}</p><div className="card-bottom"><span>{idea.stage} · {money(idea.funding)}</span><button className="text-button" onClick={() => { setActiveIdea(idea); setPage('preview'); }}>Take a look ↗</button></div></article>)}</div>{!ideas.length && <div className="empty"><span>⌕</span><h3>No ideas in the feed yet</h3><p>When innovators publish, you’ll find them here.</p></div>}</>}
      {page === 'preview' && activeIdea && <><button className="text-button back" onClick={() => setPage('feed')}>← Back to ideas</button><div className="preview"><div><span className="pill">{activeIdea.industry}</span><span className="pill">{activeIdea.stage}</span><h1>{activeIdea.title}</h1><p className="lead">{activeIdea.pitch}</p><div className="preview-block"><h3>The problem</h3><p>{activeIdea.problem}</p></div><div className="preview-block"><h3>High-level solution</h3><p>{activeIdea.solution || 'The founder has kept this detail private for now.'}</p></div><div className="locked"><span>🔒</span><div><b>Business model, financials and pitch deck</b><p>These details stay private until the innovator accepts.</p></div></div></div><aside className="request-box"><div className="eyebrow">FUNDING TARGET</div><h2>{money(activeIdea.funding)}</h2><p>Founder identity stays private until they accept your request.</p><div className="token-note">● 1 connection token</div><button className="button dark full" onClick={sendRequest} disabled={!user.verified}>Request a conversation</button>{!user.verified && <small>Complete investor setup first.</small>}</aside></div></>}
      {page === 'requests' && <><div className="eyebrow">YOUR CONNECTIONS</div><h1>{user.role === 'innovator' ? 'People want to meet.' : 'Your connection requests.'}</h1><p className="lead">Conversations open after a request is accepted.</p><div className="request-list">{requests.map((request) => <article className="request-card" key={request._id}><div className="request-head"><div><span className="pill">{request.status}</span><h3>{request.idea?.title || 'Idea'}</h3><p>{user.role === 'innovator' ? `${request.investor?.name || 'Investor'} · ${request.investor?.investorType || 'Investor'}` : `Founder · ${request.innovator?.name || 'Innovator'}`}</p></div><span className="token-note">● 1 token</span></div><p className="request-note">“{request.note || 'I would like to learn more about this idea.'}”</p><div className="request-actions">{user.role === 'innovator' && request.status === 'Pending' && <><button className="button light" onClick={() => respond(request, 'Declined')}>Decline</button><button className="button dark" onClick={() => respond(request, 'Accepted')}>Accept connection</button></>}{request.status === 'Accepted' && <button className="button dark" onClick={() => { setActiveRequest(request); setPage('messages'); }}>Open conversation →</button>}</div></article>)}</div>{!requests.length && <div className="empty"><span>♡</span><h3>Nothing here yet</h3><p>New connection requests will show up here.</p></div>}</>}
      {page === 'messages' && <><div className="eyebrow">CONVERSATIONS</div><h1>Talk it through.</h1><div className="chat-layout"><div className="chat-list">{requests.filter(x => x.status === 'Accepted').map((request) => <button className={activeRequest?._id === request._id ? 'chat-choice active' : 'chat-choice'} onClick={() => setActiveRequest(request)}><b>{request.idea?.title}</b><small>{user.role === 'innovator' ? request.investor?.name : request.innovator?.name}</small></button>)}{!requests.some(x => x.status === 'Accepted') && <p className="muted">Accepted connections appear here.</p>}</div><div className="chat"><div className="chat-title">{activeRequest?.idea?.title || 'Choose a conversation'}</div><div className="chat-messages">{messages.map((message) => <div className={message.sender?._id === user._id ? 'bubble mine' : 'bubble'}><small>{message.sender?.name || 'You'}</small><p>{message.text}</p></div>)}</div>{activeRequest && <form className="chat-form" onSubmit={sendMessage}><input name="text" required maxLength="2000" placeholder="Write a message…" /><button className="button dark">Send</button></form>}</div></div></>}
      </div>
    </main>
  </div>;

  if (page === 'login' || page === 'signup') return <div className="auth-page"><a className="brand" onClick={() => setPage('home')}><span className="brand-icon">V</span> ventora</a><div className="auth-card"><div className="eyebrow">{page === 'signup' ? 'MAKE YOUR NEXT MOVE' : 'WELCOME BACK'}</div><h1>{page === 'signup' ? 'Find your people.' : 'Good to see you.'}</h1><p className="lead">{page === 'signup' ? 'A thoughtful place for ambitious ideas and the people who can help.' : 'Pick up where you left off.'}</p><form onSubmit={(event) => signIn(event, page)}>{page === 'signup' && <><label>Your name<input name="name" required placeholder="Full name" /></label><label className="label">I’m here as</label><div className="role-select"><label><input type="radio" name="role" value="innovator" defaultChecked /> Innovator</label><label><input type="radio" name="role" value="investor" /> Investor</label></div></>}<label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label><label>Password<input name="password" type="password" minLength="8" required placeholder="At least 8 characters" /></label><button className="button dark full" disabled={busy}>{busy ? 'One second…' : page === 'signup' ? 'Create your account →' : 'Log in →'}</button></form><p className="switch-auth">{page === 'signup' ? 'Already have an account?' : 'New to Ventora?'} <button onClick={() => { setNotice(''); setPage(page === 'signup' ? 'login' : 'signup'); }}>{page === 'signup' ? 'Log in' : 'Create an account'}</button></p>{notice && <div className="notice">{notice}</div>}</div><p className="auth-foot">Made for the early days of something big.</p></div>;

  return <div className="landing"><nav className="landing-nav"><a className="brand" onClick={() => setPage('home')}><span className="brand-icon">V</span> ventora</a><div className="landing-links"><a href="#how">How it works</a><a href="#about">For innovators</a><a href="#about">For investors</a></div><div className="landing-actions"><button className="text-button" onClick={() => setPage('login')}>Log in</button><button className="button dark" onClick={() => setPage('signup')}>Get started <span>↗</span></button></div></nav><section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="status-dot"/> THE EARLY STAGE STARTS HERE</div><h1>Big ideas deserve<br/>the <em>right room.</em></h1><p>Ventora brings thoughtful founders and curious investors together, one good conversation at a time.</p><div className="hero-actions"><button className="button dark" onClick={() => setPage('signup')}>I have an idea <span>↗</span></button><button className="button light" onClick={() => setPage('signup')}>I invest in ideas <span>↗</span></button></div><div className="trust-note"><span>✳</span> Your idea stays yours. Details open only when you say so.</div></div><div className="hero-art"><div className="orb orb-one"/><div className="orb orb-two"/><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-card"><div className="card-top"><span className="pill">AgriTech</span><span className="score-label">✳ 86</span></div><h3>Small farms,<br/>smarter harvests.</h3><p>A new perspective on crop health is taking root.</p><div className="card-bottom"><span>Early stage · India</span><span>↗</span></div></div><div className="float-note"><span className="note-icon">✳</span><span><b>A good match.</b><small>That’s where it begins.</small></span></div><div className="flower">✳</div></div></section><section className="how" id="how"><div><div className="eyebrow">A MORE HUMAN WAY TO CONNECT</div><h2>Less pitching into the void.<br/><em>More finding your people.</em></h2></div><div className="steps"><div><small>01</small><h3>Share the outline</h3><p>Tell us what problem you’re solving. Keep the sensitive bits private.</p></div><div><small>02</small><h3>Find your fit</h3><p>Investors explore ideas that fit their interests and stage.</p></div><div><small>03</small><h3>Start a conversation</h3><p>When you’re ready, accept a request and take it from there.</p></div></div></section><footer id="about"><a className="brand" onClick={() => setPage('home')}><span className="brand-icon">V</span> ventora</a><span>For the ideas that are just getting started.</span><button className="text-button" onClick={() => setPage('signup')}>Join the community ↗</button></footer></div>;
}

createRoot(document.getElementById('root')).render(<App />);
