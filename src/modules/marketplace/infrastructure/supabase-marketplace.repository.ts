import { supabase } from "../../../integrations/supabase/client";
import type {
  AdminMetrics,
  Booking,
  ProDashboard,
  ProSession,
  Trainer,
} from "../domain/marketplace.types";
import type { MarketplaceRepository } from "../application/marketplace.ports";

type TrainerRow = {
  id: string;
  nome_completo: string;
  especialidades: string[] | null;
  avaliacao: number | null;
  preco_por_hora: number | null;
  premium: boolean;
  bairro: string | null;
  cidade: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Location = { latitude: number | null; longitude: number | null };

export class SupabaseMarketplaceRepository implements MarketplaceRepository {
  private async getUserLocation(userId: string | null): Promise<Location | null> {
    if (!userId) return null;
    const { data } = await supabase
      .from("perfis_cliente")
      .select("latitude, longitude")
      .eq("usuario_id", userId)
      .maybeSingle();
    return data ?? null;
  }

  private async getClientProfileId(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from("perfis_cliente")
      .select("id")
      .eq("usuario_id", userId)
      .maybeSingle();
    return data?.id ?? null;
  }

  private mapTrainer(row: TrainerRow, location: Location | null): Trainer {
    return {
      id: row.id,
      name: row.nome_completo,
      specialties: row.especialidades ?? [],
      rating: Number(row.avaliacao ?? 0),
      distanceKm: this.distanceInKm(row, location),
      pricePerHour: Number(row.preco_por_hora ?? 0),
      boosted: Boolean(row.premium),
      neighborhood: row.bairro ?? "",
      city: row.cidade ?? "",
      latitude: row.latitude ?? null,
      longitude: row.longitude ?? null,
      photo: null,
    };
  }

  private distanceInKm(row: TrainerRow, location: Location | null): number | null {
    if (
      !location ||
      location.latitude == null ||
      location.longitude == null ||
      row.latitude == null ||
      row.longitude == null
    ) {
      return null;
    }
    return this.haversineKm(row.latitude, row.longitude, location.latitude, location.longitude);
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const earthRadiusKm = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async listTrainers(userId: string | null): Promise<Trainer[]> {
    const { data, error } = await supabase
      .from("perfis_personal_trainer")
      .select("*")
      .eq("ativo", true)
      .order("premium", { ascending: false })
      .order("avaliacao", { ascending: false });
    if (error) throw error;

    const location = await this.getUserLocation(userId);
    return (data ?? []).map((row) => this.mapTrainer(row as TrainerRow, location));
  }

  async getTrainer(trainerId: string, userId: string | null): Promise<Trainer | null> {
    const { data, error } = await supabase
      .from("perfis_personal_trainer")
      .select("*")
      .eq("id", trainerId)
      .eq("ativo", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const location = await this.getUserLocation(userId);
    return this.mapTrainer(data as TrainerRow, location);
  }

  async listFavorites(userId: string): Promise<Trainer[]> {
    const { data, error } = await supabase
      .from("favoritos")
      .select("personal_id, perfis_personal_trainer(*)")
      .order("criado_em", { ascending: false });
    if (error) throw error;

    const location = await this.getUserLocation(userId);
    return (data ?? [])
      .map((row) => row.perfis_personal_trainer as unknown as TrainerRow | null)
      .filter((profile): profile is TrainerRow => profile != null)
      .map((profile) => this.mapTrainer(profile, location));
  }

  async listBookings(userId: string): Promise<Booking[]> {
    const clienteId = await this.getClientProfileId(userId);
    if (!clienteId) return [];

    const { data, error } = await supabase
      .from("agendamentos")
      .select("id, agendado_para, status, total, perfis_personal_trainer(id, nome_completo)")
      .eq("cliente_id", clienteId)
      .order("agendado_para", { ascending: true });
    if (error) throw error;

    return (data ?? []).map((row) => {
      const trainer = row.perfis_personal_trainer as unknown as { id: string; nome_completo: string } | null;
      return {
        id: row.id,
        trainerId: trainer?.id ?? "",
        trainerName: trainer?.nome_completo ?? "Removido",
        datetime: row.agendado_para,
        status: row.status as Booking["status"],
        value: Number(row.total ?? 0),
      };
    });
  }

  private async getTrainerProfileId(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from("perfis_personal_trainer")
      .select("id")
      .eq("usuario_id", userId)
      .maybeSingle();
    return data?.id ?? null;
  }

  async listProDashboard(userId: string): Promise<ProDashboard | null> {
    const { data: profile, error: profileError } = await supabase
      .from("perfis_personal_trainer")
      .select("*")
      .eq("usuario_id", userId)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return null;

    const { data: carteira } = await supabase
      .from("carteiras")
      .select("saldo_disponivel, saldo_pendente")
      .eq("usuario_id", userId)
      .maybeSingle();

    const { count: treinosConcluidos } = await supabase
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .eq("personal_id", profile.id)
      .eq("status", "concluido");

    const { data: proximos } = await supabase
      .from("agendamentos")
      .select("id, agendado_para, status, total, perfis_cliente(nome_completo)")
      .eq("personal_id", profile.id)
      .in("status", ["pendente", "confirmado", "em_andamento"])
      .gte("agendado_para", new Date().toISOString())
      .order("agendado_para", { ascending: true })
      .limit(5);

    const sessions: ProSession[] = (proximos ?? []).map((row) => {
      const cliente = row.perfis_cliente as unknown as { nome_completo: string } | null;
      return {
        id: row.id,
        clienteNome: cliente?.nome_completo ?? "Cliente",
        datetime: row.agendado_para,
        status: row.status as ProSession["status"],
        value: Number(row.total ?? 0),
      };
    });

    return {
      nomeCompleto: profile.nome_completo,
      avaliacao: Number(profile.avaliacao ?? 0),
      saldoDisponivel: Number(carteira?.saldo_disponivel ?? 0),
      saldoPendente: Number(carteira?.saldo_pendente ?? 0),
      treinosConcluidos: treinosConcluidos ?? 0,
      proximosAtendimentos: sessions.length,
      proximos: sessions,
    };
  }

  async listProHistory(userId: string): Promise<ProSession[]> {
    const personalId = await this.getTrainerProfileId(userId);
    if (!personalId) return [];

    const { data, error } = await supabase
      .from("agendamentos")
      .select("id, agendado_para, status, total, perfis_cliente(nome_completo)")
      .eq("personal_id", personalId)
      .eq("status", "concluido")
      .order("agendado_para", { ascending: false });
    if (error) throw error;

    return (data ?? []).map((row) => {
      const cliente = row.perfis_cliente as unknown as { nome_completo: string } | null;
      return {
        id: row.id,
        clienteNome: cliente?.nome_completo ?? "Cliente",
        datetime: row.agendado_para,
        status: row.status as ProSession["status"],
        value: Number(row.total ?? 0),
      };
    });
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    const { data, error } = await supabase.rpc("get_admin_metrics");
    if (error) throw error;

    return {
      usuarios: Number(data?.usuarios ?? 0),
      crefPendentes: Number(data?.cref_pendentes ?? 0),
      chamadosAbertos: Number(data?.chamados_abertos ?? 0),
    };
  }

  async toggleFavorite(userId: string, trainerId: string): Promise<boolean> {
    const clienteId = await this.getClientProfileId(userId);
    if (!clienteId) return false;

    const { data: existing } = await supabase
      .from("favoritos")
      .select("id")
      .eq("cliente_id", clienteId)
      .eq("personal_id", trainerId)
      .maybeSingle();

    if (existing) {
      await supabase.from("favoritos").delete().eq("id", existing.id);
      return false;
    }

    const { error } = await supabase.from("favoritos").insert({ cliente_id: clienteId, personal_id: trainerId });
    if (error) throw error;
    return true;
  }
}