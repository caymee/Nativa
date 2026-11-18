
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  MapPin,
  GraduationCap,
  Globe2,
  Lightbulb,
  BookOpen,
  Menu,
  X,
  Sprout,
  LogOut,
  User,
  Plus
} from 'lucide-react'

import { opportunities } from '../data/opportunities.js'
import { supabase } from '../lib/supabase'

// CATEGORIAS
const categories = [
  { name: 'Bolsas de estudo', icon: GraduationCap, number: '01' },
  { name: 'Intercâmbios', icon: Globe2, number: '02' },
  { name: 'Cursos gratuitos', icon: BookOpen, number: '03' },
  { name: 'Inovação', icon: Lightbulb, number: '04' },
]

function Home() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [menuOpen, setMenuOpen] = useState(false)

  // CONTA DO USUÁRIO
  const [currentUser, setCurrentUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [signingOut, setSigningOut] = useState(false)

  // IDENTIFICAR USUÁRIO E TIPO DE CONTA
  useEffect(() => {
    let active = true

    async function loadAccount(session) {
      const user = session?.user ?? null

      if (!active) return

      setCurrentUser(user)

      if (!user) {
        setUserType(null)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        console.error('Erro ao identificar tipo de conta:', error)
        return
      }

      setUserType(data?.user_type ?? 'jovem')
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadAccount(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadAccount(session)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // NOME DO USUÁRIO
  const userName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email?.split('@')[0] ||
    'usuário'

  const firstName = userName.split(' ')[0]

  // SAIR DA CONTA
  async function handleLogout() {
    setSigningOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('Não foi possível sair da conta. Tente novamente.')
      setSigningOut(false)
      return
    }

    setCurrentUser(null)
    setUserType(null)
    setMenuOpen(false)
    setSigningOut(false)
  }

  // FILTRAR OPORTUNIDADES
  const filteredOpportunities = opportunities.filter((item) => {
    const matchesCategory =
      activeCategory === 'Todas' ||
      item.category === activeCategory

    const matchesSearch =
      `${item.title} ${item.description} ${item.category} ${item.location} ${item.organization}`
        .toLowerCase()
        .includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // SELECIONAR CATEGORIA
  function selectCategory(category) {
    setActiveCategory(category)

    document.getElementById('oportunidades')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  // LINK DA CONTA CONFORME O TIPO DE USUÁRIO
  const accountLink =
    userType === 'organizacao' ? '/painel' : '/minha-conta'

  return (
    <main className="min-h-screen bg-[#FAF9F4] text-[#354326]">

      {/* NAVBAR */}

      <nav className="relative z-20 flex items-center justify-between border-b border-[#354326]/10 px-6 py-5 md:px-14">

        <Link to="/" className="text-3xl font-semibold tracking-tight">
          nativa<span className="text-[#B68B58]">.</span>
        </Link>

        <div className="hidden items-center gap-9 text-sm md:flex">

          <a href="#inicio" className="hover:text-[#A68B5E]">
            Início
          </a>

          <a href="#explorar" className="hover:text-[#A68B5E]">
            Explorar
          </a>

          <a href="#oportunidades" className="hover:text-[#A68B5E]">
            Oportunidades
          </a>

          <a href="#sobre" className="hover:text-[#A68B5E]">
            Sobre
          </a>

        </div>

        {/* ÁREA DA CONTA - DESKTOP */}

        <div className="hidden items-center gap-3 md:flex">

          {currentUser ? (
            <>
              <Link
                to={accountLink}
                className="flex items-center gap-2 text-sm transition hover:text-[#A68B5E]"
              >
                <User size={17} />

                {userType === 'organizacao'
                  ? 'Minhas oportunidades'
                  : `Olá, ${firstName}!`}
              </Link>

              {userType === 'organizacao' && (
                <Link
                  to="/cadastrar-oportunidade"
                  className="rounded-full bg-[#354326] px-5 py-3 text-sm text-white transition hover:bg-[#52643B]"
                >
                  <Plus size={16} className="mr-2 inline" />
                  Cadastrar oportunidade
                </Link>
              )}

              <button
                onClick={handleLogout}
                disabled={signingOut}
                className="flex items-center gap-2 rounded-full border border-[#354326]/30 px-6 py-3 text-sm transition hover:bg-[#354326]/10 disabled:opacity-50"
              >
                <LogOut size={16} />
                {signingOut ? 'Saindo...' : 'Sair'}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-[#354326]/30 px-6 py-3 text-sm transition hover:bg-[#354326]/10"
              >
                Entrar
              </Link>

              <Link
                to="/login"
                className="rounded-full bg-[#354326] px-6 py-3 text-sm text-white transition hover:bg-[#52643B]"
              >
                Começar agora
              </Link>
            </>
          )}

        </div>

        {/* MENU MOBILE */}

        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-full flex w-full flex-col gap-5 border-b border-[#354326]/10 bg-[#FAF9F4] p-6 shadow-lg md:hidden">

            <a
              href="#inicio"
              onClick={() => setMenuOpen(false)}
            >
              Início
            </a>

            <a
              href="#explorar"
              onClick={() => setMenuOpen(false)}
            >
              Explorar
            </a>

            <a
              href="#oportunidades"
              onClick={() => setMenuOpen(false)}
            >
              Oportunidades
            </a>

            <a
              href="#sobre"
              onClick={() => setMenuOpen(false)}
            >
              Sobre
            </a>

            {currentUser ? (
              <>
                <div className="flex items-center gap-2 border-t border-[#354326]/10 pt-5 text-sm">
                  <User size={17} />
                  Olá, {firstName}!
                </div>

                <Link
                  to={accountLink}
                  onClick={() => setMenuOpen(false)}
                  className="font-medium"
                >
                  {userType === 'organizacao'
                    ? 'Minhas oportunidades'
                    : 'Minha conta'}
                </Link>

                {userType === 'organizacao' && (
                  <Link
                    to="/cadastrar-oportunidade"
                    onClick={() => setMenuOpen(false)}
                    className="font-medium text-[#A68B5E]"
                  >
                    <Plus size={17} className="mr-2 inline" />
                    Cadastrar oportunidade
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="flex items-center gap-2 text-left font-semibold text-[#A15D43]"
                >
                  <LogOut size={17} />
                  {signingOut ? 'Saindo...' : 'Sair da conta'}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="font-semibold text-[#354326]"
              >
                Entrar / Criar conta
              </Link>
            )}

          </div>
        )}

      </nav>

      {/* HERO */}

      <section
        id="inicio"
        className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:px-14 md:py-32"
      >

        <div>

          <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#8A8C65]">
            <span className="h-px w-10 bg-[#A68B5E]" />
            Novos caminhos começam aqui
          </div>

          <h1 className="max-w-2xl text-5xl font-medium leading-[1.12] tracking-[-0.045em] md:text-7xl">
            Seu lugar de origem não define até onde você pode chegar.
          </h1>

          <p className="mt-8 max-w-lg text-base leading-8 text-[#777B69] md:text-lg">
            A Nativa conecta jovens de comunidades rurais a oportunidades
            de educação, desenvolvimento e experiências que podem transformar
            seus futuros.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <a
              href="#explorar"
              className="flex items-center gap-4 rounded-full bg-[#354326] px-7 py-4 text-sm text-white transition hover:-translate-y-1"
            >
              Descobrir oportunidades
              <ArrowRight size={18} />
            </a>

            <a
              href="#sobre"
              className="flex items-center gap-2 px-5 py-4 text-sm"
            >
              Conheça a Nativa
              <ArrowUpRight size={17} />
            </a>

          </div>

          <div className="mt-16 flex items-center gap-3 text-xs uppercase tracking-widest text-[#92947F]">
            <Sprout size={19} />
            <span>Raízes fortes. Horizontes amplos.</span>
          </div>

        </div>

        {/* IMAGEM PRINCIPAL */}

        <div className="relative flex min-h-[400px] items-center justify-center md:min-h-[530px]">

          <div className="absolute inset-5 rounded-[48%] bg-[#E8E9D7]" />

          <div className="relative z-10 h-[400px] w-full max-w-md overflow-hidden rounded-t-[48%] rounded-b-2xl shadow-xl md:h-[510px]">

            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop&q=85"
              alt="Paisagem de campos verdes no interior"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#26351F]/70 via-transparent to-black/10" />

            <div className="absolute left-7 top-8 text-xs uppercase tracking-[0.2em] text-white">
              NATIVA / 001
            </div>

            <div className="absolute bottom-9 left-8 right-8 text-white">

              <span className="text-sm italic">
                O futuro começa
              </span>

              <h2 className="mt-3 text-4xl font-medium leading-tight md:text-5xl">
                Onde suas raízes estão.
              </h2>

              <div className="mt-6 border-t border-white/40 pt-4 text-xs">
                Raízes fortes. Horizontes amplos.
              </div>

            </div>

          </div>

          <div className="absolute -bottom-3 -left-2 z-20 rounded-full bg-[#F0D2AF] px-5 py-4 text-xs text-[#354326] shadow-lg md:-left-8">
            Feito para quem sonha além.
          </div>

        </div>

      </section>

      {/* CATEGORIAS */}

      <section
        id="explorar"
        className="bg-[#F0EFE6] px-6 py-24 md:px-14"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <span className="text-xs uppercase tracking-[0.2em] text-[#A68B5E]">
                Explore possibilidades
              </span>

              <h2 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
                Existem muitos caminhos.
              </h2>

              <p className="mt-4 max-w-lg leading-7 text-[#777B69]">
                Oportunidades para aprender, descobrir interesses e construir
                novas possibilidades.
              </p>

            </div>

            <span className="text-sm text-[#92947F]">
              04 categorias para começar
            </span>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {categories.map((category) => {
              const Icon = category.icon

              return (
                <button
                  key={category.name}
                  onClick={() => selectCategory(category.name)}
                  className="group flex min-h-64 flex-col justify-between border border-[#354326]/15 bg-[#FAF9F4] p-7 text-left transition hover:-translate-y-2 hover:bg-[#354326] hover:text-white"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xs opacity-50">
                      {category.number}
                    </span>

                    <Icon size={25} strokeWidth={1.4} />

                  </div>

                  <div>

                    <h3 className="text-2xl font-medium">
                      {category.name}
                    </h3>

                    <div className="mt-5 flex justify-end">
                      <ArrowUpRight size={21} />
                    </div>

                  </div>

                </button>
              )
            })}

          </div>

        </div>

      </section>

      {/* OPORTUNIDADES */}

      <section
        id="oportunidades"
        className="px-6 py-24 md:px-14"
      >

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

            <div>

              <span className="text-xs uppercase tracking-[0.2em] text-[#A68B5E]">
                Descubra algo novo
              </span>

              <h2 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
                Oportunidades em destaque.
              </h2>

            </div>

            <div className="flex w-full max-w-md items-center gap-3 border-b border-[#354326]/30 pb-3">

              <Search size={20} className="text-[#92947F]" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="O que você está procurando?"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#92947F]"
              />

            </div>

          </div>

          {/* FILTROS */}

          <div className="mt-10 flex flex-wrap gap-3">

            {['Todas', ...categories.map((item) => item.name)].map((category) => (

              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-5 py-2.5 text-xs transition ${
                  activeCategory === category
                    ? 'border-[#354326] bg-[#354326] text-white'
                    : 'border-[#354326]/20 hover:border-[#354326]'
                }`}
              >
                {category}
              </button>

            ))}

          </div>

          {/* CARDS */}

          <div className="mt-10 grid gap-5 md:grid-cols-2">

            {filteredOpportunities.map((item, index) => (

              <Link
                to={`/oportunidade/${item.id}`}
                key={item.id}
                className="group block border border-[#354326]/15 p-7 transition hover:-translate-y-1 hover:border-[#A68B5E]"
              >

                <div className="flex justify-between">

                  <span className="text-xs uppercase tracking-widest text-[#A68B5E]">
                    {item.organization}
                  </span>

                  <span className="text-xs text-[#92947F]">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                </div>

                <h3 className="mt-8 text-2xl font-medium">
                  {item.title}
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-[#777B69]">
                  {item.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#354326]/10 pt-5">

                  <div className="flex flex-wrap gap-4 text-xs text-[#777B69]">

                    <span>{item.category}</span>

                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {item.location}
                    </span>

                  </div>

                  <ArrowUpRight size={20} />

                </div>

              </Link>

            ))}

          </div>

          {filteredOpportunities.length === 0 && (

            <div className="py-20 text-center text-[#777B69]">
              Nenhuma oportunidade encontrada. Tente outra busca.
            </div>

          )}

          <p className="mt-6 text-xs text-[#92947F]">
            Conteúdos demonstrativos para desenvolvimento da plataforma.
          </p>

        </div>

      </section>

      {/* SOBRE A NATIVA */}

      <section
        id="sobre"
        className="bg-[#354326] px-6 py-24 text-[#FAF9F4] md:px-14 md:py-32"
      >

        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">

          <div>

            <span className="text-xs uppercase tracking-[0.2em] text-[#D0B17A]">
              Nossa essência
            </span>

            <h2 className="mt-6 text-5xl font-medium leading-tight tracking-tight md:text-6xl">
              De onde você vem faz parte da sua história. Não do seu limite.
            </h2>

          </div>

          <div>

            <p className="text-lg leading-9 text-white/70">
              Acreditamos que talento e potencial existem em todos os lugares.
              Mas nem sempre as oportunidades chegam até quem mais precisa
              conhecê-las.
            </p>

            <p className="mt-6 text-lg leading-9 text-white/70">
              A Nativa nasce para aproximar jovens de comunidades rurais
              de experiências que ampliem seus horizontes, sem que precisem
              deixar suas raízes para trás.
            </p>

            <a
              href="#inicio"
              className="mt-10 inline-flex items-center gap-3 text-sm text-[#D0B17A]"
            >
              Voltar ao início
              <ArrowUpRight size={18} />
            </a>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="flex flex-col justify-between gap-5 bg-[#FAF9F4] px-6 py-8 text-sm text-[#777B69] md:flex-row md:items-center md:px-14">

        <span className="text-2xl font-semibold tracking-tight text-[#354326]">
          nativa<span className="text-[#B68B58]">.</span>
        </span>

        <span>
          Oportunidades não deveriam ter CEP.
        </span>

        <span>
          © 2026 Nativa
        </span>

      </footer>

    </main>
  )
}

export default Home
