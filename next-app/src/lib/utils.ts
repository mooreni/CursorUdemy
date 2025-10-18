import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncates text to fit approximately 2 lines of description text
 * @param text - The text to truncate
 * @param maxLength - Maximum character length (default: 80 chars for ~2 lines)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 80): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  // If there's a space, cut at the space; otherwise cut at maxLength
  const cutPoint = lastSpace > 0 ? lastSpace : maxLength
  
  return text.substring(0, cutPoint) + '...'
}