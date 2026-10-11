// ==========================================
//  W4HX OFFICIAL - MAIN SCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.classList.contains("buy-btn")) return;

    button.classList.remove("is-clicked");
    void button.offsetWidth;
    button.classList.add("is-clicked");
    window.setTimeout(() => button.classList.remove("is-clicked"), 750);
  });

  document.getElementById("brandName").textContent = CONFIG.brandName;
  const brandLogo = document.getElementById("brandLogo");
  brandLogo.addEventListener("load", () => {
    brandLogo.classList.add("logo-loaded");
    brandLogo.parentElement.classList.add("has-logo-image");
  }, { once: true });
  brandLogo.src = CONFIG.logoUrl;

  typeWriter(CONFIG.typingText, "typingText");

  document.querySelectorAll(".social-btn").forEach(btn => {
    const key = btn.dataset.key;
    if (CONFIG.socials[key]) btn.href = CONFIG.socials[key];
  });

  renderProducts();
  renderList("memberList", CONFIG.members);

  let showingReseller = false;
  document.getElementById("resellerTabBtn").addEventListener("click", (e) => {
    showingReseller = !showingReseller;
    if (showingReseller) {
      renderList("memberList", CONFIG.resellers);
      e.target.textContent = "← Kembali ke Member";
    } else {
      renderList("memberList", CONFIG.members);
      e.target.textContent = "Lihat Reseller Panel →";
    }
  });

  initStars();
});

// ---------- TYPING ----------
function typeWriter(text, targetId, i = 0) {
  const el = document.getElementById(targetId);
  if (!el) return;
  if (i < text.length) {
    el.textContent += text.charAt(i);
    setTimeout(() => typeWriter(text, targetId, i + 1), 55);
  }
}

// ---------- RENDER PRODUK ----------
function renderProducts() {
  const panelGrid = document.getElementById("panelGrid");
  const toolsGrid = document.getElementById("toolsGrid");
  PRODUCTS.panels.forEach(p => panelGrid.appendChild(buildCard(p)));
  PRODUCTS.tools.forEach(p => toolsGrid.appendChild(buildCard(p)));
}

function buildCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <h3>${product.name}</h3>
    <div class="price">Rp ${product.price.toLocaleString("id-ID")}</div>
    <ul class="feature-list">
      ${product.lists.map(l => `<li>${l}</li>`).join("")}
    </ul>
    <button class="buy-btn" data-id="${product.id}">BELI SEKARANG</button>
  `;
  card.querySelector(".buy-btn").addEventListener("click", function() {
    if (this.classList.contains("is-clicked")) return;
    this.classList.add("is-clicked");
    window.setTimeout(() => this.classList.remove("is-clicked"), 750);
    window.setTimeout(() => openModal(product), 160);
  });
  return card;
}

// ---------- RENDER LIST ----------
function renderList(targetId, items) {
  const box = document.getElementById(targetId);
  box.innerHTML = "";
  items.forEach(it => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `<span>${it.name}</span><span>${it.status}</span>`;
    box.appendChild(div);
  });
}

// ---------- MODAL ----------
let selectedProduct = null;
let selectedPayment = null;

const modal = document.getElementById("modalOverlay");
const step1 = document.getElementById("step1");
const stepLoading = document.getElementById("stepLoading");
const stepSuccess = document.getElementById("stepSuccess");

function openModal(product) {
  selectedProduct = product;
  selectedPayment = null;
  document.getElementById("modalTitle").textContent =
    `Beli ${product.name} — Rp ${product.price.toLocaleString("id-ID")}`;
  step1.classList.remove("hidden");
  stepLoading.classList.add("hidden");
  stepSuccess.classList.add("hidden");
  document.getElementById("payInfo").innerHTML = "";
  document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("selected"));
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

document.getElementById("closeModal").addEventListener("click", closeModal);
function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

// ---------- METODE PEMBAYARAN ----------
document.querySelectorAll(".pay-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedPayment = btn.dataset.pay;

    const info = document.getElementById("payInfo");
    const p = CONFIG.payments[selectedPayment];

    if (selectedPayment === "qris") {
      info.innerHTML = `
        <strong>QRIS</strong><br>
        Klik gambar untuk memuat QRIS:
        <img src="${p.qrisImage}" id="qrisImg" alt="QRIS" />
      `;
      document.getElementById("qrisImg").addEventListener("click", () => {
        step1.classList.add("hidden");
        stepLoading.classList.remove("hidden");
        let count = 10;
        document.getElementById("countdown").textContent = count;
        const t = setInterval(() => {
          count--;
          document.getElementById("countdown").textContent = count;
          if (count <= 0) {
            clearInterval(t);
            stepLoading.classList.add("hidden");
            step1.classList.remove("hidden");
          }
        }, 1000);
      });
    } else {
      info.innerHTML = `
        <strong>${p.name}</strong><br>
        Nomor: <b>${p.number}</b><br>
        Atas Nama: <b>${p.holder}</b>
      `;
    }
  });
});

// ---------- SUBMIT ----------
document.getElementById("submitBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("inpNama").value.trim();
  const email = document.getElementById("inpEmail").value.trim();
  const telp = document.getElementById("inpTelp").value.trim();
  const file = document.getElementById("inpBukti").files[0];

  if (!nama || !email || !telp) return alert("Lengkapi semua data!");
  if (!selectedPayment) return alert("Pilih metode pembayaran!");
  if (!file) return alert("Upload bukti pembayaran (WAJIB 1 FOTO)!");

  const form = new FormData();
  const content = {
    username: "W4HX Order Bot",
    embeds: [{
      title: "🛒 PESANAN BARU W4HX",
      color: 0x7ec8ff,
      fields: [
        { name: "Produk",     value: selectedProduct.name,  inline: true },
        { name: "Harga",      value: `Rp ${selectedProduct.price.toLocaleString("id-ID")}`, inline: true },
        { name: "Pembayaran", value: selectedPayment.toUpperCase(), inline: true },
        { name: "Nama",       value: nama },
        { name: "Email",      value: email },
        { name: "Telepon",    value: telp }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  form.append("payload_json", JSON.stringify(content));
  form.append("file", file, file.name);

  try {
    if (CONFIG.discordWebhook && !CONFIG.discordWebhook.includes("ISI_WEBHOOK")) {
      await fetch(CONFIG.discordWebhook, { method: "POST", body: form });
    }
  } catch (err) { console.error("Gagal kirim webhook:", err); }

  step1.classList.add("hidden");
  stepSuccess.classList.remove("hidden");

  setTimeout(() => {
    closeModal();
    document.getElementById("inpNama").value = "";
    document.getElementById("inpEmail").value = "";
    document.getElementById("inpTelp").value = "";
    document.getElementById("inpBukti").value = "";
    document.getElementById("payInfo").innerHTML = "";
    selectedPayment = null;
    document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("selected"));
    stepSuccess.classList.add("hidden");
    step1.classList.remove("hidden");
  }, 2500);
});

// ---------- STARS ----------
function initStars() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];
  const shootingStars = [];
  let nextShootingStar = 0;
  let previousFrame = 0;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    stars = [];
    shootingStars.length = 0;
    const count = Math.min(260, Math.floor((window.innerWidth * window.innerHeight) / 6000));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.02 + 0.005
      });
    }
  }

  function addShootingStar() {
    if (shootingStars.length >= 2) return;
    const angle = Math.PI * (0.34 + Math.random() * 0.08);
    shootingStars.push({
      x: window.innerWidth * (0.25 + Math.random() * 0.95),
      y: -20 + Math.random() * window.innerHeight * 0.55,
      angle,
      speed: 520 + Math.random() * 320,
      length: 90 + Math.random() * 110,
      opacity: 0.72 + Math.random() * 0.28,
      hue: Math.random() > 0.75 ? 190 : 210
    });
  }

  function animate(timestamp = 0) {
    const delta = previousFrame ? Math.min((timestamp - previousFrame) / 1000, 0.04) : 0;
    previousFrame = timestamp;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.save();
    ctx.shadowBlur = 0;
    stars.forEach(s => {
      s.a += s.speed;
      const alpha = 0.4 + Math.abs(Math.sin(s.a)) * 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(150,200,255,0.8)";
      ctx.fill();
    });

    if (!motionQuery.matches) {
      if (timestamp >= nextShootingStar) {
        addShootingStar();
        nextShootingStar = timestamp + 1200 + Math.random() * 2200;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const shootingStar = shootingStars[i];
        shootingStar.x -= Math.cos(shootingStar.angle) * shootingStar.speed * delta;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed * delta;
        shootingStar.opacity -= delta * 0.22;

        const tailX = shootingStar.x + Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;
        const trail = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
        trail.addColorStop(0, `hsla(${shootingStar.hue}, 100%, 82%, 0)`);
        trail.addColorStop(0.72, `hsla(${shootingStar.hue}, 100%, 82%, ${shootingStar.opacity * 0.4})`);
        trail.addColorStop(1, `hsla(${shootingStar.hue}, 100%, 96%, ${shootingStar.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.strokeStyle = trail;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.shadowBlur = 13;
        ctx.shadowColor = `hsla(${shootingStar.hue}, 100%, 78%, ${shootingStar.opacity * 0.8})`;
        ctx.stroke();

        if (shootingStar.y > window.innerHeight + 30 || shootingStar.x < -shootingStar.length || shootingStar.opacity <= 0) {
          shootingStars.splice(i, 1);
        }
      }
    }
    ctx.restore();
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);
  animate();
}