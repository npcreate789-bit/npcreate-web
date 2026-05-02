export async function pushLineMessage(lineUserId: string, text: string): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) return false
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body:    JSON.stringify({ to: lineUserId, messages: [{ type: "text", text }] }),
  })
  return res.ok
}
