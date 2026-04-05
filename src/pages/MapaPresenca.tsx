import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Clock, User, LogIn, LogOut, Loader2, Map as MapIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

declare global {
  interface Window {
    google: any
  }
}

export default function MapaPresenca() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [contratos, setContratos] = useState<any[]>([])
  const [selectedContrato, setSelectedContrato] = useState<string>('')
  const [checkins, setCheckins] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    fetchContratos()
  }, [user])

  const fetchContratos = async () => {
    if (!user) return
    const { data: empresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!empresa) return

    const { data } = await supabase
      .from('contratos')
      .select(`
        id,
        vaga:vagas(titulo),
        freelancer:freelancers(nome_completo)
      `)
      .eq('empresa_id', empresa.id)
      .eq('status', 'ativo')

    if (data) {
      setContratos(data)
      if (data.length > 0) {
        setSelectedContrato(data[0].id)
      }
    }
  }

  useEffect(() => {
    if (selectedContrato) {
      fetchMapData(selectedContrato)
    }
  }, [selectedContrato])

  const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
    if (window.google?.maps) return Promise.resolve()

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Falha ao carregar Google Maps API'))
      document.head.appendChild(script)
    })
  }

  const initMap = (apiKey: string, checkinsData: any[]) => {
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!mapRef.current) return

        if (!mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            zoom: 12,
            center:
              checkinsData.length > 0 && checkinsData[0].latitude
                ? { lat: Number(checkinsData[0].latitude), lng: Number(checkinsData[0].longitude) }
                : { lat: -23.5505, lng: -46.6333 },
            mapTypeId: 'roadmap',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          })
        }

        markersRef.current.forEach((marker) => marker.setMap(null))
        markersRef.current = []

        const bounds = new window.google.maps.LatLngBounds()
        let hasValidCoordinates = false

        checkinsData.forEach((checkin) => {
          if (checkin.latitude && checkin.longitude) {
            hasValidCoordinates = true
            const position = { lat: Number(checkin.latitude), lng: Number(checkin.longitude) }
            const marker = new window.google.maps.Marker({
              position,
              map: mapInstance.current,
              title: `${checkin.tipo} - ${checkin.freelancer?.nome_completo}`,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: checkin.tipo === 'Entrada' ? '#22c55e' : '#ef4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            })

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
              <div style="padding: 8px; font-family: sans-serif;">
                <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #0f172a;">${checkin.tipo}</h3>
                <p style="margin: 0 0 4px; font-size: 12px; color: #475569;">${checkin.freelancer?.nome_completo}</p>
                <p style="margin: 0; font-size: 11px; color: #64748b;">${format(new Date(checkin.data_hora), "dd/MM/yyyy 'às' HH:mm")}</p>
              </div>
            `,
            })

            marker.addListener('click', () => {
              infoWindow.open(mapInstance.current, marker)
            })

            markersRef.current.push(marker)
            bounds.extend(position)
          }
        })

        if (hasValidCoordinates && markersRef.current.length > 1) {
          mapInstance.current.fitBounds(bounds)
        } else if (hasValidCoordinates && markersRef.current.length === 1) {
          mapInstance.current.setCenter(bounds.getCenter())
          mapInstance.current.setZoom(15)
        }
      })
      .catch((err) => {
        console.error(err)
        toast({
          title: 'Erro ao carregar o mapa',
          description: 'Não foi possível inicializar a API do Google Maps.',
          variant: 'destructive',
        })
      })
  }

  const fetchMapData = async (contratoId: string) => {
    setLoading(true)
    try {
      const { data: checkinsData } = await supabase
        .from('checkins_operacionais')
        .select(`
          *,
          freelancer:freelancers(nome_completo, foto_perfil)
        `)
        .eq('contrato_id', contratoId)
        .order('data_hora', { ascending: false })

      if (!checkinsData || checkinsData.length === 0) {
        setCheckins([])
        setHasApiKey(false)
        return
      }

      const { data, error } = await supabase.functions.invoke('map-data', {
        body: { checkins: checkinsData },
      })

      if (error) throw error

      setCheckins(data.checkins || [])

      if (data.apiKey) {
        setHasApiKey(true)
        initMap(data.apiKey, data.checkins || [])
      } else {
        setHasApiKey(false)
      }
    } catch (error) {
      console.error('Error fetching map data:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de geolocalização.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Mapa de Presença</h2>
          <p className="text-muted-foreground">
            Acompanhe a localização e os horários de check-in/out dos freelancers.
          </p>
        </div>
        <div className="w-full md:w-[350px]">
          <Select value={selectedContrato} onValueChange={setSelectedContrato} disabled={loading}>
            <SelectTrigger className="w-full bg-background border-input">
              <SelectValue placeholder="Selecione um contrato" />
            </SelectTrigger>
            <SelectContent>
              {contratos.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Nenhum contrato ativo
                </div>
              ) : (
                contratos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.vaga?.titulo} - {c.freelancer?.nome_completo}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden flex flex-col h-[500px] lg:h-[650px] shadow-md border-border">
          <CardHeader className="bg-primary/5 pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <MapIcon className="h-5 w-5" />
              Visualização no Mapa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative bg-muted/20">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                  Carregando dados geográficos...
                </p>
              </div>
            ) : null}

            {hasApiKey ? (
              <div ref={mapRef} className="w-full h-full" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <img
                  src="https://img.usecurling.com/p/800/600?q=map&color=blue"
                  alt="Mapa Indisponível"
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.03]"
                />
                <div className="relative z-10 bg-background/90 p-8 rounded-xl shadow-lg border border-border/50 backdrop-blur-md max-w-md animate-fade-in-up">
                  <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Mapa Indisponível</h3>
                  <p className="text-sm text-muted-foreground">
                    A visualização do mapa interativo requer a chave de configuração da API. As
                    coordenadas registradas estão disponíveis na listagem ao lado.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[500px] lg:h-[650px] shadow-md border-border">
          <CardHeader className="bg-primary/5 pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Histórico de Registros
            </CardTitle>
            <CardDescription className="font-medium">
              {checkins.length}{' '}
              {checkins.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-muted/5">
            <ScrollArea className="h-full">
              <div className="p-5 space-y-5">
                {checkins.length === 0 && !loading ? (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center h-[300px]">
                    <Clock className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium">
                      Nenhum check-in registrado para este contrato ainda.
                    </p>
                  </div>
                ) : (
                  checkins.map((checkin) => (
                    <div
                      key={checkin.id}
                      className="relative pl-7 pb-5 border-l-2 border-primary/20 last:border-l-transparent last:pb-0 group"
                    >
                      <div
                        className={`absolute -left-[11px] top-0 h-5 w-5 rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-110 ${checkin.tipo === 'Entrada' ? 'bg-green-500' : 'bg-red-500'}`}
                      />

                      <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm space-y-3 transition-all hover:shadow-md hover:border-primary/30">
                        <div className="flex justify-between items-start">
                          <Badge
                            variant={checkin.tipo === 'Entrada' ? 'outline' : 'destructive'}
                            className={`text-xs px-2.5 py-0.5 ${checkin.tipo === 'Entrada' ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' : ''}`}
                          >
                            {checkin.tipo === 'Entrada' ? (
                              <LogIn className="w-3.5 h-3.5 mr-1.5" />
                            ) : (
                              <LogOut className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            {checkin.tipo}
                          </Badge>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                            {format(new Date(checkin.data_hora), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 mt-2">
                          <div className="bg-muted p-1.5 rounded-md">
                            <User className="h-4 w-4 text-primary shrink-0" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {checkin.freelancer?.nome_completo}
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5 mt-2 bg-muted/40 p-2.5 rounded-md">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span
                            className="text-[13px] text-muted-foreground leading-snug line-clamp-2"
                            title={
                              checkin.endereco_aproximado ||
                              `Lat: ${checkin.latitude}, Lng: ${checkin.longitude}`
                            }
                          >
                            {checkin.endereco_aproximado ||
                              `Lat: ${checkin.latitude}, Lng: ${checkin.longitude}`}
                          </span>
                        </div>

                        <div className="text-[11px] font-medium text-muted-foreground/80 mt-3 pt-3 w-full text-right border-t border-border/40">
                          {format(new Date(checkin.data_hora), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
