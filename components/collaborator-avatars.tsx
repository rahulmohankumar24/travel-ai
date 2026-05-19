'use client'

import { Collaborator } from '@/lib/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CollaboratorAvatarsProps {
  collaborators: Collaborator[]
  maxVisible?: number
  onInvite?: () => void
}

export function CollaboratorAvatars({ 
  collaborators, 
  maxVisible = 4,
  onInvite 
}: CollaboratorAvatarsProps) {
  const visible = collaborators.slice(0, maxVisible)
  const remaining = collaborators.length - maxVisible
  
  return (
    <TooltipProvider>
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {visible.map((collaborator) => (
            <Tooltip key={collaborator.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback 
                      className="text-xs font-medium text-foreground"
                      style={{ backgroundColor: collaborator.color + '30' }}
                    >
                      {collaborator.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {collaborator.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-medium">{collaborator.name}</p>
                <p className="text-muted-foreground">{collaborator.isOnline ? 'Online' : 'Offline'}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {remaining > 0 && (
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                +{remaining}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 h-8 w-8 p-0 rounded-full"
              onClick={onInvite}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Invite collaborator
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
