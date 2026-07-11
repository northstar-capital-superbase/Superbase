import type { Metadata } from "next";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northstar Labs — Multi-Agent OS",
  description:
    "A local-first experimental multi-agent AI operating system by Northstar.",
};

// Applied before hydration so the persisted theme/appearance is on <html> at
// first paint (no flash). Mirrors applyAppearance() in SettingsProvider.
const NO_FLASH = `(function(){try{
var d=document.documentElement,u=localStorage.getItem("northstar.settings.active-user"),k=u?"northstar.settings.v2."+u:null,s=JSON.parse((k&&localStorage.getItem(k))||"{}").appearance||{};
var R={sharp:["8px","6px","4px"],default:["16px","12px","9px"],round:["22px","16px","12px"]};
var F={small:"0.92",default:"1",large:"1.1"};
var A={blue:["#6e8bff","#8aa6ff"],violet:["#a78bfa","#c0a9ff"],cyan:["#38bdf8","#7dd3fc"],emerald:["#5bd6a8","#7fe6c0"],amber:["#e2b17c","#f0c79a"],rose:["#ff7a8a","#ff9aa6"]};
var BG={midnight:"#08090d",graphite:"#101114",nord:"#2e3440",dracula:"#282a36","solarized-dark":"#002b36","terminal-green":"#08100a","ocean-blue":"#0a1420","northstar-purple":"#0d0a14"};
d.dataset.theme=s.theme||"midnight";
d.style.backgroundColor=BG[s.theme||"midnight"]||"#08090d";
d.dataset.density=s.density||"cozy";
d.dataset.radius=s.radius||"default";
d.dataset.bg=s.background||"aurora";
d.dataset.glass=s.glass===false?"off":"on";
d.dataset.bubbles=s.chatBubbles||"modern";
d.dataset.agentColors=s.agentColors===false?"off":"on";
d.dataset.motion=(s.animations!==false&&s.reducedMotion!==true)?"full":"reduced";
var r=R[s.radius||"default"];d.style.setProperty("--os-r-lg",r[0]);d.style.setProperty("--os-r",r[1]);d.style.setProperty("--os-r-sm",r[2]);
d.style.setProperty("--os-font-scale",F[s.fontSize||"default"]);
var a=A[s.accent];if(a){d.style.setProperty("--os-accent",a[0]);d.style.setProperty("--os-accent-bright",a[1]);}
}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        <AuthProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
