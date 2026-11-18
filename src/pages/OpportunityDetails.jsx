
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { opportunities } from '../data/opportunities'
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  ExternalLink,
  Heart
} from 'lucide-react'
import { supabase } from '../lib/supabase'

function OpportunityDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const opportunity = opportunities.find(
    (item) => item.id === Number(id)
  )

  useEffect(() => {
    async function loadFavorite() {
      const { data: { user } } = await supabase.auth.getUser()

      setUser(user)

      if (user && opportunity) {
        const { data, error } = await supabase
          .from('saved_opportunities')
          .select('id')
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunity.id)
          .maybeSingle()

        if (error) {
          console.error('Erro ao verificar favorito:', error)
        }

        setSaved(!!data)
      }

      setLoading(false)
    }

    loadFavorite()
  }, [opportunity])

  async function toggleFavorite() {
    if (!user) {
      navigate('/login')
      return
    }

    setSaving(true)

    if (saved) {
      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunity.id)

      if (error) {
        alert('Não foi possível remover dos favoritos.')
        console.error(error)
      } else {
        setSaved(false)
      }
    } else {
      const { error } = await supabase
        .from('saved_opportunities')
        .insert({
          user_id: user.id,
          opportunity_id: opportunity.id
        })

      if (error) {
        alert('Não foi possível salvar a oportunidade.')
        console.error(error)
      } else {
        setSaved(true)
      }
    }

    setSaving(false)
  }

  if (!opportunity) {
    return (
      <main className="min-h-screen bg-[#FAF9F4] p-10">
        <h1>Oportunidade não encontrada.</h1>
        <Link to="/">Voltar ao início</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF9F4] px-6 py-12 text-[#354326] md:px-14">
      <div className="mx-auto max-w-4xl">

        <Link to="/" className="inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={18} />
          Voltar às oportunidades
        </Link>

        <span className="mt-16 block text-xs uppercase tracking-widest text-[#A68B5E]">
          {opportunity.category}
        </span>

        <h1 className="mt-5 text-4xl font-medium md:text-6xl">
          {opportunity.title}
        </h1>

        <p className="mt-5 text-[#777B69]">
          {opportunity.organization}
        </p>

        <button
          onClick={toggleFavorite}
          disabled={loading || saving}
          className={`mt-7 inline-flex items-center gap-3 rounded-full border px-6 py-3 transition ${
            saved
              ? 'border-[#A68B5E] bg-[#A68B5E]/10 text-[#354326]'
              : 'border-[#354326]/30 hover:bg-[#354326]/5'
          }`}
        >
          <Heart
            size={19}
            fill={saved ? 'currentColor' : 'none'}
          />
          {loading
            ? 'Carregando...'
            : saving
              ? 'Salvando...'
              : saved
                ? 'Salvo nos favoritos'
                : 'Salvar oportunidade'}
        </button>

        <div className="mt-10 border-y border-[#354326]/15 py-8">
          <p className="leading-8">
            {opportunity.description}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">

            <div className="flex items-center gap-3">
              <MapPin />
              <span>{opportunity.location}</span>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap />
              <span>{opportunity.modality}</span>
            </div>

          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-medium">Requisitos</h2>
          <p className="mt-4 leading-7 text-[#777B69]">
            {opportunity.requirements}
          </p>

          <h2 className="mt-10 text-2xl font-medium">
            Prazo de inscrição
          </h2>

          <p className="mt-4 text-[#777B69]">
            {opportunity.deadline || 'Prazo não informado'}
          </p>
        </section>

        {opportunity.link !== '#' && (
          <a
            href={opportunity.link}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#354326] px-7 py-4 text-white"
          >
            Acessar oportunidade
            <ExternalLink size={18} />
          </a>
        )}

      </div>
    </main>
  )
}

export default OpportunityDetails
