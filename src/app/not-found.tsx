import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="flex h-[calc(100vh-64px)] w-5xl flex-col items-center space-y-4 px-4 text-center">
        <h2 className="pt-40 text-5xl">
          404 <span className="text-primary">|</span> no encontrada
        </h2>
        <p className="text-xl">No se pudo encontrar la página que buscas</p>
        <div className="pt-4">
          <Link href="/">
            <Button size="lg" className="text-lgmd:text-xl">
              Ir a Inicio
            </Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  )
}
