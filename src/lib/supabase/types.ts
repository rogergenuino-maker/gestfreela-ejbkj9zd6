// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      avaliacoes_rating: {
        Row: {
          comentario: string | null
          contrato_id: string | null
          created_at: string | null
          empresa_id: string | null
          freelancer_id: string | null
          id: string
          nota_estrelas: number | null
        }
        Insert: {
          comentario?: string | null
          contrato_id?: string | null
          created_at?: string | null
          empresa_id?: string | null
          freelancer_id?: string | null
          id?: string
          nota_estrelas?: number | null
        }
        Update: {
          comentario?: string | null
          contrato_id?: string | null
          created_at?: string | null
          empresa_id?: string | null
          freelancer_id?: string | null
          id?: string
          nota_estrelas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'avaliacoes_rating_contrato_id_fkey'
            columns: ['contrato_id']
            isOneToOne: false
            referencedRelation: 'contratos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'avaliacoes_rating_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'avaliacoes_rating_freelancer_id_fkey'
            columns: ['freelancer_id']
            isOneToOne: false
            referencedRelation: 'freelancers'
            referencedColumns: ['id']
          },
        ]
      }
      checkins_operacionais: {
        Row: {
          contrato_id: string | null
          data_hora: string | null
          freelancer_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          tipo: string | null
        }
        Insert: {
          contrato_id?: string | null
          data_hora?: string | null
          freelancer_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          tipo?: string | null
        }
        Update: {
          contrato_id?: string | null
          data_hora?: string | null
          freelancer_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'checkins_operacionais_contrato_id_fkey'
            columns: ['contrato_id']
            isOneToOne: false
            referencedRelation: 'contratos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'checkins_operacionais_freelancer_id_fkey'
            columns: ['freelancer_id']
            isOneToOne: false
            referencedRelation: 'freelancers'
            referencedColumns: ['id']
          },
        ]
      }
      contratos: {
        Row: {
          created_at: string
          data_assinatura: string | null
          empresa_id: string | null
          freelancer_id: string | null
          id: string
          penalidade_aplicada: boolean | null
          status: string
          vaga_id: string | null
          valor_estornado: number | null
        }
        Insert: {
          created_at?: string
          data_assinatura?: string | null
          empresa_id?: string | null
          freelancer_id?: string | null
          id?: string
          penalidade_aplicada?: boolean | null
          status?: string
          vaga_id?: string | null
          valor_estornado?: number | null
        }
        Update: {
          created_at?: string
          data_assinatura?: string | null
          empresa_id?: string | null
          freelancer_id?: string | null
          id?: string
          penalidade_aplicada?: boolean | null
          status?: string
          vaga_id?: string | null
          valor_estornado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'contratos_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contratos_freelancer_id_fkey'
            columns: ['freelancer_id']
            isOneToOne: false
            referencedRelation: 'freelancers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contratos_vaga_id_fkey'
            columns: ['vaga_id']
            isOneToOne: false
            referencedRelation: 'vagas'
            referencedColumns: ['id']
          },
        ]
      }
      documentos_validacao: {
        Row: {
          arquivo_url: string | null
          comentario: string | null
          created_at: string | null
          data_validade: string | null
          freelancer_id: string | null
          id: string
          status_verificacao: string | null
          tipo_documento: string
        }
        Insert: {
          arquivo_url?: string | null
          comentario?: string | null
          created_at?: string | null
          data_validade?: string | null
          freelancer_id?: string | null
          id?: string
          status_verificacao?: string | null
          tipo_documento: string
        }
        Update: {
          arquivo_url?: string | null
          comentario?: string | null
          created_at?: string | null
          data_validade?: string | null
          freelancer_id?: string | null
          id?: string
          status_verificacao?: string | null
          tipo_documento?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documentos_validacao_freelancer_id_fkey'
            columns: ['freelancer_id']
            isOneToOne: false
            referencedRelation: 'freelancers'
            referencedColumns: ['id']
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          created_at: string
          descricao: string | null
          email: string | null
          endereco: string | null
          id: string
          logo: string | null
          nome_empresa: string
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo?: string | null
          nome_empresa: string
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo?: string | null
          nome_empresa?: string
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'empresas_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      freelancers: {
        Row: {
          cpf: string | null
          created_at: string
          descricao: string | null
          email: string | null
          experiencia_anos: number | null
          formacao: string | null
          foto_perfil: string | null
          id: string
          nome_completo: string
          taxa_diaria: number | null
          taxa_hora: number | null
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          experiencia_anos?: number | null
          formacao?: string | null
          foto_perfil?: string | null
          id?: string
          nome_completo: string
          taxa_diaria?: number | null
          taxa_hora?: number | null
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          experiencia_anos?: number | null
          formacao?: string | null
          foto_perfil?: string | null
          id?: string
          nome_completo?: string
          taxa_diaria?: number | null
          taxa_hora?: number | null
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'freelancers_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      logs_aceite_digital: {
        Row: {
          contrato_id: string | null
          data_hora_aceite: string | null
          freelancer_id: string | null
          id: string
          ip_dispositivo: string | null
        }
        Insert: {
          contrato_id?: string | null
          data_hora_aceite?: string | null
          freelancer_id?: string | null
          id?: string
          ip_dispositivo?: string | null
        }
        Update: {
          contrato_id?: string | null
          data_hora_aceite?: string | null
          freelancer_id?: string | null
          id?: string
          ip_dispositivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'logs_aceite_digital_contrato_id_fkey'
            columns: ['contrato_id']
            isOneToOne: false
            referencedRelation: 'contratos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'logs_aceite_digital_freelancer_id_fkey'
            columns: ['freelancer_id']
            isOneToOne: false
            referencedRelation: 'freelancers'
            referencedColumns: ['id']
          },
        ]
      }
      perfis: {
        Row: {
          created_at: string | null
          data_aceite_lgpd: string | null
          id: string
          lgpd_aceito: boolean | null
          status_conta: string | null
        }
        Insert: {
          created_at?: string | null
          data_aceite_lgpd?: string | null
          id: string
          lgpd_aceito?: boolean | null
          status_conta?: string | null
        }
        Update: {
          created_at?: string | null
          data_aceite_lgpd?: string | null
          id?: string
          lgpd_aceito?: boolean | null
          status_conta?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_type?: string
        }
        Relationships: []
      }
      vagas: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          empresa_id: string | null
          endereco_vaga: string | null
          escopo_trabalho: string | null
          id: string
          natureza: string | null
          status: string | null
          titulo: string
          valor_remuneracao: number | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          empresa_id?: string | null
          endereco_vaga?: string | null
          escopo_trabalho?: string | null
          id?: string
          natureza?: string | null
          status?: string | null
          titulo: string
          valor_remuneracao?: number | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          empresa_id?: string | null
          endereco_vaga?: string | null
          escopo_trabalho?: string | null
          id?: string
          natureza?: string | null
          status?: string | null
          titulo?: string
          valor_remuneracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'vagas_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: avaliacoes_rating
//   id: uuid (not null, default: gen_random_uuid())
//   contrato_id: uuid (nullable)
//   empresa_id: uuid (nullable)
//   freelancer_id: uuid (nullable)
//   nota_estrelas: integer (nullable)
//   comentario: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: checkins_operacionais
//   id: uuid (not null, default: gen_random_uuid())
//   contrato_id: uuid (nullable)
//   freelancer_id: uuid (nullable)
//   tipo: text (nullable)
//   latitude: numeric (nullable)
//   longitude: numeric (nullable)
//   data_hora: timestamp with time zone (nullable, default: now())
// Table: contratos
//   id: uuid (not null, default: gen_random_uuid())
//   empresa_id: uuid (nullable)
//   freelancer_id: uuid (nullable)
//   status: text (not null, default: 'ativo'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   vaga_id: uuid (nullable)
//   data_assinatura: timestamp with time zone (nullable)
//   penalidade_aplicada: boolean (nullable, default: false)
//   valor_estornado: numeric (nullable, default: 0)
// Table: documentos_validacao
//   id: uuid (not null, default: gen_random_uuid())
//   freelancer_id: uuid (nullable)
//   tipo_documento: text (not null)
//   arquivo_url: text (nullable)
//   data_validade: date (nullable)
//   status_verificacao: text (nullable, default: 'pendente'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   comentario: text (nullable)
// Table: empresas
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   nome_empresa: text (not null)
//   cnpj: text (nullable)
//   descricao: text (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   endereco: text (nullable)
//   logo: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: freelancers
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   nome_completo: text (not null)
//   cpf: text (nullable)
//   formacao: text (nullable)
//   experiencia_anos: integer (nullable)
//   descricao: text (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   foto_perfil: text (nullable)
//   taxa_hora: numeric (nullable)
//   taxa_diaria: numeric (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: logs_aceite_digital
//   id: uuid (not null, default: gen_random_uuid())
//   freelancer_id: uuid (nullable)
//   contrato_id: uuid (nullable)
//   ip_dispositivo: text (nullable)
//   data_hora_aceite: timestamp with time zone (nullable, default: now())
// Table: perfis
//   id: uuid (not null)
//   lgpd_aceito: boolean (nullable, default: false)
//   data_aceite_lgpd: timestamp with time zone (nullable)
//   status_conta: text (nullable, default: 'ativo'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: users
//   id: uuid (not null)
//   email: text (not null)
//   user_type: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: vagas
//   id: uuid (not null, default: gen_random_uuid())
//   empresa_id: uuid (nullable)
//   titulo: text (not null)
//   natureza: text (nullable)
//   escopo_trabalho: text (nullable)
//   endereco_vaga: text (nullable)
//   data_inicio: timestamp with time zone (nullable)
//   data_fim: timestamp with time zone (nullable)
//   valor_remuneracao: numeric (nullable)
//   status: text (nullable, default: 'aberta'::text)
//   created_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: avaliacoes_rating
//   FOREIGN KEY avaliacoes_rating_contrato_id_fkey: FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE CASCADE
//   FOREIGN KEY avaliacoes_rating_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   FOREIGN KEY avaliacoes_rating_freelancer_id_fkey: FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacoes_rating_pkey: PRIMARY KEY (id)
// Table: checkins_operacionais
//   FOREIGN KEY checkins_operacionais_contrato_id_fkey: FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE CASCADE
//   FOREIGN KEY checkins_operacionais_freelancer_id_fkey: FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE
//   PRIMARY KEY checkins_operacionais_pkey: PRIMARY KEY (id)
// Table: contratos
//   FOREIGN KEY contratos_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   FOREIGN KEY contratos_freelancer_id_fkey: FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE
//   PRIMARY KEY contratos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contratos_vaga_id_fkey: FOREIGN KEY (vaga_id) REFERENCES vagas(id) ON DELETE SET NULL
// Table: documentos_validacao
//   FOREIGN KEY documentos_validacao_freelancer_id_fkey: FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE
//   PRIMARY KEY documentos_validacao_pkey: PRIMARY KEY (id)
// Table: empresas
//   PRIMARY KEY empresas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY empresas_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: freelancers
//   PRIMARY KEY freelancers_pkey: PRIMARY KEY (id)
//   FOREIGN KEY freelancers_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: logs_aceite_digital
//   FOREIGN KEY logs_aceite_digital_contrato_id_fkey: FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE CASCADE
//   FOREIGN KEY logs_aceite_digital_freelancer_id_fkey: FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE
//   PRIMARY KEY logs_aceite_digital_pkey: PRIMARY KEY (id)
// Table: perfis
//   FOREIGN KEY perfis_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY perfis_pkey: PRIMARY KEY (id)
// Table: users
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
// Table: vagas
//   FOREIGN KEY vagas_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   PRIMARY KEY vagas_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: avaliacoes_rating
//   Policy "avaliacoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "avaliacoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
// Table: checkins_operacionais
//   Policy "checkins_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "checkins_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (contrato_id IN ( SELECT contratos.id    FROM contratos   WHERE (contratos.empresa_id IN ( SELECT empresas.id            FROM empresas           WHERE (empresas.user_id = auth.uid()))))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
// Table: contratos
//   Policy "contratos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "contratos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "contratos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "contratos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
// Table: documentos_validacao
//   Policy "docs_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "docs_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "docs_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "docs_select_empresa" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "docs_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "docs_update_empresa" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//     WITH CHECK: ((EXISTS ( SELECT 1    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
// Table: empresas
//   Policy "empresas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "empresas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "empresas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "empresas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
// Table: freelancers
//   Policy "freelancers_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "freelancers_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "freelancers_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))) OR (EXISTS ( SELECT 1    FROM empresas   WHERE (empresas.user_id = auth.uid()))))
//   Policy "freelancers_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
// Table: logs_aceite_digital
//   Policy "logs_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "logs_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((freelancer_id IN ( SELECT freelancers.id    FROM freelancers   WHERE (freelancers.user_id = auth.uid()))) OR (contrato_id IN ( SELECT contratos.id    FROM contratos   WHERE (contratos.empresa_id IN ( SELECT empresas.id            FROM empresas           WHERE (empresas.user_id = auth.uid()))))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
// Table: perfis
//   Policy "perfis_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (id = auth.uid())
//   Policy "perfis_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((id = auth.uid()) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "perfis_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
// Table: users
//   Policy "auth_all_users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: vagas
//   Policy "vagas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "vagas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "vagas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((status = 'aberta'::text) OR (empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))
//   Policy "vagas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((empresa_id IN ( SELECT empresas.id    FROM empresas   WHERE (empresas.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.user_type = 'admin'::text)))))

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.users (id, email, user_type)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'user_type', 'freelancer')
//     );
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//
