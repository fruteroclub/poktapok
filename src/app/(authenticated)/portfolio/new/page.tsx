/**
 * New Project Page
 *
 * Project creation flow
 */

import PageWrapper from '@/components/layout/page-wrapper';
import { CreateProjectForm } from '@/components/portfolio/create-project-form';

export default function NewProjectPage() {
  return (
    <PageWrapper>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <CreateProjectForm />
      </div>
    </PageWrapper>
  );
}
