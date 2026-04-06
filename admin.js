let dbBuku = JSON.parse(localStorage.getItem("db_buku")) || [];
let dbPinjam = JSON.parse(localStorage.getItem("db_pinjam")) || [];
let dbSiswa = JSON.parse(localStorage.getItem("db_siswa")) || [];
let dataJuaraSaatIni = [];

function kapitalAwal(teks) {
  return teks.replace(/\b\w/g, (huruf) => huruf.toUpperCase());
}

function perbaruiStatistik() {
  let totalJudul = dbBuku.length;
  let stokTersedia = dbBuku.reduce((jumlah, buku) => jumlah + buku.stok, 0);
  let dipinjamAktif = dbPinjam.filter((p) => p.status === "Dipinjam").length;
  let totalStokAsli = stokTersedia + dipinjamAktif;

  document.getElementById("statJudul").innerText = totalJudul;
  document.getElementById("statTotalStok").innerText = totalStokAsli;
  document.getElementById("statDipinjam").innerText = dipinjamAktif;
  document.getElementById("statTersedia").innerText = stokTersedia;
}

function resetSemua() {
  if (
    confirm(
      "AWAS! Ini bakal ngehapus SEMUA data (Buku, Murid, Peminjaman). Yakin banget nih?",
    )
  ) {
    localStorage.clear();
    alert("Sistem berhasil di-reset total!");
    location.reload();
  }
}
function resetBuku() {
  if (
    confirm(
      "Yakin mau ngehapus semua Data BUKU? Data murid dan pinjaman bakal tetep ada.",
    )
  ) {
    localStorage.removeItem("db_buku");
    alert("Data buku udah dibersihin!");
    location.reload();
  }
}
function resetMurid() {
  if (confirm("Yakin mau ngehapus semua Data MURID?")) {
    localStorage.removeItem("db_siswa");
    alert("Data akun murid udah dibersihin!");
    location.reload();
  }
}

function bukaModalSiswa() {
  document.getElementById("formSiswa").reset();
  document.getElementById("modalSiswa").classList.remove("hidden");
}
function tutupModalSiswa() {
  document.getElementById("modalSiswa").classList.add("hidden");
}

function simpanSiswaManual(e) {
  e.preventDefault();
  let emailBaru = document.getElementById("inputEmail").value.toLowerCase();
  let cekEmail = dbSiswa.find((s) => s.email.toLowerCase() === emailBaru);

  if (cekEmail) return alert("Gagal! Email ini udah dipakai murid lain.");

  let kls = document.getElementById("inputKelas").value;
  dbSiswa.push({
    id: Date.now(),
    nama: kapitalAwal(document.getElementById("inputNama").value.trim()),
    kelas: kls,
    email: emailBaru,
    sandi: document.getElementById("inputPass").value,
    angkatan: kls.split("-")[0],
  });

  localStorage.setItem("db_siswa", JSON.stringify(dbSiswa));
  alert("Mantap, akun murid berhasil dibuat!");
  e.target.reset();
  tutupModalSiswa();
  tampilSiswa();
}

