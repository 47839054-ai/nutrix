import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'

const FAQ_ITEMS = [
  {
    q: 'Como registro una comida?',
    a: 'Anda a la seccion "Escaner" desde la barra de navegacion. Podes buscar alimentos por nombre, escanear un codigo de barras con la camara, o ingresar los datos nutricionales manualmente.',
  },
  {
    q: 'Como funciona el plan nutricional?',
    a: 'El plan se genera automaticamente despues de completar el test nutricional. Se basa en tus datos personales (peso, altura, edad), nivel de actividad, objetivo y preferencias alimentarias. Utiliza algoritmos de calculo nutricional para determinar tus calorias ideales y distribucion de macros.',
  },
  {
    q: 'Puedo cambiar mi plan despues de generarlo?',
    a: 'Si, podes rehacer el test nutricional en cualquier momento desde Perfil > Rehacer test nutricional. Se generara un nuevo plan basado en tus nuevas respuestas.',
  },
  {
    q: 'Como se calcula el IMC?',
    a: 'El Indice de Masa Corporal (IMC) se calcula dividiendo tu peso en kilogramos por tu altura en metros al cuadrado (IMC = kg/m2). Clasificaciones: bajo peso (<18.5), normal (18.5-24.9), sobrepeso (25-29.9), obesidad (>=30).',
  },
  {
    q: 'Que es la TMB?',
    a: 'La Tasa Metabolica Basal (TMB) es la cantidad de calorias que tu cuerpo necesita en reposo para funcionar. Se calcula con la ecuacion de Mifflin-St Jeor, teniendo en cuenta tu peso, altura, edad y sexo.',
  },
  {
    q: 'Mis datos estan seguros?',
    a: 'Si. Tus datos se almacenan de forma segura en nuestra base de datos. No compartimos tu informacion con terceros. Podes eliminar tu cuenta y todos tus datos en cualquier momento.',
  },
  {
    q: 'Como cambio el modo oscuro?',
    a: 'Anda a la seccion Perfil y activa o desactiva el interruptor de "Modo oscuro".',
  },
  {
    q: 'Puedo usar la app sin conexion?',
    a: 'Actualmente la app requiere conexion a internet para guardar tus datos. Estamos trabajando en funcionalidad offline para futuras versiones.',
  },
]

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 pr-2">
          {item.q}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="page-container space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ayuda y Contacto</h2>

      <div className="card bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nutrix v1.0.0</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Tu asistente de nutricion personal. Calcula calorias, registra comidas y segui tu progreso.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">Preguntas frecuentes</h3>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-title">Contacto</h3>
        <div className="space-y-2">
          <a
            href="mailto:soporte@nutrix.app"
            className="card flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">soporte@nutrix.app</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://nutrix.app/ayuda"
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Chat de soporte</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Disponible lun-vie 9-18hs</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  )
}
