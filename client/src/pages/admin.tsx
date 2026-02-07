import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, LogOut, Save, Loader2, CheckCircle, AlertCircle, Settings, Link2, Wallet, Globe } from "lucide-react";

const SETTINGS_KEYS = {
  tord_contract: { label: "TORD Contract Address", placeholder: "0x...", group: "contracts", icon: Wallet },
  staking_contract: { label: "Staking Contract Address", placeholder: "0x...", group: "contracts", icon: Lock },
  twitter_url: { label: "X (Twitter) URL", placeholder: "https://x.com/tordlabs", group: "socials", icon: Globe },
  telegram_url: { label: "Telegram URL", placeholder: "https://t.me/TordLabs", group: "socials", icon: Globe },
  github_url: { label: "GitHub URL", placeholder: "https://github.com/tordlabs", group: "socials", icon: Globe },
  discord_url: { label: "Discord URL", placeholder: "https://discord.gg/...", group: "socials", icon: Globe },
  website_url: { label: "Website URL", placeholder: "https://tordlabs.com", group: "socials", icon: Globe },
};

type SettingsMap = Record<string, string>;

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [settings, setSettings] = useState<SettingsMap>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (token) {
      verifyAndLoadSettings();
    } else {
      setVerifying(false);
      setLoading(false);
    }
  }, [token]);

  async function verifyAndLoadSettings() {
    setVerifying(true);
    try {
      const verifyRes = await fetch("/api/admin/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!verifyRes.ok) {
        localStorage.removeItem("admin_token");
        setToken(null);
        setVerifying(false);
        setLoading(false);
        return;
      }

      const settingsRes = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings || {});
      }
    } catch {
      localStorage.removeItem("admin_token");
      setToken(null);
    }
    setVerifying(false);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setLoginError("Invalid username or password");
        setLoginLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem("admin_token", data.token);
      setToken(data.token);
      setUsername("");
      setPassword("");
    } catch {
      setLoginError("Connection error");
    }
    setLoginLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    localStorage.removeItem("admin_token");
    setToken(null);
    setSettings({});
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setSettings(data.settings || {});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Failed to save settings. Please try again.");
    }
    setSaving(false);
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 flex items-center justify-center border border-amber-500/30">
                <Lock className="h-7 w-7 text-amber-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-1" data-testid="text-admin-title">Admin Panel</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">Sign in to manage Tord Labs settings</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                <Input
                  data-testid="input-admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-white/5 border-white/10 text-white"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Password</label>
                <Input
                  data-testid="input-admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-white/5 border-white/10 text-white"
                  autoComplete="current-password"
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-red-400 text-sm" data-testid="text-login-error">
                  <AlertCircle className="h-4 w-4" />
                  {loginError}
                </div>
              )}
              <Button
                data-testid="button-admin-login"
                type="submit"
                disabled={loginLoading || !username || !password}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
              >
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const contractKeys = Object.entries(SETTINGS_KEYS).filter(([_, v]) => v.group === "contracts");
  const socialKeys = Object.entries(SETTINGS_KEYS).filter(([_, v]) => v.group === "socials");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 flex items-center justify-center border border-amber-500/30">
              <Settings className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold" data-testid="text-admin-header">Tord Labs Admin</h1>
              <p className="text-xs text-muted-foreground">Manage platform settings</p>
            </div>
          </div>
          <Button
            data-testid="button-admin-logout"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-black/60 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center border border-blue-500/30">
              <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold" data-testid="text-contracts-title">Smart Contract Addresses</h2>
              <p className="text-xs text-muted-foreground">These addresses are used across staking, token analyzer, and other functions</p>
            </div>
          </div>

          <div className="space-y-4">
            {contractKeys.map(([key, config]) => (
              <div key={key}>
                <label className="text-sm text-muted-foreground mb-1.5 block">{config.label}</label>
                <Input
                  data-testid={`input-setting-${key}`}
                  value={settings[key] || ""}
                  onChange={(e) => updateSetting(key, e.target.value)}
                  placeholder={config.placeholder}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black/60 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center border border-purple-500/30">
              <Link2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold" data-testid="text-socials-title">Social Links</h2>
              <p className="text-xs text-muted-foreground">Update social media links displayed across the platform</p>
            </div>
          </div>

          <div className="space-y-4">
            {socialKeys.map(([key, config]) => (
              <div key={key}>
                <label className="text-sm text-muted-foreground mb-1.5 block">{config.label}</label>
                <Input
                  data-testid={`input-setting-${key}`}
                  value={settings[key] || ""}
                  onChange={(e) => updateSetting(key, e.target.value)}
                  placeholder={config.placeholder}
                  className="bg-white/5 border-white/10 text-white text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-4">
          <Button
            data-testid="button-save-settings"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-8"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save All Settings
          </Button>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-400 text-sm" data-testid="text-save-success">
              <CheckCircle className="h-4 w-4" />
              Settings saved successfully
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 text-red-400 text-sm" data-testid="text-save-error">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
