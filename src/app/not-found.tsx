import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="flex h-[calc(100vh-64px)] w-5xl flex-col items-center px-4 text-center">
        <h2 className="pt-40 text-5xl">
          404 <span className="text-primary">|</span> no encontrada
        </h2>
        <p className="mt-4 text-xl">
          no se pudo encontrar la página que buscas
        </p>
        <Link href="/">
          <Button
            size="lg"
            className="mt-6 text-lg md:mt-8 md:text-xl lg:mt-8 xl:mt-12"
          >
            ir a inicio
          </Button>
        </Link>
      </div>
    </PageWrapper>
  )
}
