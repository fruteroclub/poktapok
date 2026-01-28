'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  username: string
  displayName?: string | null
}

export function ShareButton({ username, displayName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${username}`
    const title = displayName
      ? `${displayName}'s profile on Poktapok`
      : `@${username} on Poktapok`

    // Try Web Share API first (mobile native sharing)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        })
        return
      } catch {
        // User cancelled or share API failed - fallback to clipboard
      }
    }

    // Fallback to clipboard copy (desktop)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Profile link copied to clipboard!')

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      toast.error('Failed to copy link')
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </>
      )}
    </Button>
  )
}
