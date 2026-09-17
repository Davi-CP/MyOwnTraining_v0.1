import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup/client")({
  component: SignupClient,
  head: () => ({ meta: [{ title: "Criar conta de cliente — MyOwnTraining" }] }),
});

const empty = {
  name: "", birth: "", gender: "", phone: "", email: "",
  doc: "", address: "", city: "", state: "",
  password: "", confirm: "",
};

function SignupClient() {
  const nav = useNavigate();
  const [data, setData] = useState(empty);
  const [photo, setPhoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const upd = (k: keyof typeof empty, v: string) => setData({ ...data, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof typeof empty)[] = ["name","birth","gender","phone","email","doc","address","city","state","password","confirm"];
    for (const k of required) {
      if (!data[k].trim()) return toast.error("Preencha todos os campos obrigatórios");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return toast.error("Email inválido");
    if (data.password.length < 6) return toast.error("Senha deve ter pelo menos 6 caracteres");
    if (data.password !== data.confirm) return toast.error("Senhas não conferem");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: {
          role: "client",
          full_name: data.name,
          phone: data.phone,
          city: data.city,
          avatar_url: photo,
        },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Conta criada com sucesso");
    nav({ to: "/home" });
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setPhoto(URL.createObjectURL(f));
  };



  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-xl font-bold">Criar conta — Cliente</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Foto de perfil (opcional)">
            <label className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card">
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
          </Field>
          <Field label="Nome completo *"><Input className="h-11 rounded-xl" value={data.name} onChange={(e) => upd("name", e.target.value)} /></Field>
          <Field label="Data de nascimento *"><Input type="date" className="h-11 rounded-xl" value={data.birth} onChange={(e) => upd("birth", e.target.value)} /></Field>
          <Field label="Sexo *">
            <select value={data.gender} onChange={(e) => upd("gender", e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm">
              <option value="">Selecione</option><option>Feminino</option><option>Masculino</option><option>Outro</option>
            </select>
          </Field>
          <Field label="Telefone *"><Input className="h-11 rounded-xl" value={data.phone} onChange={(e) => upd("phone", e.target.value)} /></Field>
          <Field label="Email *"><Input type="email" className="h-11 rounded-xl" value={data.email} onChange={(e) => upd("email", e.target.value)} /></Field>
          <Field label="CPF / Documento *"><Input className="h-11 rounded-xl" value={data.doc} onChange={(e) => upd("doc", e.target.value)} /></Field>
          <Field label="Endereço *"><Input className="h-11 rounded-xl" value={data.address} onChange={(e) => upd("address", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cidade *"><Input className="h-11 rounded-xl" value={data.city} onChange={(e) => upd("city", e.target.value)} /></Field>
            <Field label="Estado *"><Input className="h-11 rounded-xl" value={data.state} onChange={(e) => upd("state", e.target.value)} /></Field>
          </div>
          <Field label="Senha *"><Input type="password" className="h-11 rounded-xl" value={data.password} onChange={(e) => upd("password", e.target.value)} /></Field>
          <Field label="Confirmar senha *"><Input type="password" className="h-11 rounded-xl" value={data.confirm} onChange={(e) => upd("confirm", e.target.value)} /></Field>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90 disabled:opacity-50">
            {loading ? "Criando conta..." : "Salvar conta"}
          </Button>
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
