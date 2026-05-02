import { type NextRequest, NextResponse } from "next/server"

const COOKIE_OPTS = (prod: boolean) => ({
  httpOnly: true,
  secure:   prod,
  sameSite: "lax" as const,
  maxAge:   60 * 10,
  path:     "/",
})

export function GET(req: NextRequest) {
  const returnTo   = req.nextUrl.searchParams.get("returnTo") ?? ""
  const mode       = req.nextUrl.searchParams.get("mode") ?? ""
  const safeReturn = returnTo && /^\/[^/]/.test(returnTo) ? returnTo : ""
  const isProd     = process.env.NODE_ENV === "production"

  const state = crypto.randomUUID()

  const oauthParams = new URLSearchParams({
    response_type: "code",
    client_id:     process.env.LINE_LOGIN_CLIENT_ID!,
    redirect_uri:  process.env.LINE_LOGIN_REDIRECT_URI!,
    state,
    scope:         "profile openid",
  })

  const webUrl    = `https://access.line.me/oauth2/v2.1/authorize?${oauthParams}`
  const iosDeep   = `line://oauth2/v2.1/authorize?${oauthParams}`

  // Android intent:// URL — Chrome opens LINE app directly; falls back to web if not installed
  const androidIntent =
    `intent://oauth2/v2.1/authorize?${oauthParams}` +
    `#Intent;scheme=line;package=jp.naver.line.android` +
    `;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`

  const ua        = req.headers.get("user-agent") ?? ""
  const isAndroid = /android/i.test(ua)
  const isIOS     = /iPhone|iPad|iPod/i.test(ua)
  const isMobile  = isAndroid || isIOS

  function applyCookies(res: NextResponse) {
    const opts = COOKIE_OPTS(isProd)
    res.cookies.set("line_state", state, opts)
    if (safeReturn)        res.cookies.set("line_return_to", safeReturn, opts)
    if (mode === "member") res.cookies.set("line_mode", "member", opts)
    return res
  }

  // Desktop — fast 302 redirect, no intermediate page
  if (!isMobile) {
    return applyCookies(NextResponse.redirect(webUrl))
  }

  // Mobile — serve an intermediate HTML page that tries LINE deep link first
  // Cookies are set on THIS response (our domain) so they're available when LINE
  // calls back to /api/auth/line/callback after the user authorizes.
  const deepLink = isAndroid ? androidIntent : iosDeep

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>กำลังเปิด LINE...</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Noto Sans Thai',sans-serif;background:#0a0808;color:#fff;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;gap:24px;text-align:center}
.logo{font-size:24px;font-weight:700;letter-spacing:-0.5px}.logo b{color:#dc2626}
.status{color:#475569;font-size:14px;line-height:1.7}
.status strong{color:#94a3b8}
.spinner{width:40px;height:40px;border:3px solid #1e293b;border-top-color:#06C755;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.btn-line{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:#06C755;color:#fff;padding:14px 28px;border-radius:14px;text-decoration:none;font-weight:700;font-size:15px;width:100%;max-width:320px;border:none;cursor:pointer;margin-top:4px}
.btn-line:active{background:#05a847}
.btn-web{color:#475569;font-size:13px;text-decoration:underline;background:none;border:none;cursor:pointer;padding:4px}
</style>
</head>
<body>
<div class="logo">NP<b>Create</b></div>
<div class="spinner" id="spin"></div>
<p class="status">กำลังเปิด LINE app...<br><strong>ถ้าไม่เปิดอัตโนมัติ กดปุ่มด้านล่าง</strong></p>
<a href="${deepLink}" class="btn-line" id="openBtn">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
  เปิด LINE
</a>
<button class="btn-web" id="webBtn" onclick="goWeb()">หรือเข้าสู่ระบบผ่านเบราเซอร์แทน</button>
<script>
var webUrl   = ${JSON.stringify(webUrl)};
var deepLink = ${JSON.stringify(deepLink)};
var gone     = false;

function goWeb(){ window.location.href = webUrl; }

// Detect if app opened (page becomes hidden)
document.addEventListener('visibilitychange', function(){
  if(document.hidden) gone = true;
});
window.addEventListener('pagehide', function(){ gone = true; });

// Attempt to open LINE app immediately
window.location.href = deepLink;

// Fallback: if page still visible after 2s, redirect to web
setTimeout(function(){
  if(!gone){
    document.getElementById('spin').style.display='none';
    // Show buttons clearly, auto-redirect to web after further delay
    setTimeout(function(){
      if(!gone) goWeb();
    }, 3000);
  }
}, 2000);
</script>
</body>
</html>`

  return applyCookies(
    new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  )
}
