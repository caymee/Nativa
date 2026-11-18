
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Sprout } from 'lucide-react'
import { supabase } from '../lib/supabase'

function CreateOpportunity() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    title: '',
    organization: '',
    category: 'Bolsas de estudo',
    location: '',
    modality: 'Online',
    description: '',
    requirements: '',
    deadline: '',
    link: ''
  })

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      navigate('/login')
      return
    }

    const { error } = await supabase
      .from('opportunities')
      .insert({
        ...form,
        created_by: user.id,
        status: 'pending'
      })

    if (error) {
      console.error('Erro ao cadastrar oportunidade:', error)
      setMessage('Não foi possível enviar. Tente novamente.')
    } else {
      setMessage('Oportunidade enviada para análise com sucesso!')
      setForm({
        title: '',
        organization: '',
        category: 'Bolsas de estudo',
        location: '',
        modality: 'Online',
        description: '',
        requirements: '',
        deadline: '',
        link: ''
      })
    }

    setLoading(false)
  }

  const inputStyle =
    'mt-2 w-full border border-[#354326]/20 bg-white px-4 py-3 outline-none focus:border-[#A68B5E]'

  return (
    <main className="min-h-screen bg-[#FAF9F4] text-[#354326]">

      <nav className="border-b border-[#354326]/10 px-6 py-5 md:px-14">
        <Link to="/" className="text-3xl font-semibold">
          nativa<span className="text-[#B68B58]">.</span>
        </Link>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-14">

        <Link to="/minha-conta" className="flex items-center gap-2 text-sm">
          <ArrowLeft size={17} />
          Voltar à minha conta
        </Link>

        <Sprout size={32} className="mt-12 text-[#A68B5E]" />

        <h1 className="mt-5 text-4xl font-medium md:text-5xl">
          Compartilhe uma oportunidade.
        </h1>

        <p className="mt-5 leading-8 text-[#777B69]">
          Ajude jovens a descobrir novos caminhos.
          Preencha as informações abaixo para divulgar uma oportunidade.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-7">

          <div>
            <label className="text-sm font-medium">Nome da oportunidade *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ex.: Bolsa de estudos internacional"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Organização responsável *</label>
            <input
              name="organization"
              value={form.organization}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Nome da instituição"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">

            <div>
              <label className="text-sm font-medium">Categoria *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>Bolsas de estudo</option>
                <option>Intercâmbios</option>
                <option>Cursos gratuitos</option>
                <option>Inovação</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Modalidade</label>
              <select
                name="modality"
                value={form.modality}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>Online</option>
                <option>Presencial</option>
                <option>Híbrida</option>
              </select>
            </div>

          </div>

          <div>
            <label className="text-sm font-medium">Localização</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ex.: Brasil, Estados Unidos ou Online"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={inputStyle}
              rows={5}
              placeholder="Conte sobre a oportunidade..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Requisitos</label>
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              className={inputStyle}
              rows={4}
              placeholder="Quem pode participar?"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Prazo de inscrição</label>
            <input
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ex.: 30 de novembro de 2026"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Link oficial</label>
            <input
              name="link"
              type="url"
              value={form.link}
              onChange={handleChange}
              className={inputStyle}
              placeholder="https://..."
            />
          </div>

          {message && (
            <p className="border border-[#354326]/15 bg-white p-4 text-sm">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 bg-[#354326] px-7 py-4 text-white transition hover:bg-[#4A5A38] disabled:opacity-50"
          >
            <Send size={18} />
            {loading ? 'Enviando...' : 'Enviar para aprovação'}
          </button>

          <p className="text-center text-xs text-[#777B69]">
            Sua oportunidade ficará pendente até ser aprovada.
          </p>

        </form>

      </section>
    </main>
  )
}

export default CreateOpportunity
