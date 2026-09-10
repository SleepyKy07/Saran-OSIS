const URL = "https://kotak-saran-osis.vercel.app/api/siswa/status";
const N = 60; // jumlah request bersamaan

async function one(i) {
  const t0 = Date.now();
  try {
    const r = await fetch(URL, { cache: "no-store" });
    await r.text();
    return { i, status: r.status, ms: Date.now() - t0 };
  } catch (e) {
    return { i, status: "ERR", ms: Date.now() - t0, err: e.message };
  }
}

console.log(`Menembak ${N} request bersamaan ke ${URL} ...`);
const t0 = Date.now();
const results = await Promise.all(Array.from({ length: N }, (_, i) => one(i)));
const total = Date.now() - t0;

const ok = results.filter((r) => r.status === 200).length;
const bad = results.filter((r) => r.status !== 200);
const times = results.map((r) => r.ms).sort((a, b) => a - b);

console.log(`\nSelesai dalam ${total} ms`);
console.log(`Sukses (200): ${ok}/${N}`);
console.log(`Gagal: ${bad.length}`);
if (bad.length) console.log("Detail gagal:", bad.slice(0, 10));
console.log(`Latensi min/median/max: ${times[0]} / ${times[Math.floor(times.length / 2)]} / ${times[times.length - 1]} ms`);
