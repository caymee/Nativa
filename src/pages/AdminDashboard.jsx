
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sprout,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  ExternalLink,
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../lib/supabase'

function AdminDashboard() {
  const navigate = useNavigate()

  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [error, setError] = useState('')

  // VERIFICAR SE O USUÁRIO É ADMINISTRADOR
  useEffect(() => {
    async function loadAdmin() {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser()

      if (authError || !user) {
        navigate('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError || profile?.user_type !== 'admin') {
        navigate('/')
        return
      }

      await loadOpportunities()
    }

    loadAdmin()
  }, [navigate])

  // BUSCAR OPORTUNIDADES
  async function loadOpportunities() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setError('Não foi possível carregar as oportunidades.')
    } else {
      setOpportunities(data || [])
    }

    setLoading(false)
  }

  // APROVAR OU REJEITAR
  async function updateStatus(id, newStatus) {
    const confirmation = window.confirm(
      newStatus === 'published'
        ? 'Tem certeza de que deseja aprovar e publicar esta oportunidade?'
        : 'Tem certeza de que deseja rejeitar esta oportunidade?'
    )

    if (!confirmation) return

    setProcessing(id)
    setError('')

    const { error } = await supabase
      .from('opportunities')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      console.error(error)
      setError('Não foi possível atualizar a oportunidade.')
    } else {
      await loadOpportunities()
    }

    setProcessing(null)
  }

  // SAIR
  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const pending = opportunities.filter(
    (item) => item.status === 'pending'
  )

  const published = opportunities.filter(
    (item) => item.status === 'published'
  )

  const rejected = opportunities.filter(
    (item) => item.status === 'rejected'
  )

  const visibleOpportunities = opportunities.filter(
    (item) => item.status === activeTab
  )

  const tabs = [
    { id: 'pending', label: 'Em análise', count: pending.length },
    { id: 'published', label: 'Publicadas', count: published.length },
    { id: 'rejected', label: 'Rejeitadas', count: rejected.length },
  ]

  return (
    <main className="min-h-screen bg-[#FAF9F4] text-[#354326]">

      {/* HEADER */}

      <header className="flex items-center justify-between border-b border-[#354326]/10 px-6 py-5 md:px-14">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          <Sprout size={25} />
          nativa<span className="text-[#B68B58]">.</span>
        </button>

        <div className="flex items-center gap-4">

          <span className="hidden text-xs uppercase tracking-widest text-[#92947F] sm:block">
            Painel administrativo
          </span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-[#354326]/20 px-4 py-2 text-sm transition hover:bg-[#354326]/10"
          >
            <LogOut size={16} />
            Sair
          </button>

        </div>

      </header>

      {/* CONTEÚDO */}

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-14">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>

            <span className="text-xs uppercase tracking-[0.2em] text-[#A68B5E]">
              Administração
            </span>

            <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
              Central de oportunidades.
            </h1>

            <p className="mt-4 max-w-xl leading-7 text-[#777B69]">
              Analise as oportunidades enviadas pelas organizações e
              decida quais serão publicadas na plataforma.
            </p>

          </div>

          <button
            onClick={loadOpportunities}
            disabled={loading}
            className="flex items-center gap-2 self-start rounded-full border border-[#354326]/20 px-5 py-3 text-sm transition hover:bg-[#354326]/10 disabled:opacity-50 md:self-auto"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>

        </div>

        {/* INDICADORES */}

        <div className="mt-12 grid gap-4 sm:grid-cols-3">

          <div className="border border-[#354326]/10 bg-white p-6">
            <Clock className="text-[#B68B58]" size={23} />
            <p className="mt-5 text-3xl font-medium">{pending.length}</p>
            <p className="mt-1 text-sm text-[#777B69]">
              Aguardando análise
            </p>
          </div>

          <div className="border border-[#354326]/10 bg-white p-6">
            <CheckCircle className="text-[#647B4D]" size={23} />
            <p className="mt-5 text-3xl font-medium">{published.length}</p>
            <p className="mt-1 text-sm text-[#777B69]">
              Oportunidades publicadas
            </p>
          </div>

          <div className="border border-[#354326]/10 bg-white p-6">
            <XCircle className="text-[#A15D43]" size={23} />
            <p className="mt-5 text-3xl font-medium">{rejected.length}</p>
            <p className="mt-1 text-sm text-[#777B69]">
              Oportunidades rejeitadas
            </p>
          </div>

        </div>

        {/* MENSAGEM DE ERRO */}

        {error && (
          <div className="mt-8 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ABAS */}

        <div className="mt-14 flex flex-wrap gap-3 border-b border-[#354326]/15 pb-5">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-3 text-sm transition ${
                activeTab === tab.id
                  ? 'bg-[#354326] text-white'
                  : 'border border-[#354326]/20 hover:bg-[#354326]/5'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}

        </div>

        {/* LISTA */}

        <div className="mt-8 space-y-5">

          {loading ? (

            <div className="py-20 text-center text-[#777B69]">
              Carregando oportunidades...
            </div>

          ) : visibleOpportunities.length === 0 ? (

            <div className="border border-dashed border-[#354326]/20 py-20 text-center">

              <Sprout size={30} className="mx-auto text-[#A68B5E]" />

              <h3 className="mt-5 text-xl font-medium">
                {activeTab === 'pending'
                  ? 'Tudo em dia por aqui!'
                  : 'Nenhuma oportunidade nesta categoria.'}
              </h3>

              <p className="mt-2 text-sm text-[#777B69]">
                {activeTab === 'pending'
                  ? 'Novas oportunidades aparecerão aqui para análise.'
                  : 'Quando houver registros, eles aparecerão aqui.'}
              </p>

            </div>

          ) : (

            visibleOpportunities.map((item) => (

              <article
                key={item.id}
                className="border border-[#354326]/15 bg-white p-6 md:p-8"
              >

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <span className="text-xs uppercase tracking-widest text-[#A68B5E]">
                    {item.category}
                  </span>

                  <span className={`rounded-full px-4 py-2 text-xs ${
                    item.status === 'pending'
                      ? 'bg-[#F5EBD8] text-[#8B6B35]'
                      : item.status === 'published'
                        ? 'bg-[#E7EDDF] text-[#526B3E]'
                        : 'bg-[#F4E6E1] text-[#A15D43]'
                  }`}>
                    {item.status === 'pending'
                      ? 'Em análise'
                      : item.status === 'published'
                        ? 'Publicada'
                        : 'Rejeitada'}
                  </span>

                </div>

                <h2 className="mt-5 text-2xl font-medium">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm text-[#A68B5E]">
                  {item.organization}
                </p>

                <p className="mt-5 whitespace-pre-line text-sm leading-7 text-[#777B69]">
                  {item.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#777B69]">

                  {item.location && (
                    <span className="flex items-center gap-2">
                      <MapPin size={14} />
                      {item.location}
                    </span>
                  )}

                  {item.deadline && (
                    <span className="flex items-center gap-2">
                      <Calendar size={14} />
                      Prazo: {item.deadline}
                    </span>
                  )}

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#A68B5E] hover:underline"
                    >
                      Ver link da oportunidade
                      <ExternalLink size={13} />
                    </a>
                  )}

                </div>

                {item.requirements && (
                  <div className="mt-6 border-t border-[#354326]/10 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-widest">
                      Requisitos
                    </p>

                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#777B69]">
                      {item.requirements}
                    </p>
                  </div>
                )}

                {/* AÇÕES */}

                {item.status === 'pending' && (

                  <div className="mt-8 flex flex-wrap gap-3 border-t border-[#354326]/10 pt-6">

                    <button
                      onClick={() => updateStatus(item.id, 'published')}
                      disabled={processing === item.id}
                      className="flex items-center gap-2 rounded-full bg-[#354326] px-6 py-3 text-sm text-white transition hover:bg-[#52643B] disabled:opacity-50"
                    >
                      <CheckCircle size={17} />
                      {processing === item.id
                        ? 'Processando...'
                        : 'Aprovar e publicar'}
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, 'rejected')}
                      disabled={processing === item.id}
                      className="flex items-center gap-2 rounded-full border border-[#A15D43]/40 px-6 py-3 text-sm text-[#A15D43] transition hover:bg-[#F4E6E1] disabled:opacity-50"
                    >
                      <XCircle size={17} />
                      Rejeitar
                    </button>

                  </div>

                )}

              </article>

            ))

          )}

        </div>

      </section>

    </main>
  )
}

export default AdminDashboard
