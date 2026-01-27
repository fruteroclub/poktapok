'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Section } from '../layout/section'

const faqs = [
  {
    question: '¿Es gratis unirse a Frutero Club?',
    answer:
      'Sí, el acceso a Frutero Club es completamente gratuito. Creemos que el talento no debe limitarse por barreras económicas. Sin embargo, el valor está en la exclusividad y calidad de la comunidad.',
  },
  {
    question: '¿Qué nivel técnico necesito?',
    answer:
      'No necesitas ser un experto, pero sí tener interés genuino en tecnología. Aceptamos desde estudiantes motivados hasta developers senior. Lo importante es tu mentalidad de builder y ganas de contribuir.',
  },
  {
    question: '¿Cuánto tiempo requiere?',
    answer:
      'La participación es flexible. Puedes contribuir desde 2-3 horas semanales. Lo importante es la consistencia y calidad de tus aportes, no la cantidad de tiempo.',
  },
  {
    question: '¿Cómo funciona la selección?',
    answer:
      'Nuestro proceso incluye: formulario inicial, review de perfil, entrevista de 30 minutos y onboarding. Evaluamos fit cultural, potencial técnico y compromiso con la comunidad.',
  },
  {
    question: '¿Puedo aplicar si no vivo en México?',
    answer:
      '¡Absolutamente! Somos una comunidad global con miembros en 15+ países. Los eventos presenciales son en México, pero la mayoría de actividades son remotas y accesibles desde cualquier lugar.',
  },
  {
    question: '¿Qué es el token $PULPA?',
    answer:
      'Es nuestro sistema de reputación que convierte tus contribuciones en oportunidades. Ganas $PULPA ayudando a otros, participando en eventos y construyendo proyectos. Con más $PULPA desbloqueas beneficios exclusivos.',
  },
  {
    question: '¿Hay límite de edad para aplicar?',
    answer:
      'No hay límites estrictos de edad. Hemos tenido miembros exitosos desde los 16 hasta los 50+ años. Lo que importa es tu pasión por la tecnología y mentalidad de crecimiento.',
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

        <Section className="w-full md:max-w-lg lg:max-w-2xl">
          <FaqAccordion />
        </Section>
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