function tampilSiswa() {
  let areaMurid = document.getElementById("tbSiswa");
  let cari = document.getElementById("cariMurid").value.toLowerCase();
  let filter = document.getElementById("filterMurid").value;
  areaMurid.innerHTML = "";

  let dataSaring = dbSiswa.filter((s) => {
    let cocokKata =
      s.nama.toLowerCase().includes(cari) ||
      s.email.toLowerCase().includes(cari);
    let cocokFilter = true;
    if (filter.startsWith("Angkatan "))
      cocokFilter = s.angkatan === filter.replace("Angkatan ", "");
    else if (filter.startsWith("Kelas "))
      cocokFilter = s.kelas === filter.replace("Kelas ", "");
    return cocokKata && cocokFilter;
  });

  if (dataSaring.length === 0) {
    areaMurid.innerHTML =
      '<tr><td colspan="4" class="p-4 text-center text-gray-400 italic text-xs">Murid tidak ditemukan.</td></tr>';
    return;
  }

  dataSaring.forEach((s) => {
    // PERBAIKAN: Kolom Email dan Password digabung atas bawah, teks bebas panjang
    areaMurid.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-gray-50">
                <td class="p-3 font-bold text-slate-700 text-xs">${s.nama}</td>
                <td class="p-3 text-[10px]"><span class="bg-slate-100 px-2 py-1 rounded font-bold">${s.kelas}</span></td>
                <td class="p-3">
                    <div class="text-[10px] text-blue-600 mb-1 break-all">${s.email}</div>
                    <div class="flex items-center gap-2">
                        <input type="password" id="pass-${s.id}" value="${s.sandi}" class="text-[11px] font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded w-24 sm:w-32 outline-none" readonly>
                        <button onclick="lihatPass(${s.id})" class="text-[10px] text-gray-400 hover:text-green-600 p-1 rounded" title="Lihat Password">
                            <i id="mata-${s.id}" class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </td>
                <td class="p-3 text-center flex flex-wrap justify-center gap-1">
                    <button onclick="ubahSandiMurid(${s.id})" class="text-[10px] text-slate-500 hover:bg-slate-200 p-1.5 rounded" title="Ganti Password"><i class="fa-solid fa-key"></i></button>
                    <button onclick="editMurid(${s.id})" class="text-[10px] text-blue-500 hover:bg-blue-100 p-1.5 rounded" title="Edit Data"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="hapusMurid(${s.id})" class="text-[10px] text-red-500 hover:bg-red-100 p-1.5 rounded" title="Hapus Murid"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
  });
}

function lihatPass(idMurid) {
  let inputSandi = document.getElementById(`pass-${idMurid}`);
  let ikonMata = document.getElementById(`mata-${idMurid}`);

  if (inputSandi.type === "password") {
    inputSandi.type = "text";
    ikonMata.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    inputSandi.type = "password";
    ikonMata.classList.replace("fa-eye-slash", "fa-eye");
  }
}

function editMurid(idMurid) {
  let murid = dbSiswa.find((s) => s.id === idMurid);
  if (!murid) return;

  let namaBaru = prompt("Ubah Nama Murid:", murid.nama);
  if (namaBaru === null || namaBaru.trim() === "") return;

  let emailBaru = prompt("Ubah Email Murid:", murid.email);
  if (emailBaru === null || emailBaru.trim() === "") return;
  emailBaru = emailBaru.toLowerCase();

  if (emailBaru !== murid.email) {
    let cekEmail = dbSiswa.find((s) => s.email === emailBaru);
    if (cekEmail) return alert("Gagal! Email ini udah dipakai murid lain.");
  }

  murid.nama = kapitalAwal(namaBaru.trim());
  murid.email = emailBaru;

  localStorage.setItem("db_siswa", JSON.stringify(dbSiswa));
  alert("Data murid berhasil di-update!");
  tampilSiswa();
}

function ubahSandiMurid(idMurid) {
  let murid = dbSiswa.find((s) => s.id === idMurid);
  if (!murid) return;
  let sandiBaru = prompt(`Ganti password buat ${murid.nama}:`, murid.sandi);
  if (sandiBaru !== null && sandiBaru.trim() !== "") {
    murid.sandi = sandiBaru.trim();
    localStorage.setItem("db_siswa", JSON.stringify(dbSiswa));
    alert("Sip, password berhasil diubah!");
    tampilSiswa();
  }
}

function hapusMurid(idMurid) {
  if (!confirm("Hapus akun murid ini?")) return;
  dbSiswa = dbSiswa.filter((s) => s.id !== idMurid);
  localStorage.setItem("db_siswa", JSON.stringify(dbSiswa));
  tampilSiswa();
}

function unduhExcelSiswa() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["Nama Lengkap", "Kelas", "Email", "Password"],
    ["Ahmad Fulan", "XI-I", "ahmad@mabi.com", "rahasia123"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "AkunMurid");
  XLSX.writeFile(wb, "Template_Murid_MABi.xlsx");
}

