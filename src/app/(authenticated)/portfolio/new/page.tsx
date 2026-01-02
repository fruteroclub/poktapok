/**
 * New Project Page
 *
 * Project creation flow
 */

import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import { CreateProjectForm } from '@/components/portfolio/create-project-form'

export default function NewProjectPage() {
  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content">
          <div className="header-section">
            <h1 className="text-3xl font-bold">New Project</h1>
            <p className="mt-1 text-muted-foreground">
              Create a new project to showcase your work
            </p>
          </div>
          <Section className="gap-y-4 pt-0!">
            <CreateProjectForm className="w-full" />
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
