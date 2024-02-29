import type { IMessage } from '@common/types'
import { ScrollArea } from '@render/components/ui/scroll-area'
import AnimatedListItem from '@render/components/animated-list-item'

interface MessagesListProps {
  messages: IMessage[]
}

function MessagesList({ messages }: MessagesListProps) {
  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-2 pt-2">
        {messages.map(message => (
          <AnimatedListItem key={message.id}>
            <div className="rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent">
              <div className="flex w-full flex-col gap-1 transition-colors">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{ message.title }</div>
                  </div>
                </div>
                <div className="text-xs font-medium">{ message.message }</div>
              </div>
            </div>
          </AnimatedListItem>
        )) }
      </div>
    </ScrollArea>
  )
}

export default MessagesList
