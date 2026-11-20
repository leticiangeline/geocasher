import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import CacheMap from './Map.jsx'
import Panel from './Panel.jsx'

const NO_ENV = 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env, then restart.'
const NO_TABLES = "The tables don't exist yet. Run the SQL from Create the Tables."

export default function App() {
  const [caches, setCaches] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [problem, setProblem] = useState(supabase ? null : NO_ENV)
  const [notice, setNotice] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [hiding, setHiding] = useState(false)
  const [spot, setSpot] = useState(null)
  const [version, setVersion] = useState(0)

  // Runs on the first render, and again each time a save adds 1 to version
  useEffect(() => {
    if (!supabase) return

    async function load() {
      const found = await supabase.from('geocasher_caches').select('*').order('id')
      const logged = await supabase.from('geocasher_logs').select('*').order('id', { ascending: false })
      const error = found.error || logged.error
      if (error) {
        setProblem(error.code === 'PGRST205' ? NO_TABLES : error.message)
      } else {
        setCaches(found.data)
        setLogs(logged.data)
        setProblem(null)
      }
      setLoading(false)
    }
    load()
  }, [version])

  function select(id) {
    setSelectedId(id)
    setHiding(false)
    setSpot(null)
    setNotice(null)
  }

  function startHiding() {
    setSelectedId(null)
    setHiding(true)
    setSpot(null)
    setNotice(null)
  }

  function stopHiding() {
    setHiding(false)
    setSpot(null)
    setNotice(null)
  }

  async function saveCache(name, hint, difficulty) {
    setSaving(true)
    const { data, error } = await supabase
      .from('geocasher_caches')
      .insert({ name: name, hint: hint, difficulty: difficulty, lat: spot.lat, lng: spot.lng })
      .select()
    setSaving(false)
    if (error) {
      setNotice(error.message)
      return
    }
    setNotice(null)
    setHiding(false)
    setSpot(null)
    setSelectedId(data[0].id)
    setVersion(version + 1)
  }

  async function saveLog(cacheId, nickname, note) {
    setSaving(true)
    const { error } = await supabase
      .from('geocasher_logs')
      .insert({ cache_id: cacheId, nickname: nickname, note: note })
    setSaving(false)
    if (error) {
      setNotice(error.message)
      return false
    }
    setNotice(null)
    setVersion(version + 1)
    return true
  }

  return (
    <main>
      <CacheMap
        caches={caches}
        selectedId={selectedId}
        hiding={hiding}
        spot={spot}
        onSelect={select}
        onPick={setSpot}
      />
      <Panel
        caches={caches}
        logs={logs}
        loading={loading}
        problem={problem}
        notice={notice}
        saving={saving}
        selectedId={selectedId}
        hiding={hiding}
        spot={spot}
        onSelect={select}
        onStartHiding={startHiding}
        onStopHiding={stopHiding}
        onSaveCache={saveCache}
        onSaveLog={saveLog}
      />
    </main>
  )
}
