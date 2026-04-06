const popUp = document.getElementById("modalLogin");

function bukaLogin(peran) {
  popUp.classList.remove("hidden");
  document.getElementById("peran").value = peran;
  document.getElementById("judulLogin").innerText =
    peran === "admin" ? "Login Admin" : "Login Siswa";

  document
    .getElementById("boxSiswa")
    .classList.toggle("hidden", peran !== "siswa");
  document
    .getElementById("boxAdmin")
    .classList.toggle("hidden", peran !== "admin");

  document.getElementById("emailSiswa").required = peran === "siswa";
  document.getElementById("passSiswa").required = peran === "siswa";
  document.getElementById("userAdmin").required = peran === "admin";
  document.getElementById("passAdmin").required = peran === "admin";

  document.getElementById("formMasuk").reset();
  document.getElementById("passSiswa").type = "password";
  document.getElementById("passAdmin").type = "password";
  document.getElementById("ikonMataSiswa").className = "fa-solid fa-eye";
  document.getElementById("ikonMataAdmin").className = "fa-solid fa-eye";
}

function tutupLogin() {
  popUp.classList.add("hidden");
}

function intipSandi(idInput, idIkon) {
  let inputSandi = document.getElementById(idInput);
  let ikonMata = document.getElementById(idIkon);

  if (inputSandi.type === "password") {
    inputSandi.type = "text";
    ikonMata.classList.remove("fa-eye");
    ikonMata.classList.add("fa-eye-slash");
  } else {
    inputSandi.type = "password";
    ikonMata.classList.remove("fa-eye-slash");
    ikonMata.classList.add("fa-eye");
  }
}

function prosesLogin(e) {
  e.preventDefault();
  let peran = document.getElementById("peran").value;

  if (peran === "siswa") {
    let inputEmail = document.getElementById("emailSiswa").value.toLowerCase();
    let inputPass = document.getElementById("passSiswa").value;
    let dbSiswa = JSON.parse(localStorage.getItem("db_siswa")) || [];

    let ketemu = dbSiswa.find(
      (s) => s.email.toLowerCase() === inputEmail && s.sandi === inputPass,
    );

    if (ketemu) {
      localStorage.setItem("userAktif", JSON.stringify(ketemu));
      window.location.href = "siswa.html";
    } else {
      alert(
        "Email atau Password salah! Pastikan kamu udah didaftarin Admin ya.",
      );
    }
  } else {
    let u = document.getElementById("userAdmin").value;
    let p = document.getElementById("passAdmin").value;
    if (u === "admin" && p === "ADMINONLY") window.location.href = "admin.html";
    else alert("Username atau Password Admin salah nih.");
  }
}

// Dummy Database Buat Testing Awal
let dbBuku = JSON.parse(localStorage.getItem("db_buku"));
if (!dbBuku || dbBuku.length === 0) {
  let bukuBawaan = [
    {
      id: 101,
      judul: "Informatika Kelas 11 Kurikulum Merdeka",
      penulis: "Kemendikbud",
      edisi: "2023",
      stok: 35,
    },
    {
      id: 102,
      judul: "Fikih Islam Wa Adillatuhu",
      penulis: "Wahbah Az-Zuhaili",
      edisi: "Jilid 1",
      stok: 5,
    },
    {
      id: 103,
      judul: "Sejarah Kebudayaan Islam",
      penulis: "Kemenag RI",
      edisi: "2023",
      stok: 15,
    },
  ];
  localStorage.setItem("db_buku", JSON.stringify(bukuBawaan));
}
