
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  GraduationCap,
  ArrowUpRight,
  Sprout
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const categories = [
  'Todas',
  'Bolsas de estudo',
  'Intercâmbios',
  'Cursos gratuitos',
  'Inovação'
]

function Explore() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOpportunities() {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar oportunidades:', error)
        setError('Não foi possível carregar as oportunidades.')
      } else {
        setOpportunities(data || [])
      }

      setLoading(false)
    }

    loadOpportunities()
  }, [])

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesCategory =
      activeCategory === 'Todas' ||
      opportunity.category === activeCategory

    const searchText = search.toLowerCase()

    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchText) ||
      opportunity.organization.toLowerCase().includes(searchText) ||
      (opportunity.location || '').toLowerCase().includes(searchText)

    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-[#FAF9F4] text-[#354326]">

      <nav className="flex items-center justify-between border-b border-[#354326]/10 px-6 py-5 md:px-14">
        <Link to="/" className="text-3xl font-semibold">
          nativa<span className="text-[#B68B58]">.</span>
        </Link>

        <Link to="/minha-conta" className="text-sm hover:text-[#A68B5E]">
          Minha conta
        </Link>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-14">

        <span className="text-xs uppercase tracking-[0.2em] text-[#A68B5E]">
          DESCUBRA NOVOS CAMINHOS
        </span>

        <h1 className="mt-5 text-4xl font-medium md:text-6xl">
          Explorar oportunidades
        </h1>

        <p className="mt-5 max-w-xl leading-8 text-[#777B69]">
          Encontre oportunidades que combinam com você.
          Seu próximo passo pode começar aqui.
        </p>

        {/* PESQUISA */}

        <div className="mt-10 flex max-w-2xl items-center gap-3 border border-[#354326]/20 bg-white px-5 py-4">
          <Search size={20} className="text-[#A68B5E]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busque por oportunidade, instituição ou local..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {/* CATEGORIAS */}

        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 py-3 text-sm transition ${
                activeCategory === category
                  ? 'bg-[#354326] text-white'
                  : 'border border-[#354326]/20 hover:bg-[#354326]/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* RESULTADOS */}

        <div className="mt-14 flex items-center justify-between">
          <h2 className="text-2xl font-medium">
            Oportunidades disponíveis
          </h2>

          <span className="text-sm text-[#777B69]">
            {filteredOpportunities.length} resultados
          </span>
        </div>

        {loading ? (
          <p className="mt-10 text-[#777B69]">
            Carregando oportunidades...
          </p>
        ) : error ? (
          <p className="mt-10 text-[#A15D43]">{error}</p>
        ) : filteredOpportunities.length === 0 ? (

          <div className="mt-10 border border-[#354326]/15 bg-white px-6 py-16 text-center">
            <Sprout size={35} className="mx-auto text-[#A68B5E]" />

            <h3 className="mt-5 text-2xl font-medium">
              Ainda estamos cultivando oportunidades.
            </h3>

            <p className="mx-auto mt-3 max-w-md leading-7 text-[#777B69]">
              Ainda não encontramos oportunidades nesta categoria.
              Volte em breve para descobrir novidades!
            </p>

            {search || activeCategory !== 'Todas' ? (
              <button
                onClick={() => {
                  setSearch('')
                  setActiveCategory('Todas')
                }}
                className="mt-6 text-sm underline"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>

        ) : (

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredOpportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="flex flex-col justify-between border border-[#354326]/15 bg-white p-7 transition hover:-translate-y-1 hover:shadow-md"
              >

                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A68B5E]">
                    {opportunity.category}
                  </span>

                  <h3 className="mt-5 text-2xl font-medium">
                    {opportunity.title}
                  </h3>

                  <p className="mt-3 text-sm text-[#777B69]">
                    {opportunity.organization}
                  </p>

                  <div className="mt-7 space-y-3 text-sm text-[#777B69]">

                    <div className="flex items-center gap-2">
                      <MapPin size={17} />
                      {opportunity.location || 'Local não informado'}
                    </div>

                    <div className="flex items-center gap-2">
                      <GraduationCap size={17} />
                      {opportunity.modality || 'Modalidade não informada'}
                    </div>

                  </div>
                </div>

                <Link
                  to={`/oportunidade/${opportunity.id}`}
                  className="mt-8 flex items-center justify-between border-t border-[#354326]/10 pt-5 text-sm font-medium"
                >
                  Conhecer oportunidade
                  <ArrowUpRight size={19} />
                </Link>

              </article>
            ))}

          </div>

        )}

      </section>

      <footer className="border-t border-[#354326]/10 px-6 py-8 text-center text-sm text-[#777B69]">
        © 2026 Nativa · Oportunidades não deveriam ter CEP.
      </footer>

    </main>
  )
}

export default Explore
