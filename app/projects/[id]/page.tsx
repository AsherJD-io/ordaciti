import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvidenceById, getNormalizedById, getClusterForProject, getSignalsForProject, getAllocationContext } from '@/lib/data'
import ProjectContent from './project-content'

export async function generateStaticParams() {
  const evidenceData = await import('@/data/processed/evidence.json')
  const paths = evidenceData.default.evidence.map((e: { project_id: string }) => ({ id: e.project_id }))
  return paths
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ev = getEvidenceById(id)
  const title = ev?.facts.find(f => f.text.startsWith('Project title:'))?.text.replace('Project title: ', '') ?? `Project ${id}`
  return { title: `${title} — Ordaciti` }
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectContent />
}
