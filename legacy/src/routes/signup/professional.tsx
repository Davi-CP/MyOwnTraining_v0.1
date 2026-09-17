import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODALITIES } from "@/lib/mock-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup/professional")({
  component: SignupPro,
  head: () => ({ meta: [{ title: "Criar conta profissional — MyOwnTraining" }] }),
});

const SPECIALTIES = [
  "Musculação","Funcional","Corrida","Yoga","Alongamento","Natação",
  "Lutas","Gestantes","Terceira idade","Futevôlei","Aeróbico","Circuito",
];

const empty = {
  name: "", birth: "", gender: "", phone: "", email: "",
  doc: "", address: "", city: "", state: "",
  password: "", confirm: "",
  education: "", cref: "", sessionPrice: "", description: "",
};

function SignupPro() {
  const nav = useNavigate();
  const [d, setD] = useState(empty);
  const [photo, setPhoto] = useState<string | undefined>();
  const [media, setMedia] = useState<string[]>([]);
  const [specs, setSpecs] = useState<string[]>([]);
  const [crefDoc, setCrefDoc] = useState<{ url: string; name: string } | null>(null);
  const upd = (k: keyof typeof empty, v: string) => setD({ ...d, [k]: v });

  const toggleSpec = (s: string) =>
    setSpecs((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const onCref = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setCrefDoc({ url: URL.createObjectURL(f), name: f.name });
  };
  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setPhoto(URL.createObjectURL(f));
  };
  const onMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setMedia((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof typeof empty)[] = ["name","birth","gender","phone","email","doc","address","city","state","password","confirm","education","cref","sessionPrice","description"];
    for (const k of required) if (!d[k].trim()) return toast.error("Preencha todos os campos obrigatórios");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return toast.error("Email inválido");
    if (d.password.length < 6) return toast.error("Senha deve ter pelo menos 6 caracteres");
    if (d.password !== d.confirm) return toast.error("Senhas não conferem");
    if (!crefDoc) return toast.error("Envie o documento do CREF (imagem ou PDF)");
    if (specs.length === 0) return toast.error("Selecione ao menos uma especialidade");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: d.email,
      password: d.password,
      options: {
        emailRedirectTo: `${window.location.origin}/pro/dashboard`,
        data: {
          role: "pro",
          full_name: d.name,
          phone: d.phone,
          city: d.city,
          avatar_url: photo,
          bio: d.description,
          cref_number: d.cref,
          lesson_price: d.sessionPrice,
        },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Cadastro enviado. Aguardando validação do CREF.");
    nav({ to: "/pro/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-xl font-bold">Criar conta — Profissional</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Foto de perfil">
            <label className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card">
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
          </Field>

          <Field label="Nome completo *"><Input className="h-11 rounded-xl" value={d.name} onChange={(e) => upd("name", e.target.value)} /></Field>
          <Field label="Data de nascimento *"><Input type="date" className="h-11 rounded-xl" value={d.birth} onChange={(e) => upd("birth", e.target.value)} /></Field>
          <Field label="Sexo *">
            <select value={d.gender} onChange={(e) => upd("gender", e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm">
              <option value="">Selecione</option><option>Feminino</option><option>Masculino</option><option>Outro</option>
            </select>
          </Field>
          <Field label="Telefone *"><Input className="h-11 rounded-xl" value={d.phone} onChange={(e) => upd("phone", e.target.value)} /></Field>
          <Field label="Email *"><Input type="email" className="h-11 rounded-xl" value={d.email} onChange={(e) => upd("email", e.target.value)} /></Field>
          <Field label="CPF / Documento *"><Input className="h-11 rounded-xl" value={d.doc} onChange={(e) => upd("doc", e.target.value)} /></Field>
          <Field label="Endereço *"><Input className="h-11 rounded-xl" value={d.address} onChange={(e) => upd("address", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cidade *"><Input className="h-11 rounded-xl" value={d.city} onChange={(e) => upd("city", e.target.value)} /></Field>
            <Field label="Estado *"><Input className="h-11 rounded-xl" value={d.state} onChange={(e) => upd("state", e.target.value)} /></Field>
          </div>
          <Field label="Senha *"><Input type="password" className="h-11 rounded-xl" value={d.password} onChange={(e) => upd("password", e.target.value)} /></Field>
          <Field label="Confirmar senha *"><Input type="password" className="h-11 rounded-xl" value={d.confirm} onChange={(e) => upd("confirm", e.target.value)} /></Field>

          <Field label="Formação acadêmica *"><Input className="h-11 rounded-xl" value={d.education} onChange={(e) => upd("education", e.target.value)} /></Field>
          <Field label="CREF *"><Input className="h-11 rounded-xl" placeholder="000000-G/UF" value={d.cref} onChange={(e) => upd("cref", e.target.value)} /></Field>
          <Field label="Valor da aula (R$) *"><Input type="number" step="0.01" className="h-11 rounded-xl" value={d.sessionPrice} onChange={(e) => upd("sessionPrice", e.target.value)} /></Field>
          <Field label="Descrição profissional *">
            <textarea rows={3} value={d.description} onChange={(e) => upd("description", e.target.value)}
              className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-[var(--brand-yellow)]" />
          </Field>

          <Field label="Documento CREF (imagem ou PDF) *">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
              <FileText className="h-5 w-5" />
              {crefDoc ? <span className="truncate">{crefDoc.name}</span> : "Enviar arquivo (JPG, PNG ou PDF)"}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onCref} />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">O perfil ficará "pendente de validação" até a aprovação do administrador.</p>
          </Field>

          <Field label="Especialidades *">
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button key={s} type="button" onClick={() => toggleSpec(s)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    specs.includes(s)
                      ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white"
                      : "border-border bg-card text-muted-foreground"
                  }`}>{s}</button>
              ))}
            </div>
          </Field>

          <Field label="Portfólio (fotos e vídeos)">
            <div className="grid grid-cols-3 gap-2">
              {media.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
                  {/\.(mp4|webm|mov)$/i.test(src)
                    ? <video src={src} className="h-full w-full object-cover" />
                    : <img src={src} alt="" className="h-full w-full object-cover" />}
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-card text-xs text-muted-foreground">
                <Upload className="h-5 w-5" /> Adicionar
                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={onMedia} />
              </label>
            </div>
          </Field>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90 disabled:opacity-50">
            {loading ? "Enviando..." : "Enviar cadastro"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Modalidades sugeridas: {MODALITIES.slice(0,3).join(", ")}...</p>
        </form>
      </div>
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
