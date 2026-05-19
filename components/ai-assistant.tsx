'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sparkles,
  X,
  Send,
  MapPin,
  Calendar,
  Utensils,
  Building2,
  Plane,
  Plus,
  Check,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: AISuggestion[]
}

interface AISuggestion {
  id: string
  type: 'place' | 'restaurant' | 'hotel' | 'flight' | 'activity'
  name: string
  description: string
  price?: string
  rating?: number
  imageUrl?: string
  bookable?: boolean
}

const suggestionIcons = {
  place: MapPin,
  restaurant: Utensils,
  hotel: Building2,
  flight: Plane,
  activity: Calendar,
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  destination: string
  onAddPlace?: (suggestion: AISuggestion) => void
  onBook?: (suggestion: AISuggestion) => void
}

export function AIAssistant({ isOpen, onClose, destination, onAddPlace, onBook }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey! I can help you plan your trip to ${destination}. What would you like to explore? I can suggest restaurants, activities, hidden gems, or help you book accommodations.`,
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await api.chat.sendMessage({
        conversationId,
        message: userInput,
      })

      if (response.conversationId) {
        setConversationId(response.conversationId)
      }

      const aiResponse: Message = {
        id: response.messageId || (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content || response.message || '',
        suggestions: response.suggestions,
      }
      setMessages(prev => [...prev, aiResponse])
    } catch {
      // Fallback to mock responses if API is unavailable
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(userInput, destination),
        suggestions: getAISuggestions(userInput, destination),
      }
      setMessages(prev => [...prev, aiResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl ai-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">AI Trip Planner</h2>
                  <p className="text-xs text-muted-foreground">Ask me anything about {destination}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion) => (
                          <SuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onAdd={() => onAddPlace?.(suggestion)}
                            onBook={() => onBook?.(suggestion)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-2 border-t border-border">
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
                {[
                  'Best restaurants nearby',
                  'Things to do',
                  'Hidden gems',
                  'Book a hotel'
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about places, food, activities..."
                  className="flex-1 rounded-xl bg-muted border-0"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!input.trim() || isLoading}
                    className="rounded-xl shadow-lg shadow-primary/20"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SuggestionCard({ 
  suggestion, 
  onAdd, 
  onBook 
}: { 
  suggestion: AISuggestion
  onAdd: () => void
  onBook: () => void
}) {
  const [added, setAdded] = useState(false)
  const Icon = suggestionIcons[suggestion.type]

  const handleAdd = () => {
    setAdded(true)
    onAdd()
  }

  return (
    <motion.div 
      className="bg-card border border-border rounded-xl p-3 shadow-sm"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        {suggestion.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={suggestion.imageUrl} 
            alt={suggestion.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="h-5 w-5 text-secondary-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm truncate">{suggestion.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-1">{suggestion.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {suggestion.rating && (
              <span className="text-xs font-medium text-primary">{suggestion.rating} stars</span>
            )}
            {suggestion.price && (
              <span className="text-xs text-muted-foreground">{suggestion.price}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs rounded-lg h-8"
          onClick={handleAdd}
          disabled={added}
        >
          {added ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Add to trip
            </>
          )}
        </Button>
        {suggestion.bookable && (
          <Button 
            size="sm" 
            className="flex-1 text-xs rounded-lg h-8"
            onClick={onBook}
          >
            Book now
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// Helper functions to simulate AI responses
function getAIResponse(input: string, destination: string): string {
  const lower = input.toLowerCase()
  
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('eat')) {
    return `Here are some great dining options in ${destination} that I think you will love:`
  }
  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('accommodation')) {
    return `I found some excellent places to stay in ${destination}. I can help you book directly:`
  }
  if (lower.includes('hidden') || lower.includes('gem') || lower.includes('local')) {
    return `Here are some lesser-known spots that locals love in ${destination}:`
  }
  if (lower.includes('activity') || lower.includes('do') || lower.includes('things')) {
    return `There is so much to explore in ${destination}! Here are my top recommendations:`
  }
  
  return `Great question! Here are some suggestions for ${destination}:`
}

function getAISuggestions(input: string, destination: string): AISuggestion[] {
  const lower = input.toLowerCase()
  
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('eat')) {
    return [
      {
        id: '1',
        type: 'restaurant',
        name: 'Trattoria Da Enzo',
        description: 'Authentic Roman cuisine in a cozy atmosphere',
        price: '$$',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
        bookable: true,
      },
      {
        id: '2',
        type: 'restaurant',
        name: 'Roscioli',
        description: 'Famous deli and restaurant with incredible pasta',
        price: '$$$',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop',
        bookable: true,
      },
    ]
  }
  
  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('accommodation')) {
    return [
      {
        id: '3',
        type: 'hotel',
        name: 'Hotel de Russie',
        description: 'Luxury 5-star hotel near Piazza del Popolo',
        price: '$450/night',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop',
        bookable: true,
      },
      {
        id: '4',
        type: 'hotel',
        name: 'Chapter Roma',
        description: 'Boutique hotel in Trastevere with rooftop bar',
        price: '$280/night',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop',
        bookable: true,
      },
    ]
  }
  
  return [
    {
      id: '5',
      type: 'activity',
      name: 'Vatican Museums Skip-the-Line',
      description: 'Early morning tour with expert guide',
      price: '$65/person',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=100&h=100&fit=crop',
      bookable: true,
    },
    {
      id: '6',
      type: 'place',
      name: 'Trastevere Walking Tour',
      description: 'Discover the charming streets of Trastevere',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=100&h=100&fit=crop',
      bookable: false,
    },
  ]
}
