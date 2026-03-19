// Module 09: QuoteVibe Pro
const quotes = [
    { q: "自動化不是工具，而是一種生活方式。", a: "Antigravity OS", img: "assets/quotes/tech.png" },
    { q: "唯有專業，才能超越平庸。", a: "開發者箴言", img: "assets/quotes/tech.png" },
    { q: "山不在高，有科技則靈；水不在深，有AI則名。", a: "創客筆錄", img: "assets/quotes/nature.png" },
    { q: "每一行代碼，都是你對未來世界的承諾。", a: "軟體工程師", img: "assets/quotes/tech.png" },
    { q: "於寧靜中思考，於繁複中精簡。", a: "設計大師", img: "assets/quotes/nature.png" }
];

function setProQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('pro-quote').innerHTML = `「${q.q}」<br><small style="opacity:0.8; font-size:0.8rem;">— ${q.a}</small>`;
    document.getElementById('quote-img-container').style.backgroundImage = `url('${q.img}')`;
}
setProQuote();
// Auto-rotate every 30 seconds for a dynamic feel
setInterval(setProQuote, 30000);
