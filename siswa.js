const profilSiswa = JSON.parse(localStorage.getItem("userAktif"));
if (!profilSiswa) window.location.href = "index.html";
document.getElementById("sapaanSiswa").innerText =
  "Halo, " + profilSiswa.nama.split(" ")[0];

function keluarAkun() {
  localStorage.removeItem("userAktif");
  window.location.href = "index.html";
}

let dbBuku = JSON.parse(localStorage.getItem("db_buku")) || [];
let dbPinjam = JSON.parse(localStorage.getItem("db_pinjam")) || [];

function tampilinBuku() {
  let rak = document.getElementById("rakBuku");
  let kataKunci = document.getElementById("ketikanCari").value.toLowerCase();
  rak.innerHTML = "";

  dbBuku
    .filter((b) => b.judul.toLowerCase().includes(kataKunci))
    .forEach((buku) => {
      let statusHabis = buku.stok <= 0;
      rak.innerHTML += `
            <div class="kartu-buku bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between h-full ${statusHabis ? "grayscale opacity-60" : ""}">
                <div class="atas">
                    <span class="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded font-bold mb-2 inline-block">${buku.edisi}</span>
                    <h4 class="font-bold text-gray-800 leading-snug mb-1">${buku.judul}</h4>
                    <p class="text-xs text-gray-400 italic">${buku.penulis}</p>
                </div>
                <div class="bawah flex justify-between items-center mt-4 pt-3 border-t">
                    <span class="text-xs text-gray-500">Stok: <b>${buku.stok}</b></span>
                    ${!statusHabis ? `<button onclick="bukaModal(${buku.id})" class="bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-bold shadow hover:bg-green-700">Pinjam</button>` : '<span class="text-xs text-red-500 font-bold">HABIS</span>'}
                </div>
            </div>
        `;
    });
}

function bukaModal(idBukuPilihan) {
  let infoBuku = dbBuku.find((b) => b.id === idBukuPilihan);
  document.getElementById("simpanId").value = infoBuku.id;
  document.getElementById("tampilJudul").innerText = infoBuku.judul;

  document.getElementById("pilKelas").value = profilSiswa.kelas;
  document.getElementById("pilNama").value = profilSiswa.nama;

  document.getElementById("modalPinjam").classList.remove("hidden");
}

function tutupModal() {
  document.getElementById("modalPinjam").classList.add("hidden");
}

document.getElementById("formKirim").addEventListener("submit", (e) => {
  e.preventDefault();
  let idBuku = parseInt(document.getElementById("simpanId").value);
  let waktuPinjam = parseInt(document.getElementById("lamaPinjam").value);

  let posisiBuku = dbBuku.findIndex((b) => b.id === idBuku);
  if (dbBuku[posisiBuku].stok > 0) {
    dbBuku[posisiBuku].stok--;

    let dataNota = {
      id: Date.now(),
      idBuku: idBuku,
      nama: profilSiswa.nama,
      kelas: profilSiswa.kelas,
      email: profilSiswa.email,
      tglPinjam: new Date().toISOString(),
      tempo: new Date(Date.now() + waktuPinjam * 86400000).toISOString(),
      status: "Dipinjam",
      ketStatus: "-",
      denda: 0,
    };

    dbPinjam.push(dataNota);
    localStorage.setItem("db_buku", JSON.stringify(dbBuku));
    localStorage.setItem("db_pinjam", JSON.stringify(dbPinjam));

    bikinKertasPDF(dataNota, dbBuku[posisiBuku]);
    tutupModal();
    tampilinBuku();
  }
});

function bikinKertasPDF(nota, detailBuku) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [200, 80],
  });
  const warnaIjo = [22, 163, 74];

  pdf.setDrawColor(150, 150, 150);
  pdf.setLineDashPattern([3, 3], 0);
  pdf.line(100, 0, 100, 80);
  pdf.setLineDashPattern([], 0);

  function gambarDesain(geserX, teksJudul) {
    pdf.setFillColor(...warnaIjo);
    pdf.rect(geserX, 0, 100, 15, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(teksJudul, geserX + 5, 6);
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    pdf.text("PERPUSTAKAAN MA BILINGUAL", geserX + 5, 10);
    pdf.text(`ID: #${nota.id.toString().slice(-5)}`, geserX + 5, 13);

    pdf.setFillColor(240, 253, 244);
    pdf.roundedRect(geserX + 5, 20, 90, 18, 2, 2, "F");
    pdf.setTextColor(20, 83, 45);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text("PEMINJAM:", geserX + 7, 24);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text(nota.nama, geserX + 7, 29);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Kelas: ${nota.kelas}`, geserX + 7, 34);

    pdf.setDrawColor(...warnaIjo);
    pdf.roundedRect(geserX + 5, 40, 90, 20, 2, 2, "S");
    pdf.setTextColor(20, 83, 45);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text("BUKU:", geserX + 7, 44);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdf.splitTextToSize(detailBuku.judul, 85), geserX + 7, 49);

    pdf.setFontSize(7);
    pdf.text(
      `Pinjam: ${new Date(nota.tglPinjam).toLocaleDateString("id-ID")}`,
      geserX + 7,
      57,
    );
    pdf.setTextColor(200, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `Tempo: ${new Date(nota.tempo).toLocaleDateString("id-ID")}`,
      geserX + 45,
      57,
    );

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    pdf.text("Tanda Tangan Peminjam", geserX + 25, 65, { align: "center" });
    pdf.text("Verifikasi Petugas", geserX + 75, 65, { align: "center" });
    pdf.setDrawColor(150, 150, 150);
    pdf.line(geserX + 10, 72, geserX + 40, 72);
    pdf.line(geserX + 60, 72, geserX + 90, 72);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text(nota.nama.split(" ")[0], geserX + 25, 76, { align: "center" });
    pdf.text("Admin Perpus", geserX + 75, 76, { align: "center" });
  }

  gambarDesain(0, "BUKTI PEMINJAMAN (Siswa)");
  gambarDesain(100, "ARSIP PERPUSTAKAAN (Admin)");
  pdf.save(`Form_${nota.nama}.pdf`);
}

// Render awal
tampilinBuku();
