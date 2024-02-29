import { useToast } from '@render/components/ui/use-toast'
import { useStore } from '@render/store'
import { useEffect } from 'react'

export function Notifications() {
  const { toast } = useToast()

  const notifications = useStore(state => state.notifications)

  useEffect(() => {
    if (notifications.length) {
      const notification = notifications[notifications.length - 1]
      toast({
        title: notification.title,
        variant: notification.type,
        description: notification.message,
      })
    }
  }, [notifications])

  return null
}
