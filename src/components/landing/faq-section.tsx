'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: '¿Es realmente gratis?',
    answer:
      'Sí, el acceso a Frutero Club es 100% gratuito. No hay cuotas de membresía, tarifas ocultas ni pagos requeridos. Ganas tokens $PULPA por tus contribuciones que puedes canjear por beneficios exclusivos.',
  },
  {
    question: '¿Cuánto puedo ganar?',
    answer:
      'Los miembros activos ganan entre $500 y $5,000 USD en sus primeros 3 meses a través de bounties, hackathons y proyectos. Tus ganancias dependen de tu nivel de participación y calidad de trabajo.',
  },
  {
    question: '¿Qué nivel técnico necesito?',
    answer:
      'No necesitas ser experto. Aceptamos desde estudiantes motivados hasta developers senior. Si sabes programación básica y tienes ganas de aprender IA, crypto o privacidad, eres bienvenido.',
  },
  {
    question: '¿Cuánto tiempo toma la aplicación?',
    answer:
      'El formulario toma 5-10 minutos. Después revisamos tu perfil en 24-48 horas. Si eres aceptado, el onboarding inicial es de 30 minutos y puedes empezar a participar de inmediato.',
  },
  {
    question: '¿Cómo funciona la selección?',
    answer:
      'Evaluamos tu aplicación basándonos en motivación, interés genuino en tecnología y fit cultural. No necesitas experiencia previa en Web3. Buscamos builders con mentalidad de crecimiento.',
  },
  {
    question: '¿Puedo aplicar si no vivo en México?',
    answer:
      '¡Absolutamente! Somos una comunidad global con miembros en 15+ países. La mayoría de actividades son remotas. Los eventos presenciales en México son opcionales.',
  },
  {
    question: '¿Qué es el token $PULPA?',
    answer:
      'Es nuestro sistema de reputación on-chain. Ganas $PULPA completando bounties, participando en eventos y ayudando a otros. Con más $PULPA desbloqueas beneficios como acceso prioritario a hackathons y oportunidades laborales.',
  },
  {
    question: '¿Cuánto tiempo requiere participar?',
    answer:
      'Es flexible. Puedes empezar con 2-3 horas semanales. Los miembros más activos dedican 10-15 horas. Lo importante es la consistencia y calidad, no la cantidad de tiempo.',
  },
]

export default function FAQSection() {
  return (
    <div className="page">
      <div className="page-content gap-y-6 lg:gap-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="section">
          <FaqAccordion />
        </div>
      </div>
    </div>
  )
}

function FaqAccordion() {
  const [openQuestionIndex, setOpenQuestionIndex] = useState(-1)

  function handleItemChange(index: string) {
    if (openQuestionIndex === parseInt(index)) {
      setOpenQuestionIndex(-1)
    } else {
      setOpenQuestionIndex(parseInt(index))
    }
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-4"
      onValueChange={(value) => handleItemChange(value)}
    >
      {faqs.map((faq, index) => (
        <AccordionItem
          className="bg-card px-4"
          key={`faq-question-${index}`}
          value={index.toString()}
        >
          <AccordionTrigger className="w-full">
            <h4 className="w-[95%] font-funnel text-lg">{faq.question}</h4>
            <div className="flex w-[5%] justify-end">
              {openQuestionIndex == index ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
