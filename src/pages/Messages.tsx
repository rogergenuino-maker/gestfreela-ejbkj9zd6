import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowLeft, MessageSquare, Plus, Search, Send } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  remetente_id: string
  destinatario_id: string
  conteudo: string
  lido: boolean
  data_envio: string
}

interface ConversationUser {
  id: string
  name: string
  avatar?: string
  userType: string
}

interface Conversation {
  otherUser: ConversationUser
  lastMessage: Message
  unreadCount: number
}

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState<ConversationUser[]>([])
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchConversations()
    fetchContacts()

    const channel = supabase
      .channel('messages_changes_page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensagens' }, (payload) => {
        const msg = payload.new as Message
        if (msg.remetente_id === user.id || msg.destinatario_id === user.id) {
          fetchConversations()
          if (
            selectedUser &&
            (msg.remetente_id === selectedUser.id || msg.destinatario_id === selectedUser.id)
          ) {
            fetchMessages(selectedUser.id)
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, selectedUser])

  const fetchContacts = async () => {
    if (!user) return
    const { data: usersData } = await supabase
      .from('users')
      .select('id, user_type, profile_picture_url')
    const { data: empresasData } = await supabase.from('empresas').select('user_id, nome_empresa')
    const { data: freelancersData } = await supabase
      .from('freelancers')
      .select('user_id, nome_completo')

    const potentialContacts: ConversationUser[] = []

    usersData?.forEach((u) => {
      if (u.id === user.id) return
      let name = 'Usuário'
      if (u.user_type === 'empresa') {
        const emp = empresasData?.find((e) => e.user_id === u.id)
        if (emp) name = emp.nome_empresa
      } else if (u.user_type === 'freelancer') {
        const free = freelancersData?.find((f) => f.user_id === u.id)
        if (free) name = free.nome_completo
      }

      potentialContacts.push({
        id: u.id,
        name,
        avatar: u.profile_picture_url || undefined,
        userType: u.user_type,
      })
    })

    setContacts(potentialContacts.sort((a, b) => a.name.localeCompare(b.name)))
  }

  const fetchConversations = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('mensagens' as any)
      .select('*')
      .or(`remetente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
      .order('data_envio', { ascending: false })

    if (error || !data) {
      setLoading(false)
      return
    }

    const convMap = new Map<string, Conversation>()
    const otherIds = new Set<string>()
    data.forEach((msg: Message) => {
      const otherId = msg.remetente_id === user.id ? msg.destinatario_id : msg.remetente_id
      otherIds.add(otherId)
    })

    const { data: usersData } = await supabase
      .from('users')
      .select('id, user_type, profile_picture_url')
      .in('id', Array.from(otherIds))
    const { data: empresasData } = await supabase
      .from('empresas')
      .select('user_id, nome_empresa')
      .in('user_id', Array.from(otherIds))
    const { data: freelancersData } = await supabase
      .from('freelancers')
      .select('user_id, nome_completo')
      .in('user_id', Array.from(otherIds))

    data.forEach((msg: Message) => {
      const otherId = msg.remetente_id === user.id ? msg.destinatario_id : msg.remetente_id
      if (!convMap.has(otherId)) {
        const uInfo = usersData?.find((u) => u.id === otherId)
        let name = 'Usuário'
        if (uInfo?.user_type === 'empresa') {
          const emp = empresasData?.find((e) => e.user_id === otherId)
          if (emp) name = emp.nome_empresa
        } else if (uInfo?.user_type === 'freelancer') {
          const free = freelancersData?.find((f) => f.user_id === otherId)
          if (free) name = free.nome_completo
        }

        convMap.set(otherId, {
          otherUser: {
            id: otherId,
            name,
            avatar: uInfo?.profile_picture_url || undefined,
            userType: uInfo?.user_type || 'user',
          },
          lastMessage: msg,
          unreadCount: msg.destinatario_id === user.id && !msg.lido ? 1 : 0,
        })
      } else {
        if (msg.destinatario_id === user.id && !msg.lido) {
          convMap.get(otherId)!.unreadCount++
        }
      }
    })

    setConversations(Array.from(convMap.values()))
    setLoading(false)
  }

  const fetchMessages = async (otherId: string) => {
    if (!user) return
    const { data } = await supabase
      .from('mensagens' as any)
      .select('*')
      .or(
        `and(remetente_id.eq.${user.id},destinatario_id.eq.${otherId}),and(remetente_id.eq.${otherId},destinatario_id.eq.${user.id})`,
      )
      .order('data_envio', { ascending: true })

    if (data) setMessages(data)

    const unreadMessages =
      data?.filter((m: Message) => m.destinatario_id === user.id && !m.lido) || []
    if (unreadMessages.length > 0) {
      await supabase
        .from('mensagens' as any)
        .update({ lido: true })
        .in(
          'id',
          unreadMessages.map((m: Message) => m.id),
        )
    }
  }

  const handleSelectUser = (u: ConversationUser) => {
    setSelectedUser(u)
    fetchMessages(u.id)
    setNewChatDialogOpen(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedUser || !newMessage.trim()) return

    const { error } = await supabase.from('mensagens' as any).insert({
      remetente_id: user.id,
      destinatario_id: selectedUser.id,
      conteudo: newMessage.trim(),
    })

    if (!error) {
      setNewMessage('')
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const filteredConversations = conversations.filter((c) =>
    c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] gap-4 p-4 md:p-6 lg:gap-6 bg-slate-50/50">
      <Card
        className={cn(
          'flex flex-col w-full md:w-80 lg:w-96 overflow-hidden border-slate-200 bg-white shadow-sm',
          selectedUser ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-semibold text-slate-800">Mensagens</h2>
          <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Mensagem</DialogTitle>
              </DialogHeader>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar contato..."
                  className="pl-9 bg-slate-50 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[300px] mt-4 rounded-md border border-slate-100">
                <div className="p-2 space-y-1">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectUser(contact)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm truncate text-slate-800">
                          {contact.name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{contact.userType}</p>
                      </div>
                    </button>
                  ))}
                  {filteredContacts.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Nenhum contato encontrado.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <div className="p-3 bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar conversa..."
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1 bg-white">
          <div className="p-2 space-y-1">
            {loading ? (
              <p className="text-center text-sm text-slate-500 py-4">Carregando...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">
                Nenhuma conversa encontrada.
              </p>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.otherUser.id}
                  onClick={() => handleSelectUser(conv.otherUser)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left border',
                    selectedUser?.id === conv.otherUser.id
                      ? 'bg-blue-50 border-blue-100'
                      : 'border-transparent hover:bg-slate-50 hover:border-slate-100',
                  )}
                >
                  <Avatar className="h-12 w-12 border border-slate-100 mt-0.5 shrink-0">
                    <AvatarImage src={conv.otherUser.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {conv.otherUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm truncate text-slate-800">
                        {conv.otherUser.name}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 shrink-0">
                        {format(new Date(conv.lastMessage.data_envio), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate pr-2">
                      {conv.lastMessage.remetente_id === user?.id && 'Você: '}
                      {conv.lastMessage.conteudo}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="bg-blue-600 shrink-0 rounded-full h-5 min-w-5 flex items-center justify-center p-0 text-[10px] mt-1 ml-auto"
                    >
                      {conv.unreadCount}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      <Card
        className={cn(
          'flex-col flex-1 overflow-hidden border-slate-200 bg-white shadow-sm',
          !selectedUser ? 'hidden md:flex' : 'flex',
        )}
      >
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 mr-1 text-slate-500 shrink-0"
                onClick={() => setSelectedUser(null)}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Voltar</span>
              </Button>
              <Avatar className="h-10 w-10 border border-slate-100 shrink-0">
                <AvatarImage src={selectedUser.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500 capitalize truncate">
                  {selectedUser.userType}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
              <div className="space-y-4 pb-4">
                {messages.map((msg, idx) => {
                  const isMe = msg.remetente_id === user?.id
                  const showDate =
                    idx === 0 ||
                    new Date(messages[idx - 1].data_envio).toDateString() !==
                      new Date(msg.data_envio).toDateString()

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center mb-4 mt-2">
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                            {format(new Date(msg.data_envio), "dd 'de' MMMM", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      <div className={cn('flex w-full', isMe ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm',
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.conteudo}
                          </p>
                          <div
                            className={cn(
                              'text-[10px] mt-1 text-right',
                              isMe ? 'text-blue-200' : 'text-slate-400',
                            )}
                          >
                            {format(new Date(msg.data_envio), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 rounded-full px-4"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="rounded-full h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 shadow-sm transition-all shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-6 text-center">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-lg font-medium text-slate-600 mb-1">Suas Mensagens</p>
            <p className="text-sm text-center max-w-xs">
              Selecione uma conversa ao lado ou inicie uma nova para começar a conversar.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
