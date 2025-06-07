import AuthButton from '@/components/buttons/auth-button-dynamic'
import PageWrapper from '@/components/layout/page-wrapper'

export default function Home() {
  return (
    <PageWrapper>
      <div className="page container space-y-16 text-center md:pt-24 xl:pt-20">
        <h1>
          somos la comunidad
          <br />
          para{' '}
          <span className="underline decoration-primary underline-offset-8">
            hackers
          </span>
        </h1>
        <div className="flex-col px-12 text-left md:max-w-lg">
          <p className="font-ledger text-4xl">hackear:</p>
          <p className="text-base">
            Del inglés <span className="mr-0.5 italic">to hack</span> y -ear.
          </p>
          <p className="mt-2 font-serif text-2xl">
            rechazar las limitaciones impuestas y crear nuestras propias reglas
          </p>
        </div>
        <AuthButton size="xl" className="font-grotesk text-2xl">
          unirme al club
        </AuthButton>
      </div>
    </PageWrapper>
  )
}
