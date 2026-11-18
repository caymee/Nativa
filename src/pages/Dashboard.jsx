
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sprout,
  User,
  Mail,
  GraduationCap,
  Compass,
  LogOut,
  ArrowRight,
  Heart,
  Trash2,
  MapPin
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import { opportunities } from '../data/opportunities'

function Dashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [savedOpportunities, setSavedOpportunities] = useState([])
  const [loading, setLoading] = useState(true)

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
          .select('full_name, user_type, organization_name, created_at')
          .eq('id', user.id)
          .maybeSingle()

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError)
      }

      setProfile({
        ...profileData,
        email: user.email,
        full_name:
          profileData?.full_name ||
          user.user_metadata?.full_name ||
          'Usuário',
      })

      const { data: savedData, error: savedError } =
        await supabase
          .from('saved_opportunities')
          .select('opportunity_id')
          .eq('user_id', user.id)

      if (savedError) {
        console.error('Erro ao carregar favoritos:', savedError)
      } else {
        const favorites = (savedData || [])
          .map((saved) =>
            opportunities.find(
              (item) => item.id === Number(saved.opportunity_id)
            )
          )
          .filter(Boolean)

        setSavedOpportunities(favorites)
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

  async function removeFavorite(opportunityId) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { error } = await supabase
      .from('saved_opportunities')
      .delete()
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId)

    if (error) {
      console.error('Erro ao remover favorito:', error)
      alert('Não foi possível remover a oportunidade.')
      return
    }

    setSavedOpportunities((previous) =>
      previous.filter((item) => item.id !== opportunityId)
    )
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F4] text-[#354326]">
        Carregando sua conta...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF9F4] text-[#354326]">

      {/* NAVBAR */}

      <nav className="flex items-center justify-between border-b border-[#354326]/10 px-6 py-5 md:px-14">

        <Link to="/" className="text-3xl font-semibold">
          nativa<span className="text-[#B68B58]">.</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm transition hover:text-[#A15D43]"
        >
          <LogOut size={17} />
          Sair
        </button>

      </nav>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-14">

        {/* BOAS-VINDAS */}

        <span className="text-xs uppercase tracking-[0.2em] text-[#A68B5E]">
          SUA ÁREA PESSOAL
        </span>

        <h1 className="mt-5 text-4xl font-medium md:text-6xl">
          Olá, {profile?.full_name?.split(' ')[0]}!
        </h1>

        <p className="mt-5 max-w-xl leading-8 text-[#777B69]">
          Este é o seu espaço na Nativa. Explore oportunidades,
          descubra novos caminhos e acompanhe sua jornada.
        </p>

        {/* MEU PERFIL */}

        <div className="mt-12 border border-[#354326]/15 bg-white p-7 md:p-10">

          <div className="flex items-center gap-3">
            <User size={22} />
            <h2 className="text-2xl font-medium">
              Meu perfil
            </h2>
          </div>

          <div className="mt-8 grid gap-7 md:grid-cols-2">

            <div>
              <span className="text-xs uppercase tracking-widest text-[#A68B5E]">
                Nome completo
              </span>
              <p className="mt-2 text-lg">
                {profile?.full_name}
              </p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#A68B5E]">
                E-mail
              </span>
              <p className="mt-2 flex items-center gap-2 text-lg">
                <Mail size={17} />
                {profile?.email}
              </p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#A68B5E]">
                Tipo de conta
              </span>
              <p className="mt-2 flex items-center gap-2 text-lg">
                <GraduationCap size={19} />
                {profile?.user_type === 'organizacao'
                  ? 'Organização'
                  : 'Jovem'}
              </p>
            </div>

          </div>
        </div>

        {/* FAVORITOS */}

        <section className="mt-16">

          <div className="flex items-center gap-3">
            <Heart size={25} />
            <h2 className="text-3xl font-medium">
              Minhas oportunidades salvas
            </h2>
          </div>

          <p className="mt-3 text-[#777B69]">
            Oportunidades que você guardou para consultar depois.
          </p>

          {savedOpportunities.length === 0 ? (

            <div className="mt-8 border border-[#354326]/15 bg-white p-10 text-center">

              <Heart size={35} className="mx-auto text-[#A68B5E]" />

              <h3 className="mt-5 text-xl font-medium">
                Sua lista está vazia.
              </h3>

              <p className="mt-3 text-sm text-[#777B69]">
                Quando encontrar uma oportunidade interessante,
                clique em "Salvar oportunidade" para guardá-la aqui.
              </p>

              <Link
                to="/explorar"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#354326] px-6 py-3 text-sm text-white"
              >
                Explorar oportunidades
                <ArrowRight size={17} />
              </Link>

            </div>

          ) : (

            <div className="mt-8 grid gap-5 md:grid-cols-2">

              {savedOpportunities.map((opportunity) => (

                <article
                  key={opportunity.id}
                  className="flex flex-col justify-between border border-[#354326]/15 bg-white p-7"
                >

                  <div>

                    <span className="text-xs uppercase tracking-widest text-[#A68B5E]">
                      {opportunity.category}
                    </span>

                    <h3 className="mt-4 text-2xl font-medium">
                      {opportunity.title}
                    </h3>

                    <p className="mt-2 text-sm text-[#777B69]">
                      {opportunity.organization}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-sm text-[#777B69]">
                      <MapPin size={16} />
                      {opportunity.location}
                    </div>

                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4">

                    <Link
                      to={`/oportunidade/${opportunity.id}`}
                      className="flex items-center gap-2 text-sm font-medium text-[#354326] hover:text-[#A68B5E]"
                    >
                      Ver oportunidade
                      <ArrowRight size={17} />
                    </Link>

                    <button
                      onClick={() => removeFavorite(opportunity.id)}
                      className="flex items-center gap-2 text-sm text-[#A15D43] transition hover:opacity-70"
                    >
                      <Trash2 size={17} />
                      Remover
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* EXPLORAR OPORTUNIDADES */}

        <div className="mt-16 grid gap-5 md:grid-cols-2">

          <div className="flex flex-col justify-between bg-[#354326] p-8 text-white">

            <div>
              <Compass size={28} className="text-[#D0B17A]" />

              <h2 className="mt-8 text-3xl font-medium">
                Descubra oportunidades.
              </h2>

              <p className="mt-4 leading-7 text-white/70">
                Encontre bolsas, intercâmbios, cursos gratuitos
                e experiências para ampliar seus horizontes.
              </p>
            </div>

            <Link
              to="/explorar"
              className="mt-8 flex items-center gap-3 text-sm text-[#D0B17A]"
            >
              Explorar agora
              <ArrowRight size={18} />
            </Link>

          </div>

          <div className="flex flex-col justify-between border border-[#354326]/15 bg-[#F0EFE6] p-8">

            <div>
              <Sprout size={28} />

              <h2 className="mt-8 text-3xl font-medium">
                Sua jornada começa aqui.
              </h2>

              <p className="mt-4 leading-7 text-[#777B69]">
                Acompanhe as novidades da Nativa e encontre
                caminhos que combinam com seus objetivos.
              </p>
            </div>

            <Link
              to="/"
              className="mt-8 flex items-center gap-3 text-sm"
            >
              Voltar à página inicial
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-[#354326]/10 px-6 py-8 text-center text-sm text-[#777B69]">
        © 2026 Nativa · Oportunidades não deveriam ter CEP.
      </footer>

    </main>
  )
}

export default Dashboard
