import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import NavBar from '@/components/NavBar'

export default async function InfoPage() {
  const session = await getSession()
  if (!session) redirect('/')

  return (
    <div className="min-h-screen">
      <NavBar userName={session.name} />

      <div className="border-b border-field-light/30" style={{ background: 'linear-gradient(180deg,#0a1f10,#050e08)' }}>
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-black text-white">Reglas y Puntuación</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cómo funciona la Quiniela Mundial 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Cómo jugar */}
        <div className="card">
          <h2 className="text-lg font-black text-gold mb-4 flex items-center gap-2">⚽ ¿Cómo funciona?</h2>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>La quiniela tiene <span className="text-white font-semibold">3 secciones</span> donde puedes sumar puntos:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {[
                { icon: '📋', title: 'Partidos', desc: 'Predice el marcador exacto de cada partido de fase de grupos y eliminatorias' },
                { icon: '📊', title: 'Posiciones', desc: 'Se calculan automáticamente desde tus predicciones de marcadores' },
                { icon: '🏆', title: 'Eliminatoria', desc: 'Elige quién avanza en cada ronda del bracket desde Octavos hasta la Final' },
              ].map(s => (
                <div key={s.title} className="bg-field-dark rounded-xl p-4 border border-field-light/30">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-bold text-white mb-1">{s.title}</div>
                  <div className="text-xs text-gray-400">{s.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2">
              ⏰ Las predicciones se <span className="text-white">bloquean automáticamente</span> al inicio del torneo. No se pueden modificar después.
            </p>
          </div>
        </div>

        {/* Puntos fase de grupos */}
        <div className="card">
          <h2 className="text-lg font-black text-gold mb-4 flex items-center gap-2">📋 Fase de Grupos — Predicción de Marcadores</h2>
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-field-light/40">
              {[
                { pts: '+2 pts', label: 'Resultado correcto', desc: 'Aciertas si gana el mismo equipo (o empate)', color: 'text-blue-300' },
                { pts: '+3 pts', label: 'Marcador exacto', desc: 'Aciertas el score exacto (ej. 2-1). Reemplaza los 2 pts.', color: 'text-gold' },
              ].map((row, i) => (
                <div key={i} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-field-light/30' : ''}`}>
                  <span className={`font-black text-lg w-20 shrink-0 ${row.color}`}>{row.pts}</span>
                  <div>
                    <div className="font-semibold text-white text-sm">{row.label}</div>
                    <div className="text-xs text-gray-500">{row.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-field-dark rounded-xl p-4 border border-field-light/20 text-sm text-gray-400">
              <p><span className="text-white font-semibold">Ejemplo:</span> El partido termina 2-1. Si predijiste 1-0 → <span className="text-blue-300">+2 pts</span> (acertaste que ganó ese equipo). Si predijiste 2-1 → <span className="text-gold">+3 pts</span> (marcador exacto).</p>
            </div>
          </div>
        </div>

        {/* Puntos posiciones */}
        <div className="card">
          <h2 className="text-lg font-black text-gold mb-4 flex items-center gap-2">📊 Posiciones de Grupo</h2>
          <p className="text-sm text-gray-400 mb-3">Las posiciones se derivan automáticamente de tus predicciones de marcadores. Los puntos se otorgan por cada posición que aciertes:</p>
          <div className="overflow-hidden rounded-xl border border-field-light/40">
            {[
              { pts: '+4 pts', label: '1er lugar del grupo', color: 'text-gold' },
              { pts: '+3 pts', label: '2do lugar del grupo', color: 'text-gray-200' },
              { pts: '+2 pts', label: '3er lugar (mejor tercero que avanza)', color: 'text-yellow-600' },
            ].map((row, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-field-light/30' : ''}`}>
                <span className={`font-black text-lg w-20 shrink-0 ${row.color}`}>{row.pts}</span>
                <span className="font-semibold text-white text-sm">{row.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            En el Mundial 2026, los <span className="text-white">8 mejores terceros</span> de 12 grupos avanzan. Los puntos del 3er lugar solo aplican para esos 8.
          </p>
        </div>

        {/* Puntos eliminatoria */}
        <div className="card">
          <h2 className="text-lg font-black text-gold mb-4 flex items-center gap-2">🏆 Eliminatoria — Bracket</h2>
          <p className="text-sm text-gray-400 mb-3">Por cada equipo que aciertes en la ronda correcta del bracket:</p>
          <div className="overflow-hidden rounded-xl border border-field-light/40">
            {[
              { pts: '+4 pts', round: 'Octavos de Final (R32)', color: 'text-blue-300' },
              { pts: '+5 pts', round: 'Cuartos de Final (R16)', color: 'text-blue-200' },
              { pts: '+6 pts', round: 'Semifinales', color: 'text-purple-300' },
              { pts: '+7 pts', round: 'Final (por semifinalista)', color: 'text-orange-300' },
              { pts: '+10 pts', round: 'Campeón (ganador final)', color: 'text-gold' },
            ].map((row, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-field-light/30' : ''}`}>
                <span className={`font-black text-lg w-20 shrink-0 ${row.color}`}>{row.pts}</span>
                <span className="font-semibold text-white text-sm">{row.round}</span>
              </div>
            ))}
          </div>
          <div className="bg-field-dark rounded-xl p-4 border border-field-light/20 text-sm text-gray-400 mt-3">
            <p><span className="text-white font-semibold">Nota:</span> Si el admin ingresa los resultados de los partidos de eliminatoria en el sistema, también podrás predecir el marcador exacto de esos partidos y ganar puntos adicionales (+2 resultado, +3 exacto).</p>
          </div>
        </div>

        {/* Estructura del torneo */}
        <div className="card">
          <h2 className="text-lg font-black text-gold mb-4 flex items-center gap-2">🗂️ Estructura del Torneo</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Equipos', value: '48' },
                { label: 'Grupos', value: '12 (A–L)' },
                { label: 'Partidos grupos', value: '48' },
                { label: 'Clasifican', value: '32' },
              ].map(s => (
                <div key={s.label} className="bg-field-dark rounded-xl p-3 border border-field-light/20 text-center">
                  <div className="font-black text-white text-xl">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Cada grupo tiene 4 equipos. Clasifican los 2 primeros de cada grupo + los 8 mejores terceros. La fase eliminatoria va de Octavos → Cuartos → Semis → Final.
            </p>
            <p className="text-xs text-gray-500">
              <span className="text-white">Cruces de Octavos:</span> Siguen el orden oficial FIFA 2026. Los 8 mejores terceros se asignan a los cruces según las reglas oficiales de la FIFA (bipartite matching por grupo de origen).
            </p>
          </div>
        </div>

        {/* Sedes */}
        <div className="card">
          <h2 className="text-lg font-black text-gold mb-3 flex items-center gap-2">🌎 Sedes</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            {[
              { flag: '🇺🇸', country: 'Estados Unidos', cities: 'NY, LA, Dallas, SF, Seattle, Boston, Philadelphia, Miami, Kansas City, Atlanta' },
              { flag: '🇨🇦', country: 'Canadá', cities: 'Toronto, Vancouver' },
              { flag: '🇲🇽', country: 'México', cities: 'Ciudad de México, Guadalajara, Monterrey' },
            ].map(s => (
              <div key={s.country} className="bg-field-dark rounded-xl px-4 py-3 border border-field-light/20 flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{s.flag}</span>
                  <span className="font-bold text-white">{s.country}</span>
                </div>
                <p className="text-xs text-gray-500">{s.cities}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de puntos */}
        <div className="card" style={{ background: 'linear-gradient(145deg,#1a2e1a,#0a1a0a)', borderColor: 'rgba(245,197,24,0.3)' }}>
          <h2 className="text-lg font-black text-gold mb-4 flex items-center gap-2">⭐ Resumen de Puntos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              { pts: '2', label: 'Resultado correcto (G/E/P)' },
              { pts: '3', label: 'Marcador exacto' },
              { pts: '4', label: '1er lugar de grupo' },
              { pts: '3', label: '2do lugar de grupo' },
              { pts: '2', label: '3er lugar (mejor tercero)' },
              { pts: '4', label: 'Equipo correcto en Octavos' },
              { pts: '5', label: 'Equipo correcto en Cuartos' },
              { pts: '6', label: 'Equipo correcto en Semis' },
              { pts: '7', label: 'Semifinalista correcto (Final)' },
              { pts: '10', label: 'Campeón correcto' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 bg-field-dark/60 rounded-lg px-3 py-2">
                <span className="font-black text-gold text-base w-6 text-center">{row.pts}</span>
                <span className="text-gray-300">{row.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
