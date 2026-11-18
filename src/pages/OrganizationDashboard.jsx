
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sprout,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  ArrowUpRight
} from 'lucide-react'
import { supabase } from '../lib/supabase'

function OrganizationDashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser()

      if (userError || !user) {
        navigate('/login')
        return
      }

      const { data: profileData, error: profileError } =
        await supabase
          .from('profiles')
          .select('full_name, user_type, organization_name')
          .eq('id', user.id)
          .maybeSingle()

      if (profileError || profileData?.user_type !== 'organizacao') {
        navigate('/')
        return
      }

      setProfile(profileData)

      const { data, error: opportunitiesError } =
        await supabase
          .from('opportunities')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

      if (opportunitiesError) {
        console.error(opportunitiesError)
        setError('Não foi possível carregar suas oportunidades.')
      } else {
        setOpportunities(data || [])
      }

      setLoading(false)
    }

    loadDashboard()
  }, [navigate])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('Não foi possível sair da conta.')
      return
    }

    navigate('/login')
  }

  const pending = opportunities.filter(
    (item) => item.status === 'pending'
  ).length

  const published = opportunities.filter(
    (item) => item.status === 'published'
  ).length

  const rejected = opportunities.filter(
    (item) => item.status === 'rejected'
  ).length

  const statusInfo = {
    pending: {
      label: 'Em análise',
      icon: Clock,
      color: 'text-amber-700',
      background: 'bg-amber-50'
    },
    published: {
      label: 'Publicada',
      icon: CheckCircle,
      color: 'text-green-700',
      background: 'bg-green-50'
    },
    rejected: {
      label: 'Recusada',
      icon: XCircle,
      color: 'text-red-700',
      background: 'bg-red-50'
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F4] text-[#354326]">
        Carregando painel...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF9F4] text-[#354326]">

      <nav className="flex items-center justify-between border-b border-[#354326]/10 px-6 py-5 md:px-14">
        <Link to="/" className="text-3xl font-semibold">
          nativa<span className="text-[#B68B58]">.</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm hover:text-[#A15D43]"
        >
          <LogOut size={17} />
          Sair
        </button>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-14">

        <span className="text-xs uppercase tracking-[0.2em] text-[#A68B5E]">
          PAINEL DA ORGANIZAÇÃO
        </span>

        <h1 className="mt-5 text-4xl font-medium md:text-6xl">
          Olá, {profile?.organization_name || profile?.full_name}!
        </h1>

        <p className="mt-5 max-w-xl leading-8 text-[#777B69]">
          Acompanhe suas oportunidades e conecte sua organização
          a jovens que estão buscando novos caminhos.
        </p>

        <Link
          to="/cadastrar-oportunidade"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#354326] px-7 py-4 text-sm text-white transition hover:bg-[#52643B]"
        >
          <Plus size={19} />
          Cadastrar oportunidade
        </Link>

        {/* INDICADORES */}

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {[
            {
              label: 'Total enviadas',
              value: opportunities.length,
              icon: FileText
            },
            {
              label: 'Em análise',
              value: pending,
              icon: Clock
            },
            {
              label: 'Publicadas',
              value: published,
              icon: CheckCircle
            },
            {
              label: 'Recusadas',
              value: rejected,
              icon: XCircle
            }
          ].map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="border border-[#354326]/15 bg-white p-6"
              >
                <Icon size={23} className="text-[#A68B5E]" />

                <p className="mt-6 text-3xl font-medium">
                  {item.value}
                </p>

                <p className="mt-2 text-sm text-[#777B69]">
                  {item.label}
                </p>
              </div>
            )
          })}

        </div>

        {/* LISTA DE OPORTUNIDADES */}

        <section className="mt-16">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-medium">
                Minhas oportunidades
              </h2>

              <p className="mt-2 text-sm text-[#777B69]">
                Acompanhe os cadastros da sua organização.
              </p>
            </div>
          </div>

          {error ? (
            <p className="mt-8 text-[#A15D43]">{error}</p>
          ) : opportunities.length === 0 ? (

            <div className="mt-8 border border-[#354326]/15 bg-white px-6 py-14 text-center">
              <Sprout size={35} className="mx-auto text-[#A68B5E]" />

              <h3 className="mt-5 text-2xl font-medium">
                Sua primeira oportunidade começa aqui.
              </h3>

              <p className="mt-3 text-sm text-[#777B69]">
                Você ainda não cadastrou nenhuma oportunidade.
              </p>

              <Link
                to="/cadastrar-oportunidade"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#A68B5E]"
              >
                Cadastrar agora
                <ArrowUpRight size={17} />
              </Link>
            </div>

          ) : (

            <div className="mt-8 space-y-4">

              {opportunities.map((opportunity) => {
                const status = statusInfo[opportunity.status]
                const StatusIcon = status.icon

                return (
                  <article
                    key={opportunity.id}
                    className="border border-[#354326]/15 bg-white p-6 md:p-8"
                  >
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                      <div>
                        <span className="text-xs uppercase tracking-widest text-[#A68B5E]">
                          {opportunity.category}
                        </span>

                        <h3 className="mt-3 text-xl font-medium">
                          {opportunity.title}
                        </h3>

                        <p className="mt-2 text-sm text-[#777B69]">
                          {opportunity.organization}
                        </p>
                      </div>

                      <div className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm ${status.background} ${status.color}`}>
                        <StatusIcon size={16} />
                        {status.label}
                      </div>

                    </div>
                  </article>
                )
              })}

            </div>

          )}

        </section>

      </section>

      <footer className="border-t border-[#354326]/10 px-6 py-8 text-center text-sm text-[#777B69]">
        © 2026 Nativa · Oportunidades não deveriam ter CEP.
      </footer>

    </main>
  )
}

export default OrganizationDashboard
