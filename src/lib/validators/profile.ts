import { z } from 'zod'

/**
 * Profile form validation schema
 * Only validates Profile table fields (not User table)
 * User info is displayed read-only in the form
 */
export const profileSchema = z.object({
  // Location fields
  city: z.string().min(1, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  countryCode: z.string().regex(/^[A-Z]{2}$/, 'Invalid country code'),

  // Learning & Availability
  learningTrack: z.enum(['ai', 'crypto', 'privacy'], {
    message: 'Please select a learning track',
  }),
  availabilityStatus: z.enum(['available', 'open_to_offers', 'unavailable']),

  // Social links (all optional, usernames only)
  socialLinks: z
    .object({
      github: z
        .string()
        .regex(
          /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
          'Invalid GitHub username',
        )
        .optional()
        .or(z.literal('')),
      twitter: z
        .string()
        .regex(/^@?[a-zA-Z0-9_]+$/, 'Invalid Twitter/X username')
        .optional()
        .or(z.literal('')),
      linkedin: z
        .string()
        .regex(/^[a-zA-Z0-9-]+$/, 'Invalid LinkedIn username')
        .optional()
        .or(z.literal('')),
      telegram: z
        .string()
        .regex(/^@?[a-zA-Z0-9_]+$/, 'Invalid Telegram username')
        .optional()
        .or(z.literal('')),
    })
    .optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
