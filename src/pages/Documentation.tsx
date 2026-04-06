import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Check,
  Copy,
  BookOpen,
  Terminal,
  FolderTree,
  FileKey,
  GitPullRequest,
  Scale,
} from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Copiado para a área de transferência!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg bg-slate-900 border border-blue-900/30 overflow-hidden my-6 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/50 border-b border-slate-800">
        <span className="text-xs font-medium text-slate-400">{title || 'Código'}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1.5 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 mr-1.5" />
          )}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-50 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

export default function Documentation() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documentação</h1>
      </div>
      <p className="text-slate-500 mb-8 text-lg">
        Guia completo para desenvolvedores e colaboradores do GestFreela.
      </p>

      <Tabs defaultValue="install" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6 gap-6">
            <TabsTrigger
              value="install"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none pb-3 pt-2 px-1 font-medium text-slate-500 transition-all"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Instalação Local
            </TabsTrigger>
            <TabsTrigger
              value="structure"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none pb-3 pt-2 px-1 font-medium text-slate-500 transition-all"
            >
              <FolderTree className="h-4 w-4 mr-2" />
              Estrutura de Pastas
            </TabsTrigger>
            <TabsTrigger
              value="env"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none pb-3 pt-2 px-1 font-medium text-slate-500 transition-all"
            >
              <FileKey className="h-4 w-4 mr-2" />
              Variáveis de Ambiente
            </TabsTrigger>
            <TabsTrigger
              value="contribute"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none pb-3 pt-2 px-1 font-medium text-slate-500 transition-all"
            >
              <GitPullRequest className="h-4 w-4 mr-2" />
              Guia de Contribuição
            </TabsTrigger>
            <TabsTrigger
              value="license"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none pb-3 pt-2 px-1 font-medium text-slate-500 transition-all"
            >
              <Scale className="h-4 w-4 mr-2" />
              Licença MIT
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent
          value="install"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="border-blue-100 shadow-sm bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-50 pb-4">
              <CardTitle className="text-blue-900">Instalação Local</CardTitle>
              <CardDescription className="text-blue-600/80 text-base mt-1">
                Siga os passos abaixo para baixar e rodar o projeto em sua máquina local.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-blue max-w-none text-slate-700">
                <p className="mb-4">
                  Para começar a desenvolver no GestFreela, você precisará ter o{' '}
                  <strong>Node.js</strong> (versão 18+) e o <strong>Git</strong> instalados em seu
                  ambiente.
                </p>
                <CodeBlock
                  title="Terminal (Bash / Zsh)"
                  code={`# 1. Clone o repositório oficial
git clone https://github.com/rogergenuino-maker/Gestfreela.git

# 2. Entre no diretório do projeto
cd Gestfreela

# 3. Instale as dependências via NPM
npm install

# 4. Inicie o servidor de desenvolvimento local
npm run dev`}
                />
                <p className="mt-4">
                  Após executar <code>npm run dev</code>, a aplicação estará disponível no seu
                  navegador, geralmente acessível através do endereço{' '}
                  <code>http://localhost:5173</code>.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="structure"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="border-blue-100 shadow-sm bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-50 pb-4">
              <CardTitle className="text-blue-900">Estrutura de Pastas</CardTitle>
              <CardDescription className="text-blue-600/80 text-base mt-1">
                Visão geral da arquitetura de arquivos e diretórios do repositório.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-blue max-w-none text-slate-700">
                <p className="mb-4">
                  O projeto segue um padrão de organização modular para facilitar a escalabilidade,
                  separando responsabilidades de UI, lógica, roteamento e backend.
                </p>
                <CodeBlock
                  title="Árvore de Diretórios"
                  code={`Gestfreela/
├── public/             # Assets públicos (imagens estáticas, favicon, etc)
├── src/                # Código-fonte principal da aplicação React (Frontend)
│   ├── components/     # Componentes de UI reutilizáveis (Shadcn) e layouts
│   ├── hooks/          # Hooks customizados do React
│   ├── lib/            # Utilitários e configurações
│   ├── pages/          # Telas principais correspondentes às rotas da aplicação
│   └── services/       # Abstração para chamadas à API e lógica de negócios externa
├── supabase/           # Configurações de backend
├── .env.local          # Variáveis de ambiente locais (não versionado)
└── package.json        # Manifesto do projeto contendo dependências e scripts`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-blue-100 shadow-sm bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-50 pb-4">
              <CardTitle className="text-blue-900">Variáveis de Ambiente</CardTitle>
              <CardDescription className="text-blue-600/80 text-base mt-1">
                Configurações genéricas para a aplicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-blue max-w-none text-slate-700">
                <p className="mb-4">
                  Crie um arquivo chamado <code>.env.local</code> na raiz do seu projeto e adicione
                  as variáveis necessárias. Lembre-se: este arquivo nunca deve ser commitado.
                </p>
                <CodeBlock
                  title="Arquivo: .env.local"
                  code={`# Configurações gerais da aplicação
VITE_APP_NAME="GestFreela"
VITE_APP_VERSION="1.0.0"`}
                />
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
                  <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center">
                    <FileKey className="h-4 w-4 mr-2" /> Aviso de Segurança
                  </h4>
                  <p className="text-sm text-blue-800 m-0">
                    Mantenha suas variáveis de ambiente seguras. Nunca adicione valores reais de
                    senhas ou chaves de API diretamente no código-fonte ou repita-os em ambientes
                    não seguros.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="contribute"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="border-blue-100 shadow-sm bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-50 pb-4">
              <CardTitle className="text-blue-900">Guia de Contribuição</CardTitle>
              <CardDescription className="text-blue-600/80 text-base mt-1">
                Boas práticas para versionamento, criação de branches e submissão de código.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-blue max-w-none text-slate-700">
                <p className="mb-4">
                  Para manter a qualidade e a organização do nosso repositório, adotamos o{' '}
                  <strong>Feature Branch Workflow</strong> e seguimos padrões de commits
                  convencionais.
                </p>
                <CodeBlock
                  title="Fluxo de Trabalho Git"
                  code={`# 1. Garanta que você está na branch principal atualizada
git checkout main
git pull origin main

# 2. Crie uma nova branch para a sua alteração
git checkout -b feature/nome-da-sua-funcionalidade
# Prefixe branches com feature/, bugfix/, hotfix/ ou docs/

# 3. Trabalhe no código, salve suas alterações e adicione-as ao staging
git add .

# 4. Faça o commit utilizando Conventional Commits
git commit -m "feat: adiciona nova integração com meios de pagamento"
# Exemplos: feat: (novas funcionalidades), fix: (correção de bugs)

# 5. Envie sua branch para o repositório remoto no GitHub
git push origin feature/nome-da-sua-funcionalidade

# 6. Acesse o GitHub e abra um Pull Request apontando para a branch main`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="license"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="border-blue-100 shadow-sm bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-50 pb-4">
              <CardTitle className="text-blue-900">Licença MIT</CardTitle>
              <CardDescription className="text-blue-600/80 text-base mt-1">
                Termos de uso, modificação e distribuição do código-fonte.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CodeBlock
                title="LICENSE"
                code={`MIT License

Copyright (c) 2024 Gestfreela

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
