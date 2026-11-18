
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sprout } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Login() {
  const navigate = useNavigate()

  const [userType, setUserType] = useState('jovem')
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              user_type: userType,
              organization_name:
                userType === 'organizacao'
                  ? organization.trim()
                  : null,
            },
          },
        })

        if (error) throw error

        if (!data.user) {
          throw new Error('Não foi possível criar sua conta.')
        }

        if (!data.session) {
          setSuccess(true)
          setMessage(
            'Conta criada! Verifique seu e-mail para confirmar o cadastro. Depois, faça login.'
          )
          return
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: name.trim(),
            user_type: userType,
            organization_name:
              userType === 'organizacao'
                ? organization.trim()
                : null,
          })

        if (profileError) throw profileError

        navigate(userType === 'organizacao' ? '/painel' : '/')
        console.log('Tipo de conta encontrado:', profile.user_type)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          throw new Error(
            'Não encontramos seu perfil. Entre em contato com o suporte.'
          )
        }

        navigate(
          profile.user_type === 'organizacao' ? '/painel' : '/'
        )
      }

    } catch (error) {
      setMessage(error.message || 'Não foi possível realizar a operação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F4] text-[#354326]">
      <nav className="flex justify-between border-b border-[#354326]/10 px-6 py-5 md:px-14">
        <Link to="/" className="text-3xl font-semibold">
          nativa<span className="text-[#B68B58]">.</span>
        </Link>

        <Link to="/" className="flex items-center gap-2 text-sm">
          <ArrowLeft size={17} /> Início
        </Link>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-16 md:grid-cols-2 md:px-14">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#A68B5E]">
            SUA JORNADA COMEÇA AQUI
          </span>

          <h1 className="mt-6 text-5xl font-medium leading-tight md:text-6xl">
            Novas possibilidades começam com uma conexão.
          </h1>

          <p className="mt-6 leading-8 text-[#777B69]">
            Entre na Nativa e descubra oportunidades ou conecte sua
            organização a jovens que estão construindo novos caminhos.
          </p>

          <div className="mt-10 flex items-center gap-3 text-sm text-[#92947F]">
            <Sprout size={22} />
            Raízes fortes. Horizontes amplos.
          </div>
        </div>

        <div className="border border-[#354326]/15 bg-white p-7 shadow-sm md:p-10">
          <h2 className="text-3xl font-medium">
            {isRegister ? 'Crie sua conta.' : 'Bem-vindo de volta.'}
          </h2>

          <p className="mt-3 text-sm text-[#777B69]">
            {isRegister ? 'Faça parte da Nativa.' : 'Acesse sua conta.'}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { id: 'jovem', label: 'Sou jovem' },
              { id: 'organizacao', label: 'Sou organização' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setUserType(type.id)}
                className={`border p-5 text-sm transition ${
                  userType === type.id
                    ? 'border-[#354326] bg-[#F0EFE6]'
                    : 'border-[#354326]/15'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isRegister && (
              <>
                <div>
                  <label className="mb-2 block text-sm">
                    Nome completo
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-[#354326]/20 bg-[#FAF9F4] px-4 py-3 outline-none"
                    placeholder="Seu nome"
                  />
                </div>

                {userType === 'organizacao' && (
                  <div>
                    <label className="mb-2 block text-sm">
                      Nome da organização
                    </label>
                    <input
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full border border-[#354326]/20 bg-[#FAF9F4] px-4 py-3 outline-none"
                      placeholder="Nome da instituição"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="mb-2 block text-sm">E-mail</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#354326]/20 bg-[#FAF9F4] px-4 py-3 outline-none"
                placeholder="seuemail@email.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">Senha</label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#354326]/20 bg-[#FAF9F4] px-4 py-3 outline-none"
                placeholder="Mínimo de 8 caracteres"
              />
            </div>

            {message && (
              <p
                className={`text-sm ${
                  success ? 'text-green-700' : 'text-[#A15D43]'
                }`}
                role="alert"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#354326] py-4 text-sm text-white transition hover:bg-[#52643B] disabled:opacity-50"
            >
              {loading
                ? 'Aguarde...'
                : isRegister
                  ? 'Criar conta'
                  : 'Entrar'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 border-t border-[#354326]/10 pt-6 text-center text-sm">
            <span className="text-[#777B69]">
              {isRegister
                ? 'Já possui uma conta?'
                : 'Ainda não possui conta?'}
            </span>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setMessage('')
                setSuccess(false)
              }}
              className="ml-2 font-semibold text-[#A68B5E]"
            >
              {isRegister ? 'Entrar' : 'Criar conta'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
