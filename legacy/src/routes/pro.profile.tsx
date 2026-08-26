import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Upload, X, Repeat, ChevronRight, ShieldCheck, Clock } from "lucide-react";
import { useState } from "react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODALITIES } from "@/lib/mock-data";
import {
  useStored,
  KEYS,
  DEFAULT_PRO_PROFILE,
  DEFAULT_CREF_VALIDATION,
  EQUIPMENT_PRESETS,
  pushNotification,
  type ProProfile,
  type Availability,
  type CrefValidation,
  type CustomModalityRequest,
  type TrainerEquipment,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/profile")({
  component: ProProfilePage,
  head: () => ({ meta: [{ title: "Perfil profissional — MyOwnTraining" }] }),
});

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function ProProfilePage() {
  const [stored, setStored] = useStored<ProProfile>(KEYS.proProfile, DEFAULT_PRO_PROFILE);
  const [cref] = useStored<CrefValidation>(KEYS.crefValidation, DEFAULT_CREF_VALIDATION);
  const [customMods, setCustomMods] = useStored<CustomModalityRequest[]>(KEYS.customModalities, []);
  const [equipment, setEquipment] = useStored<TrainerEquipment>(KEYS.trainerEquipment, { trainerId: "me-pro", items: [], updatedAt: Date.now() });
  const [data, setData] = useState<ProProfile>(stored);
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [extraEquip, setExtraEquip] = useState("");

  const approvedCustom = customMods.filter((m) => m.status === "approved").map((m) => m.name);
  const myPending = customMods.filter((m) => m.trainerId === "me" && m.status === "pending").map((m) => m.name);
  const allModalities = Array.from(new Set([...MODALITIES, ...approvedCustom]));

  const submitOther = () => {
    const name = otherText.trim();
    if (!name) return;
    if (allModalities.includes(name) || myPending.includes(name)) {
      toast.error("Modalidade já existente ou pendente");
      return;
    }
    setCustomMods([
      ...customMods,
      {
        id: `cm-${Date.now()}`,
        name,
        trainerId: "me",
        trainerName: data.name,
        status: "pending",
        createdAt: Date.now(),
      },
    ]);
    pushNotification({ audience: "trainer", title: "Modalidade enviada", body: `"${name}" aguarda aprovação do admin.` });
    toast.success("Solicitação enviada ao admin");
    setOtherText("");
    setOtherOpen(false);
  };


  const upd = <K extends keyof ProProfile>(k: K, v: ProProfile[K]) =>
    setData({ ...data, [k]: v });

  const toggleSpec = (m: string) =>
    upd(
      "specialties",
      data.specialties.includes(m)
        ? data.specialties.filter((x) => x !== m)
        : [...data.specialties, m],
    );

  const addAvailability = () =>
    upd("availability", [...data.availability, { day: "Seg", from: "08:00", to: "18:00" }]);

  const updAvailability = (i: number, patch: Partial<Availability>) =>
    upd(
      "availability",
      data.availability.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    );

  const removeAvailability = (i: number) =>
    upd("availability", data.availability.filter((_, idx) => idx !== i));

  const onUploadMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((f) => URL.createObjectURL(f));
    upd("media", [...data.media, ...urls]);
  };

  const removeMedia = (idx: number) =>
    upd("media", data.media.filter((_, i) => i !== idx));

  const save = () => {
    setStored(data);
    toast.success("Perfil atualizado");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="mb-4 text-xl font-bold">Perfil profissional</h1>

        <Link to="/pro/recurring" className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <Repeat className="h-5 w-5 text-[var(--brand-black)]" />
          <span className="flex-1 text-sm font-semibold">Agenda recorrente</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <div className="space-y-4">
          <Field label="Nome completo">
            <Input className="h-11 rounded-xl" value={data.name} onChange={(e) => upd("name", e.target.value)} />
          </Field>
          <Field label="Data de nascimento">
            <Input type="date" className="h-11 rounded-xl" value={data.birth} onChange={(e) => upd("birth", e.target.value)} />
          </Field>
          <Field label="CREF">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-muted px-3 text-sm">
              <span className="flex-1 font-medium">{cref.number}</span>
              {cref.status === "approved" ? (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  <ShieldCheck className="h-3 w-3" /> Validado
                </span>
              ) : cref.status === "pending" ? (
                <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">
                  <Clock className="h-3 w-3" /> Pendente
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Rejeitado</span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              CREF bloqueado para edição. Para alterar, envie uma solicitação de revisão ao admin.
            </p>
          </Field>
          <Field label="Telefone">
            <Input className="h-11 rounded-xl" value={data.phone} onChange={(e) => upd("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" className="h-11 rounded-xl" value={data.email} onChange={(e) => upd("email", e.target.value)} />
          </Field>
          <Field label="Endereço">
            <Input className="h-11 rounded-xl" value={data.address} onChange={(e) => upd("address", e.target.value)} />
          </Field>
          <Field label="Descrição profissional">
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) => upd("description", e.target.value)}
              className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
            />
          </Field>
          <Field label="Formação acadêmica">
            <Input className="h-11 rounded-xl" value={data.education} onChange={(e) => upd("education", e.target.value)} />
          </Field>

          <Field label="Especialidades">
            <div className="flex flex-wrap gap-2">
              {allModalities.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleSpec(m)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    data.specialties.includes(m)
                      ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOtherOpen((v) => !v)}
                className="rounded-full border border-dashed border-[var(--brand-black)] bg-card px-3 py-1.5 text-xs font-medium text-[var(--brand-black)]"
              >
                + Outra modalidade
              </button>
            </div>
            {otherOpen && (
              <div className="mt-2 flex gap-2">
                <Input
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Ex: Treinamento para escalada"
                  className="h-10 flex-1 rounded-xl"
                />
                <Button onClick={submitOther} className="h-10 rounded-xl bg-[var(--brand-yellow)] text-xs font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                  Enviar
                </Button>
              </div>
            )}
            {myPending.length > 0 && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Aguardando aprovação: {myPending.join(", ")}
              </p>
            )}
          </Field>

          <Field label="Equipamentos disponíveis">
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([...EQUIPMENT_PRESETS, ...equipment.items])).map((eq) => {
                const active = equipment.items.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() =>
                      setEquipment({
                        ...equipment,
                        items: active ? equipment.items.filter((x) => x !== eq) : [...equipment.items, eq],
                        updatedAt: Date.now(),
                      })
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      active
                        ? "border-[var(--brand-yellow)] bg-[var(--brand-yellow)] text-[var(--brand-black)]"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={extraEquip}
                onChange={(e) => setExtraEquip(e.target.value)}
                placeholder="Outro equipamento"
                className="h-10 flex-1 rounded-xl"
              />
              <Button
                type="button"
                onClick={() => {
                  const v = extraEquip.trim();
                  if (!v) return;
                  if (equipment.items.includes(v)) { toast.error("Já adicionado"); return; }
                  setEquipment({ ...equipment, items: [...equipment.items, v], updatedAt: Date.now() });
                  setExtraEquip("");
                }}
                className="h-10 rounded-xl bg-[var(--brand-black)] text-xs font-semibold text-white"
              >
                Adicionar
              </Button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {equipment.items.length} {equipment.items.length === 1 ? "item selecionado" : "itens selecionados"}.
            </p>
          </Field>

          <Field label="Mídias / portfólio">
            <div className="grid grid-cols-3 gap-2">
              {data.media.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  {/\.(mp4|webm|mov)$/i.test(src) ? (
                    <video src={src} className="h-full w-full object-cover" />
                  ) : (
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-card text-xs text-muted-foreground">
                <Upload className="h-5 w-5" />
                Adicionar
                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={onUploadMedia} />
              </label>
            </div>
          </Field>

          <Field label="Valor da aula (R$)">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="80.00"
              className="h-11 rounded-xl"
              value={data.sessionPrice}
              onChange={(e) => upd("sessionPrice", Number(e.target.value) || 0)}
            />
            <p className="mt-1 text-xs text-muted-foreground">Ex: R$ {(data.sessionPrice || 0).toFixed(2).replace(".", ",")}</p>
          </Field>

          <Field label="Duração padrão da sessão (min)">
            <Input
              type="number"
              className="h-11 rounded-xl"
              value={data.sessionDuration}
              onChange={(e) => upd("sessionDuration", Number(e.target.value) || 0)}
            />
          </Field>

          <Field label="Disponibilidade">
            <div className="space-y-2">
              {data.availability.map((a, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
                  <select
                    value={a.day}
                    onChange={(e) => updAvailability(i, { day: e.target.value })}
                    className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
                  >
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input
                    type="time"
                    value={a.from}
                    onChange={(e) => updAvailability(i, { from: e.target.value })}
                    className="h-9 flex-1 rounded-lg border border-border bg-background px-2 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">—</span>
                  <input
                    type="time"
                    value={a.to}
                    onChange={(e) => updAvailability(i, { to: e.target.value })}
                    className="h-9 flex-1 rounded-lg border border-border bg-background px-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeAvailability(i)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAvailability}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-sm font-medium text-muted-foreground"
              >
                <Plus className="h-4 w-4" /> Adicionar horário
              </button>
            </div>
          </Field>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-3">
          <Button
            onClick={save}
            className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
          >
            Salvar alterações
          </Button>
        </div>
      </div>

      <ProBottomNav />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