function unggahExcelSiswa(input) {
  let alatBaca = new FileReader();
  alatBaca.onload = (e) => {
    let mentahan = new Uint8Array(e.target.result);
    let fileXls = XLSX.read(mentahan, { type: "array" });
    let barisSiswa = XLSX.utils.sheet_to_json(
      fileXls.Sheets[fileXls.SheetNames[0]],
      { header: 1 },
    );
    let jmlMasuk = 0;
    for (let i = 1; i < barisSiswa.length; i++) {
      let b = barisSiswa[i];
      if (
        b[0] &&
        b[2] &&
        !dbSiswa.find((s) => s.email === b[2].toLowerCase())
      ) {
        let kls = b[1] || "X-I";
        dbSiswa.push({
          id: Date.now() + i,
          nama: kapitalAwal(b[0].trim()),
          kelas: kls,
          email: b[2].toLowerCase(),
          sandi: b[3] || "12345",
          angkatan: kls.split("-")[0],
        });
        jmlMasuk++;
      }
    }
    localStorage.setItem("db_siswa", JSON.stringify(dbSiswa));
    alert(`${jmlMasuk} murid di-import!`);
    tampilSiswa();
  };
  alatBaca.readAsArrayBuffer(input.files[0]);
  input.value = "";
}

function muatPeringkat() {
  let wadahList = document.getElementById("listPeringkat");
  let filter = document.getElementById("filterJuara").value;
  let kataCari = document.getElementById("cariJuara").value.toLowerCase();
  wadahList.innerHTML = "";

  let blnIni = new Date().getMonth();
  let rekapBulan = dbPinjam.filter(
    (p) => new Date(p.tglPinjam).getMonth() === blnIni,
  );

  if (filter.startsWith("Angkatan "))
    rekapBulan = rekapBulan.filter((p) =>
      p.kelas.startsWith(filter.replace("Angkatan ", "") + "-"),
    );
  else if (filter.startsWith("Kelas "))
    rekapBulan = rekapBulan.filter(
      (p) => p.kelas === filter.replace("Kelas ", ""),
    );

  let skor = {};
  rekapBulan.forEach((p) => (skor[p.nama] = (skor[p.nama] || 0) + 1));

  dataJuaraSaatIni = Object.keys(skor)
    .map((k) => ({ nama: k, total: skor[k] }))
    .sort((a, b) => b.total - a.total);
  if (kataCari)
    dataJuaraSaatIni = dataJuaraSaatIni.filter((item) =>
      item.nama.toLowerCase().includes(kataCari),
    );

  if (dataJuaraSaatIni.length === 0)
    wadahList.innerHTML =
      '<li class="text-gray-400 italic">Belum ada peminjam / nama tidak ketemu.</li>';

  dataJuaraSaatIni.slice(0, 10).forEach((item, i) => {
    let medali = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🔹";
    wadahList.innerHTML += `<li class="flex justify-between items-center bg-gray-50 p-2 rounded border"><span class="font-bold text-gray-700">${medali} ${item.nama}</span> <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">${item.total} Buku</span></li>`;
  });
}

function cetakPDFJuara() {
  if (dataJuaraSaatIni.length === 0) return alert("Belum ada data rekapan.");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let filter = document.getElementById("filterJuara").value;
  let bulan = new Date().toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  pdf.setFillColor(22, 163, 74);
  pdf.rect(0, 0, 210, 30, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("LEADERBOARD LITERASI MABi", 105, 15, { align: "center" });
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Kategori: ${filter} | Bulan: ${bulan}`, 105, 22, {
    align: "center",
  });

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 40, 190, 40);
  pdf.text("No", 25, 46);
  pdf.text("Nama Siswa", 45, 46);
  pdf.text("Buku Dipinjam", 155, 46);
  pdf.line(20, 50, 190, 50);

  let y = 58;
  dataJuaraSaatIni.forEach((item, i) => {
    pdf.text(`#${i + 1}`, 26, y);
    pdf.text(item.nama, 45, y);
    pdf.text(`${item.total} Buku`, 155, y);
    pdf.line(20, y + 4, 190, y + 4);
    y += 10;
  });
  pdf.save(`Leaderboard_${filter}_${bulan}.pdf`);
}

