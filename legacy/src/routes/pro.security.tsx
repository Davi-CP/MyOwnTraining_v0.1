import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Shield, Lock, Bell, MapPin, UserX, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  useStored, KEYS, DEFAULT_PRIVACY_SETTINGS, STUDENTS,
  type PrivacySettings, type BlockedUser,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/security")({
  component: ProSecurityPage,
  head: () => ({ meta: [{ title: "Segurança e privacidade — MyOwnTraining" }] }),
});

function ProSecurityPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useStored<PrivacySettings>(KEYS.proPrivacySettings, DEFAULT_PRIVACY_SETTINGS);
  const [blocked, setBlocked] = useStored<BlockedUser[]>(KEYS.blockedUsers, []);
  const [pwOpen, setPwOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [cf, setCf] = useState("");
  const [delPw, setDelPw] = useState("");

  const toggle = (k: keyof PrivacySettings) => setSettings({ ...settings, [k]: !settings[k] });

  const changePw = () => {
    if (nw.length < 6) return toast.error("Nova senha precisa de ao menos 6 caracteres");
    if (nw !== cf) return toast.error("Senhas não coincidem");
    if (!cur) return toast.error("Informe a senha atual");
    toast.success("Senha alterada com sucesso");
    setPwOpen(false); setCur(""); setNw(""); setCf("");
  };

  const unblock = (id: string) => {
    setBlocked(blocked.filter((b) => b.targetId !== id));
    toast.success("Cliente desbloqueado");
  };

  const deleteAccount = () => {
    if (!delPw) return toast.error("Confirme sua senha");
    toast.success("Conta excluída");
    setDelOpen(false);
    setTimeout(() => navigate({ to: "/" }), 600);
  };

  const blockedClients = blocked
    .filter((b) => b.blockedBy === "trainer")
    .map((b) => STUDENTS.find((s) => s.id === b.targetId))
    .filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/pro/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-xl font-bold">Segurança e privacidade</h1>
          <Shield className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)]">
          <button onClick={() => setPwOpen(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm hover:bg-muted/40">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Alterar senha</span>
          </button>
          <div className="flex items-center gap-3 border-t border-border px-4 py-3.5 text-sm">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Notificações</span>
            <Switch checked={settings.notificationsEnabled} onCheckedChange={() => toggle("notificationsEnabled")} />
          </div>
          <div className="flex items-center gap-3 border-t border-border px-4 py-3.5 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Compartilhar localização</span>
            <Switch checked={settings.locationEnabled} onCheckedChange={() => toggle("locationEnabled")} />
          </div>
          <div className="flex items-center gap-3 border-t border-border px-4 py-3.5 text-sm">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">E-mails de marketing</span>
            <Switch checked={settings.marketingEmails} onCheckedChange={() => toggle("marketingEmails")} />
          </div>
        </div>

        <h2 className="mt-6 mb-2 flex items-center gap-2 text-sm font-semibold">
          <UserX className="h-4 w-4" /> Clientes bloqueados
        </h2>
        <div className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)]">
          {blockedClients.length === 0 && (
            <p className="p-4 text-center text-xs text-muted-foreground">Nenhum cliente bloqueado.</p>
          )}
          {blockedClients.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">{s.name.charAt(0)}</div>
              <p className="flex-1 text-sm font-medium">{s.name}</p>
              <Button variant="outline" size="sm" onClick={() => unblock(s.id)} className="h-8 rounded-full text-xs">Desbloquear</Button>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)]">
          <Link to="/pro/terms" className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-muted/40">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Termos de uso</span>
          </Link>
          <Link to="/pro/privacy" className="flex items-center gap-3 border-t border-border px-4 py-3.5 text-sm hover:bg-muted/40">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Política de privacidade</span>
          </Link>
        </div>

        <button onClick={() => setDelOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3.5 text-sm font-medium text-destructive shadow-[var(--shadow-soft)]">
          <Trash2 className="h-4 w-4" /> Excluir conta
        </button>
      </div>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Alterar senha</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="password" placeholder="Senha atual" value={cur} onChange={(e) => setCur(e.target.value)} />
            <Input type="password" placeholder="Nova senha" value={nw} onChange={(e) => setNw(e.target.value)} />
            <Input type="password" placeholder="Confirmar nova senha" value={cf} onChange={(e) => setCf(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwOpen(false)}>Cancelar</Button>
            <Button onClick={changePw} className="bg-[var(--brand-yellow)] text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>Esta ação é permanente. Todos os seus dados serão removidos.</DialogDescription>
          </DialogHeader>
          <Input type="password" placeholder="Confirme sua senha" value={delPw} onChange={(e) => setDelPw(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={deleteAccount}>Excluir definitivamente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProBottomNav />
    </div>
  );
}
