import { useState } from 'react'

function findsText(count) {
  if (count === 0) return 'no finds yet'
  if (count === 1) return '1 find'
  return `${count} finds`
}

function HideForm({ spot, saving, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [hint, setHint] = useState('')
  const [difficulty, setDifficulty] = useState('3')

  function submit(event) {
    event.preventDefault()
    onSave(name, hint, Number(difficulty))
  }

  if (!spot) {
    return (
      <p>
        Click the map where the cache is hidden. <button type="button" onClick={onCancel}>Cancel</button>
      </p>
    )
  }

  return (
    <form onSubmit={submit}>
      <h2>Hide a cache</h2>
      <p>Placed at {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}. Click the map again to move it.</p>
      <label>Name <input value={name} onChange={(e) => setName(e.target.value)} required /></label>
      <label>Hint <input value={hint} onChange={(e) => setHint(e.target.value)} required /></label>
      <label>
        Difficulty
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
      </label>
      <button disabled={saving}>Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  )
}

function LogForm({ cacheId, saving, onSave }) {
  const [nickname, setNickname] = useState('')
  const [note, setNote] = useState('')

  async function submit(event) {
    event.preventDefault()
    const saved = await onSave(cacheId, nickname, note)
    if (saved) {
      setNickname('')
      setNote('')
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Nickname <input value={nickname} onChange={(e) => setNickname(e.target.value)} required /></label>
      <label>Note <textarea value={note} onChange={(e) => setNote(e.target.value)} rows="2" required /></label>
      <button disabled={saving}>Log a find</button>
    </form>
  )
}

export default function Panel(props) {
  const { caches, logs, loading, problem, notice, saving, selectedId, hiding, spot } = props
  const selected = caches.find((cache) => cache.id === selectedId)
  const entries = selected ? logs.filter((log) => log.cache_id === selected.id) : []

  return (
    <aside>
      <h1>Geocasher</h1>
      <p>Hidden spots, pinned on a map. Find one, then sign its logbook.</p>

      {problem && <p role="alert"><strong>Database not connected.</strong> {problem}</p>}
      {notice && <p role="alert">{notice}</p>}

      {hiding ? (
        <HideForm spot={spot} saving={saving} onSave={props.onSaveCache} onCancel={props.onStopHiding} />
      ) : (
        <button onClick={props.onStartHiding} disabled={Boolean(problem)}>Hide a cache</button>
      )}

      {selected && (
        <article>
          <h2>{selected.name}</h2>
          <p>Difficulty {selected.difficulty} of 5</p>
          <p>Hint: {selected.hint}</p>
          <h3>Logbook</h3>
          {entries.length === 0 && <p>Nobody has signed this logbook yet.</p>}
          <ul>
            {entries.map((log) => (
              <li key={log.id}>
                <strong>{log.nickname}</strong>
                <time>{new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                <p>{log.note}</p>
              </li>
            ))}
          </ul>
          <LogForm key={selected.id} cacheId={selected.id} saving={saving} onSave={props.onSaveLog} />
        </article>
      )}

      {caches.length > 0 && <h2>All caches</h2>}
      {loading && <p>Loading caches...</p>}
      {!loading && !problem && caches.length === 0 && <p>No caches yet. Hide the first one.</p>}
      <ul>
        {caches.map((cache) => (
          <li key={cache.id}>
            <button type="button" aria-current={cache.id === selectedId} onClick={() => props.onSelect(cache.id)}>
              <strong>{cache.name}</strong>
              <span>Difficulty {cache.difficulty} of 5, {findsText(logs.filter((log) => log.cache_id === cache.id).length)}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