function muatTabelPinjam() {
  let areaAktif = document.getElementById("tbPinjam");
  let areaRiwayat = document.getElementById("tbRiwayat");
  let ketikanAktif = document.getElementById("cariAktif").value.toLowerCase();
  let ketikanRiwayat = document
    .getElementById("cariRiwayat")
    .value.toLowerCase();

  areaAktif.innerHTML = "";
  areaRiwayat.innerHTML = "";

  let dipinjam = dbPinjam.filter((p) => p.status === "Dipinjam");
  let riwayat = dbPinjam.filter((p) => p.status === "Kembali");

  dipinjam = dipinjam.filter(
    (p) =>
      p.nama.toLowerCase().includes(ketikanAktif) ||
      (p.email && p.email.toLowerCase().includes(ketikanAktif)),
  );

  riwayat = riwayat.filter((p) => {
    let buku = dbBuku.find((x) => x.id === p.idBuku) || { judul: "" };
    return (
      p.nama.toLowerCase().includes(ketikanRiwayat) ||
      (p.email && p.email.toLowerCase().includes(ketikanRiwayat)) ||
      buku.judul.toLowerCase().includes(ketikanRiwayat)
    );
  });

  if (dipinjam.length === 0)
    areaAktif.innerHTML =
      '<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">Data kosong/nggak nemu.</td></tr>';
  if (riwayat.length === 0)
    areaRiwayat.innerHTML =
      '<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">Data kosong/nggak nemu.</td></tr>';

  dipinjam.forEach((p) => {
    let buku = dbBuku.find((b) => b.id === p.idBuku) || { judul: "Dihapus" };
    let hHriIni = new Date();
    hHriIni.setHours(0, 0, 0, 0);
    let batas = new Date(p.tempo);
    batas.setHours(0, 0, 0, 0);

    let telat = hHriIni > batas;
    let hrTelat = telat ? Math.ceil((hHriIni - batas) / 86400000) : 0;
    let denda = hrTelat * 500;

    areaAktif.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-gray-100">
                <td class="p-3 text-[10px] text-blue-600 font-medium">${p.email || "-"}</td>
                <td class="p-3 font-bold">${p.nama}<br><span class="text-[10px] text-gray-500">${p.kelas}</span></td>
                <td class="p-3 text-xs max-w-[120px] truncate">${buku.judul}</td>
                <td class="p-3 text-xs ${telat ? "text-red-600 font-bold" : ""}">${new Date(p.tempo).toLocaleDateString("id-ID")} ${telat ? `<br>(Telat ${hrTelat} Hr - Rp${denda})` : ""}</td>
                <td class="p-3 text-center"><button onclick="terimaBuku(${p.id}, ${denda})" class="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded shadow">Selesai</button></td>
            </tr>
        `;
  });

  riwayat
    .sort((a, b) => new Date(b.tglKembali) - new Date(a.tglKembali))
    .forEach((p) => {
      let buku = dbBuku.find((b) => b.id === p.idBuku) || { judul: "Dihapus" };
      let badge =
        p.ketStatus === "Telat"
          ? "bg-red-100 text-red-600"
          : "bg-green-100 text-green-600";

      areaRiwayat.innerHTML += `
            <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="p-3 text-[10px] text-blue-600 font-medium">${p.email || "-"}</td>
                <td class="p-3 text-xs font-bold">${p.nama}</td>
                <td class="p-3 text-xs max-w-[120px] truncate">${buku.judul}</td>
                <td class="p-3 text-xs font-mono text-red-500">${p.denda > 0 ? "Rp " + p.denda : "-"}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${badge}">${p.ketStatus}</span></td>
            </tr>
        `;
    });
  perbaruiStatistik();
  muatPeringkat();
}

function terimaBuku(idPinjam, tagihan) {
  if (tagihan > 0) {
    if (
      !confirm(
        `⚠️ DENDA!\nAnak ini telat. Tagih denda Rp ${tagihan}. Klik OK kalau lunas.`,
      )
    )
      return;
  } else {
    if (!confirm("Buku udah dibalikin aman?")) return;
  }

  let pos = dbPinjam.findIndex((p) => p.id === idPinjam);
  dbPinjam[pos].status = "Kembali";
  dbPinjam[pos].tglKembali = new Date().toISOString();
  dbPinjam[pos].ketStatus = tagihan > 0 ? "Telat" : "Pas Waktu";
  dbPinjam[pos].denda = tagihan;

  let posBuku = dbBuku.findIndex((b) => b.id === dbPinjam[pos].idBuku);
  if (posBuku !== -1) dbBuku[posBuku].stok++;

  localStorage.setItem("db_buku", JSON.stringify(dbBuku));
  localStorage.setItem("db_pinjam", JSON.stringify(dbPinjam));
  muatTabelPinjam();
}

function cetakLogRiwayat() {
  let ketikanRiwayat = document
    .getElementById("cariRiwayat")
    .value.toLowerCase();
  let riwayat = dbPinjam
    .filter((p) => p.status === "Kembali")
    .filter((p) => {
      let b = dbBuku.find((x) => x.id === p.idBuku) || { judul: "" };
      return (
        p.nama.toLowerCase().includes(ketikanRiwayat) ||
        (p.email && p.email.toLowerCase().includes(ketikanRiwayat)) ||
        b.judul.toLowerCase().includes(ketikanRiwayat)
      );
    });

  if (riwayat.length === 0) return alert("Belum ada riwayat yang sesuai!");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let tglCetak = new Date().toLocaleDateString("id-ID");

  pdf.setFillColor(22, 163, 74);
  pdf.rect(0, 0, 297, 30, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("LOG PENGEMBALIAN PERPUSTAKAAN", 148.5, 15, { align: "center" });
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`MA Bilingual | Dicetak: ${tglCetak}`, 148.5, 22, {
    align: "center",
  });

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(15, 40, 282, 40);

  pdf.text("Tgl Kembali", 18, 45);
  pdf.text("Email Peminjam", 45, 45);
  pdf.text("Nama Siswa", 110, 45);
  pdf.text("Judul Buku", 160, 45);
  pdf.text("Denda", 240, 45);
  pdf.text("Status", 265, 45);
  pdf.line(15, 48, 282, 48);

  let y = 55;
  riwayat.forEach((p) => {
    if (y > 190) {
      pdf.addPage();
      y = 20;
    }

    let b = dbBuku.find((x) => x.id === p.idBuku) || { judul: "Buku Dihapus" };
    let judulPdk =
      pdf.splitTextToSize(b.judul, 75)[0] + (b.judul.length > 75 ? ".." : "");
    let namaPdk =
      pdf.splitTextToSize(p.nama, 45)[0] + (p.nama.length > 45 ? ".." : "");

    pdf.text(new Date(p.tglKembali).toLocaleDateString("id-ID"), 18, y);
    pdf.text(p.email || "-", 45, y);
    pdf.text(namaPdk, 110, y);
    pdf.text(judulPdk, 160, y);
    pdf.text(p.denda > 0 ? `Rp${p.denda}` : "-", 240, y);
    pdf.text(p.ketStatus, 265, y);
    pdf.line(15, y + 3, 282, y + 3);
    y += 8;
  });
  pdf.save(`Log_Pengembalian_${tglCetak.replace(/\//g, "-")}.pdf`);
}

function unduhExcelBuku() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([["Judul", "Penulis", "Edisi", "Stok"]]);
  XLSX.utils.book_append_sheet(wb, ws, "Buku");
  XLSX.writeFile(wb, "Template_Buku.xlsx");
}

function unggahExcelBuku(input) {
  let alatBaca = new FileReader();
  alatBaca.onload = (e) => {
    let b = XLSX.utils.sheet_to_json(
      XLSX.read(new Uint8Array(e.target.result), { type: "array" }).Sheets[0],
      { header: 1 },
    );
    for (let i = 1; i < b.length; i++) {
      if (b[i][0])
        dbBuku.push({
          id: Date.now() + i,
          judul: b[i][0],
          penulis: b[i][1] || "-",
          edisi: b[i][2] || "-",
          stok: parseInt(b[i][3]) || 0,
        });
    }
    localStorage.setItem("db_buku", JSON.stringify(dbBuku));
    alert("Buku ditambah!");
    location.reload();
  };
  alatBaca.readAsArrayBuffer(input.files[0]);
}

tampilSiswa();
muatTabelPinjam();
