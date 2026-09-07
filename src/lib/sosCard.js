function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = words[i];
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

export function drawSosCard(canvas, data) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
  bgGradient.addColorStop(0, "#3d104b");
  bgGradient.addColorStop(1, "#210829");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  ctx.lineWidth = 14;
  ctx.strokeStyle = "#b3d47a";
  ctx.strokeRect(7, 7, W - 14, H - 14);

  const headerGradient = ctx.createLinearGradient(24, 24, W - 24, 24);
  headerGradient.addColorStop(0, "#b3d47a");
  headerGradient.addColorStop(1, "#9bc468");
  ctx.fillStyle = headerGradient;
  ctx.fillRect(24, 24, W - 48, 140);

  ctx.fillStyle = "#3d104b";
  ctx.font = "bold 56px 'Fraunces', 'Georgia', serif";
  ctx.textAlign = "left";
  ctx.fillText("EMERGENCY SOS CARD", 50, 100);

  const fields = [
    { label: "Full Name / نام", value: data.name },
    { label: "Blood Type / بلڈ گروپ", value: data.blood },
    { label: "Chronic Allergies / الرجی", value: data.allergies || "—" },
    { label: "Emergency Contact / ایمرجنسی نمبر", value: data.contact },
    { label: "Essential Meds / روزمرہ کی ادویات", value: data.meds || "—" },
  ];

  let y = 260;
  const rowHeight = 260;

  fields.forEach((field) => {
    ctx.strokeStyle = "rgba(245, 241, 247, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(W - 50, y);
    ctx.stroke();

    ctx.fillStyle = "#b3d47a";
    ctx.font = "600 28px 'IBM Plex Mono', 'Consolas', monospace";
    ctx.textAlign = "left";
    ctx.fillText(field.label, 50, y + 55);

    ctx.fillStyle = "#f5f1f7";
    const isUrduScript = /[؀-ۿ]/.test(field.value);
    ctx.font = isUrduScript
      ? "bold 48px 'Noto Nastaliq Urdu', Arial, sans-serif"
      : "bold 46px 'Fraunces', 'Georgia', serif";
    ctx.textAlign = "left";
    wrapText(ctx, field.value, 50, y + 130, W - 100, 56);

    y += rowHeight;
  });

  ctx.fillStyle = "#e8724a";
  ctx.font = "bold 32px 'IBM Plex Mono', 'Consolas', monospace";
  ctx.textAlign = "center";
  ctx.fillText("IN CASE OF EMERGENCY, CALL ABOVE CONTACT", W / 2, H - 90);
  ctx.font = "34px 'Noto Nastaliq Urdu', Arial, sans-serif";
  ctx.fillText("ہنگامی صورت میں مندرجہ بالا نمبر پر رابطہ کریں", W / 2, H - 40);
}
