import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomNumber(range: number) {
  return Math.floor(Math.random() * range)
}

export function truncateString(str: string | undefined, start = 6, end = 4) {
  if (!str) return 'Could not format address...'
  return `${str.slice(0, start)}...${str.slice(0 - end)}`
}

export function copyToClipboard(entryText: string) {
  void navigator.clipboard.writeText(entryText)
}

export async function scrollToNextSection(id: string) {
  const nextSection = document.getElementById(id)
  if (nextSection) {
    const navbarHeight = 80 // Approximate navbar height in pixels
    const elementPosition = nextSection.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}
