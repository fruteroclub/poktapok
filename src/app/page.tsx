import AuthButton from '@/components/buttons/auth-button-dynamic'
import PageWithAppbar from '@/components/layout/page-wrapper'

export default function Home() {
  return (
    <PageWithAppbar>
      <div className="page container space-y-16 pt-20 text-center md:pt-24 xl:pt-20">
        <h1>
          somos la comunidad
          <br />
          para{' '}
          <span className="underline decoration-primary underline-offset-8">
            hackers
          </span>
        </h1>
        <div className="flex-col px-12 text-left md:max-w-lg">
          <p className="font-serif text-4xl">hackear:</p>
          <p className="font-sans text-base">Del ingl. to hack y -ear.</p>
          <p className="mt-2 font-serif text-2xl">
            rechazar las limitaciones impuestas y crear nuestras propias reglas
          </p>
        </div>
        <AuthButton size="xl" className="font-grotesk text-2xl">
          unirme al club
        </AuthButton>
      </div>
    </PageWithAppbar>
  )
}
