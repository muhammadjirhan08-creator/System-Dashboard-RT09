// =======================================================
// 1. EVENT LISTENER (SHORTCUT & LOGIN CHECK)
// =======================================================
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
    e.preventDefault(); 
    bukaPencarian(); 
  }
  if (e.key === 'Escape') {
    closeModal('modal-pencarian');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    showDashboard();
  }
  
  const passwordInput = document.getElementById('password');
  const usernameInput = document.getElementById('username');

  if (passwordInput) {
    passwordInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); login(); }
    });
  }
  if (usernameInput) {
    usernameInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); passwordInput.focus(); }
    });
  }
});

// =======================================================
// 2. DATA GLOBAL
// =======================================================
let dataWarga = [];
let dataKK = [];
let dataIuran = [];
let dataPengumuman = [];
let dataSurat = []; 

// =======================================================
// 3. JAM & NAVIGASI (DENGAN HAK AKSES)
// =======================================================
function updateClock() {
  const now = new Date();
  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');
  const detik = String(now.getSeconds()).padStart(2, '0');
  const clockEl = document.getElementById('live-clock');
  if(clockEl) clockEl.innerText = `${jam}:${menit}:${detik}`;
}
setInterval(updateClock, 1000);
updateClock(); 

document.querySelectorAll('.sidebar .menu li[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    const namaUserAktif = sessionStorage.getItem('namaUser') || '';
    
    const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
    const isAdmin = adminPenuh.includes(namaUserAktif);
    const menuTerlarang = ['warga', 'kk', 'iuran', 'pengumuman'];

    if (!isAdmin && menuTerlarang.includes(page)) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('akses-ditolak').classList.add('active');
      document.getElementById('page-title').textContent = 'Akses Ditolak';
      document.querySelectorAll('.sidebar .menu li').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      return; 
    }

    document.querySelectorAll('.sidebar .menu li').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    item.classList.add('active');
    document.getElementById(page).classList.add('active');
    const pageTitleEl = document.getElementById('page-title');
    if (pageTitleEl) pageTitleEl.textContent = item.textContent.trim();
    
    if (page === 'dashboard') renderCharts(); 
    if (page === 'warga') renderWarga();
    if (page === 'kk') renderKK();
    if (page === 'iuran') renderIuran();
    if (page === 'pengumuman') renderPengumuman();
    if (page === 'laporan') renderIuran();
    if (page === 'surat') renderSurat();
    if (page === 'home') renderHomeSurat();
    if (page === 'pengaduan') renderPengaduan();
    if (page === 'pengaduan') renderHomePengaduan();
  });
});

// =======================================================
// 4. LOGIN & DASHBOARD
// =======================================================
function login() {
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const alertBox = document.getElementById('alert-error');
  
  if(alertBox) alertBox.style.display = 'none';

  window.fbSignIn(window.fbAuth, email, password)
    .then(() => {
      sessionStorage.setItem('isLoggedIn', 'true');
      
      let namaUser = "Admin RT"; 
      if(email.includes('ketua')) namaUser = "Wagimin";
      if(email.includes('jirhan')) namaUser = "Muhammad Jirhan";
      if(email.includes('kader')) namaUser = "Saikem";
      if(email.includes('bendahara')) namaUser = "Sri Ubayati";
      if(email.includes('sekretaris')) namaUser = "Widodo";
      if(email.includes('warga')) namaUser = "Warga";
      
      sessionStorage.setItem('namaUser', namaUser); 
      showDashboard();
    })
    .catch(() => {
      if(alertBox) {
        alertBox.style.display = 'flex';
        document.getElementById('alert-text').innerText = 'Email atau Password salah!';
      }
    });
}

function logout() {
  if (confirm('Yakin ingin keluar?')) {
    window.fbSignOut(window.fbAuth).then(() => {
      sessionStorage.removeItem('isLoggedIn');
      location.reload(); 
    });
  }
}

function showDashboard() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-content').style.display = 'flex'; 
  
  const namaUser = sessionStorage.getItem('namaUser') || 'Admin RT';
  const greetingEl = document.getElementById('greeting-user');
  if(greetingEl) greetingEl.innerText = `Halo, ${namaUser}`;

  const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
  const sidebarMenus = document.querySelectorAll('.sidebar .menu li');

    if (!adminPenuh.includes(namaUser)) {
    const menuTerlarang = ['warga', 'kk', 'iuran', 'pengumuman', 'pengaduan'];
    sidebarMenus.forEach(menu => {
      const pageName = menu.getAttribute('data-page');
      if (menuTerlarang.includes(pageName)) menu.style.display = 'none'; 
    });
  } else {
    sidebarMenus.forEach(menu => menu.style.display = 'flex');
  }
    // Sembunyikan Quick Action khusus Admin jika yang login Warga
  const adminOnlyItems = document.querySelectorAll('.admin-only');
  if (!adminPenuh.includes(namaUser)) {
    adminOnlyItems.forEach(item => item.style.display = 'none');
  } else {
    adminOnlyItems.forEach(item => item.style.display = 'flex');
  }

  renderWarga(); renderKK(); renderIuran(); renderPengumuman(); renderPengaduan(); renderCharts(); renderHomeSurat(); renderHomePengaduan();
  
  const homeMenu = document.querySelector('[data-page="home"]');
  if(homeMenu) homeMenu.click();
}
  // ==========================================
  // KODE PAKSA BUKA PENGADUAN DILETAKKAN DI SINI
  // (Di dalam showDashboard, di paling bawah sebelum tutup })
  // ==========================================
  const menuAd = document.querySelector('[data-page="pengaduan"]');
  if(menuAd) {
    menuAd.addEventListener('click', () => {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('pengaduan').classList.add('active');
      
      const titleEl = document.getElementById('page-title');
      if(titleEl) titleEl.textContent = 'Pengaduan Warga';
    });
  }
// =======================================================
// 5. FUNGSI MODAL
// =======================================================
function openModalWarga() { document.getElementById('modal-warga').classList.add('active'); }
function openModalKK() { document.getElementById('modal-kk').classList.add('active'); }
function openModalIuran() { document.getElementById('modal-iuran').classList.add('active'); }
function openModalPengumuman() { document.getElementById('modal-pengumuman').classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// =======================================================
// 6. DATA WARGA
// =======================================================
function renderWarga() {
  const tbody = document.querySelector('#table-warga tbody');
  if (!tbody) return; 

  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "warga"), (snapshot) => {
    tbody.innerHTML = '';
    dataWarga = []; 
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#64748b;">Belum ada data warga.</td></tr>';
      const elTotalWarga = document.getElementById('total-warga');
      if (elTotalWarga) elTotalWarga.textContent = '0';
      return;
    }

    let index = 1;
    snapshot.forEach((doc) => {
      const w = doc.data();
      w.id = doc.id; 
      dataWarga.push(w);

      tbody.innerHTML += `
        <tr>
          <td>${index++}</td>
          <td style="white-space: nowrap;">
            <button class="btn-secondary" onclick="lihatWarga('${doc.id}')" style="margin-right: 5px; background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Lihat"><i class="fas fa-eye"></i></button>
            <button class="btn-secondary" onclick="openEditWarga('${doc.id}')" style="margin-right: 5px; background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn-secondary" onclick="hapusWarga('${doc.id}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Hapus"><i class="fas fa-trash"></i></button>
          </td>
          <td>${w.nama || '-'}</td>
          <td>${w.nik || '-'}</td>
          <td>${w.noKK || '-'}</td>
          <td>${w.jk === 'L' ? 'Laki-laki' : (w.jk === 'P' ? 'Perempuan' : '-')}</td>
          <td>${w.pekerjaan || '-'}</td>
          <td>${w.alamat || '-'}</td>
          <td><span class="badge ${w.status === 'Tetap' ? 'badge-success' : 'badge-danger'}">${w.status || '-'}</span></td>
        </tr>`;
    });
    
    const elTotalWarga = document.getElementById('total-warga');
    if (elTotalWarga) elTotalWarga.textContent = dataWarga.length;
  });
}

async function simpanWarga() {
  const nama = document.getElementById('w-nama').value.trim(); 
  const nik = document.getElementById('w-nik').value.trim(); 
  const noKK = document.getElementById('w-kk').value.trim(); 
  const jk = document.getElementById('w-jk').value;
  const pekerjaan = document.getElementById('w-pekerjaan').value.trim();
  const alamat = document.getElementById('w-alamat').value.trim();
  const status = document.getElementById('w-status').value;
  
  if (!nama || !nik || !alamat) return alert('Lengkapi data wajib (Nama, NIK, dan Alamat)!');

  try {
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "warga"), {
      nama: nama, nik: nik, noKK: noKK, jk: jk, pekerjaan: pekerjaan, alamat: alamat, status: status
    });
    
    showToast('Data warga berhasil ditambahkan!');
    closeModal('modal-warga');
    document.getElementById('w-nama').value = '';
    document.getElementById('w-nik').value = '';
    document.getElementById('w-kk').value = ''; 
    document.getElementById('w-pekerjaan').value = '';
    document.getElementById('w-alamat').value = '';
  } catch (error) { console.error("Error: ", error); alert('Gagal menyimpan data.'); }
}

async function lihatWarga(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "warga", idDokumen));
    if (docSnap.exists()) {
      const w = docSnap.data();
      document.getElementById('lihat-nama').innerText = w.nama || '-';
      document.getElementById('lihat-nik').innerText = w.nik || '-';
      document.getElementById('lihat-kk').innerText = w.noKK || '-';
      document.getElementById('lihat-jk').innerText = w.jk === 'L' ? 'Laki-laki' : 'Perempuan';
      document.getElementById('lihat-pekerjaan').innerText = w.pekerjaan || '-';
      document.getElementById('lihat-alamat').innerText = w.alamat || '-';
      document.getElementById('lihat-status').innerText = w.status || '-';
      document.getElementById('modal-lihat-warga').classList.add('active');
    }
  } catch (error) { console.error("Error lihat: ", error); }
}

async function openEditWarga(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "warga", idDokumen));
    if (docSnap.exists()) {
      const w = docSnap.data();
      document.getElementById('edit-w-id').value = idDokumen;
      document.getElementById('edit-w-nama').value = w.nama || '';
      document.getElementById('edit-w-nik').value = w.nik || '';
      document.getElementById('edit-w-kk').value = w.noKK || '';
      document.getElementById('edit-w-jk').value = w.jk || 'L';
      document.getElementById('edit-w-pekerjaan').value = w.pekerjaan || '';
      document.getElementById('edit-w-alamat').value = w.alamat || '';
      document.getElementById('edit-w-status').value = w.status || 'Tetap';
      document.getElementById('modal-edit-warga').classList.add('active');
    }
  } catch (error) { console.error("Error edit: ", error); }
}

async function simpanEditWarga() {
  const idDokumen = document.getElementById('edit-w-id').value;
  const dataBaru = {
    nama: document.getElementById('edit-w-nama').value.trim(),
    nik: document.getElementById('edit-w-nik').value.trim(),
    noKK: document.getElementById('edit-w-kk').value.trim(),
    jk: document.getElementById('edit-w-jk').value,
    pekerjaan: document.getElementById('edit-w-pekerjaan').value.trim(),
    alamat: document.getElementById('edit-w-alamat').value.trim(),
    status: document.getElementById('edit-w-status').value
  };

  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    await updateDoc(window.fbDoc(window.firebaseDB, "warga", idDokumen), dataBaru);
    alert('Data warga berhasil diupdate!');
    closeModal('modal-edit-warga');
  } catch (error) { console.error("Error update: ", error); alert('Gagal mengupdate data.'); }
}

async function hapusWarga(idDokumen) {
  if (confirm('Hapus data warga ini?')) {
    try { await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "warga", idDokumen)); } 
    catch (error) { console.error("Error hapus: ", error); }
  }
}

// =======================================================
// 7. EXPORT EXCEL
// =======================================================
function exportExcel() {
  if (dataWarga.length === 0) return alert('Tidak ada data untuk diexport.');
  let tableHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr><th>ID</th><th>Nama</th><th>NIK</th><th>No. KK</th><th>Jenis Kelamin</th><th>Pekerjaan</th><th>Alamat</th><th>Status</th></tr></thead><tbody>`;
  
  dataWarga.forEach((w, index) => {
    let jenisKelaminLengkap = '-';
    if (w.jk === 'L') jenisKelaminLengkap = 'Laki-laki';
    if (w.jk === 'P') jenisKelaminLengkap = 'Perempuan';

    tableHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${w.nama || '-'}</td>
        <td>${w.nik || '-'}</td>
        <td>${w.noKK || '-'}</td>
        <td>${jenisKelaminLengkap}</td>
        <td>${w.pekerjaan || '-'}</td>
        <td>${w.alamat || '-'}</td>
        <td>${w.status || '-'}</td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table></body></html>`;
  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Data_Warga_RT09_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// =======================================================
// 8. DATA KK
// =======================================================
function renderKK() {
  const tbody = document.querySelector('#table-kk tbody'); 
  if(!tbody) return;
  
  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "kk"), (snapshot) => {
    tbody.innerHTML = '';
    dataKK = [];
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada data KK.</td></tr>';
      return;
    }

    let i = 1;
    snapshot.forEach((doc) => {
      const k = doc.data(); k.id = doc.id; dataKK.push(k);
      tbody.innerHTML += `
        <tr>
          <td>${i++}</td><td>${k.nomor || '-'}</td><td>${k.kepala || '-'}</td><td>${k.jumlah || '-'} Orang</td><td>${k.alamat || '-'}</td>
          <td style="white-space: nowrap;">
            <button class="btn-secondary" onclick="openEditKK('${doc.id}')" style="margin-right: 5px; background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-edit"></i></button>
            <button class="btn-secondary" onclick="hapusKK('${doc.id}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
    });
    
    const totalKkEl = document.getElementById('total-kk');
    if(totalKkEl) totalKkEl.innerText = dataKK.length;
  });
}

async function simpanKK() {
  const nomor = document.getElementById('kk-nomor').value.trim();
  const kepala = document.getElementById('kk-kepala').value.trim();
  const jumlah = document.getElementById('kk-jumlah').value.trim();
  const alamat = document.getElementById('kk-alamat').value.trim();
  
  if (!nomor || !kepala || !alamat) return alert('Lengkapi data KK (Nomor, Kepala, dan Alamat)!');

  try {
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "kk"), { nomor, kepala, jumlah, alamat });
    showToast('Data KK berhasil ditambahkan!');
    closeModal('modal-kk');
    document.getElementById('kk-nomor').value = ''; document.getElementById('kk-kepala').value = ''; document.getElementById('kk-jumlah').value = ''; document.getElementById('kk-alamat').value = '';
  } catch (error) { console.error("Error simpan KK: ", error); alert('Gagal menyimpan data KK. Periksa koneksi internet.'); }
}

async function openEditKK(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "kk", idDokumen));
    if (docSnap.exists()) {
      const k = docSnap.data();
      document.getElementById('edit-kk-id').value = idDokumen;
      document.getElementById('edit-kk-nomor').value = k.nomor || '';
      document.getElementById('edit-kk-kepala').value = k.kepala || '';
      document.getElementById('edit-kk-jumlah').value = k.jumlah || '';
      document.getElementById('edit-kk-alamat').value = k.alamat || '';
      document.getElementById('modal-edit-kk').classList.add('active');
    }
  } catch (error) { console.error("Error: ", error); }
}

async function simpanEditKK() {
  const idDokumen = document.getElementById('edit-kk-id').value;
  const dataBaru = {
    nomor: document.getElementById('edit-kk-nomor').value.trim(),
    kepala: document.getElementById('edit-kk-kepala').value.trim(),
    jumlah: document.getElementById('edit-kk-jumlah').value.trim(),
    alamat: document.getElementById('edit-kk-alamat').value.trim()
  };
  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    await updateDoc(window.fbDoc(window.firebaseDB, "kk", idDokumen), dataBaru);
    alert('Data KK diupdate!'); closeModal('modal-edit-kk');
  } catch (error) { console.error("Error: ", error); }
}

async function hapusKK(idDokumen) {
  if (confirm('Hapus data KK ini?')) {
    try { await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "kk", idDokumen)); } 
    catch (error) { console.error("Error: ", error); }
  }
}

// =======================================================
// 9. DATA IURAN (FIREBASE)
// =======================================================
function renderIuran() {
  const tbody = document.querySelector('#table-iuran tbody');
  if (!tbody) return;

  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "iuran"), (snapshot) => {
    tbody.innerHTML = '';
    let total = 0, belum = 0;

    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b;">Belum ada data iuran.</td></tr>';
      document.getElementById('total-iuran').textContent = '0';
      document.getElementById('belum-bayar').textContent = '0';
      return;
    }

    let index = 1;
    snapshot.forEach((doc) => {
      const d = doc.data();
      if (d.status === 'Lunas') total += Number(d.jumlah);
      else belum++;

      tbody.innerHTML += `
        <tr>
          <td>${index++}</td>
          <td>${d.nama || '-'}</td>
          <td>${d.bulan || '-'}</td>
          <td>Rp ${Number(d.jumlah).toLocaleString('id-ID')}</td>
          <td><span class="badge ${d.status === 'Lunas' ? 'badge-success' : 'badge-danger'}">${d.status || '-'}</span></td>
          <td><button class="btn-secondary" onclick="hapusIuran('${doc.id}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });

    document.getElementById('total-iuran').textContent = total.toLocaleString('id-ID');
    document.getElementById('belum-bayar').textContent = belum;
    document.getElementById('lap-pemasukan').textContent = total.toLocaleString('id-ID');
    document.getElementById('lap-pengeluaran').textContent = '0';
    document.getElementById('lap-saldo').textContent = total.toLocaleString('id-ID');
  });
}

async function simpanIuran() {
  const nama = document.getElementById('i-nama').value.trim();
  const bulan = document.getElementById('i-bulan').value.trim();
  const jumlah = document.getElementById('i-jumlah').value;
  
  if (!nama || !bulan || !jumlah) return alert('Lengkapi data iuran!');

  try {
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "iuran"), {
      nama: nama,
      bulan: bulan,
      jumlah: Number(jumlah),
      status: 'Lunas'
    });
    
    showToast('Data iuran berhasil dicatat!');
    closeModal('modal-iuran');
    document.getElementById('i-nama').value = '';
    document.getElementById('i-bulan').value = '';
    document.getElementById('i-jumlah').value = '';
  } catch (error) {
    console.error("Error simpan iuran: ", error);
    alert('Gagal menyimpan data iuran.');
  }
}

async function hapusIuran(idDokumen) {
  if (confirm('Hapus data iuran ini?')) {
    try {
      await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "iuran", idDokumen));
      showToast('Data iuran berhasil dihapus!');
    } catch (error) {
      console.error("Error hapus iuran: ", error);
    }
  }
}

// =======================================================
// 10. PENGUMUMAN
// =======================================================
function renderPengumuman() {
  // Ambil data user yang login di paling atas fungsi
  const namaUserAktif = sessionStorage.getItem('namaUser') || '';
  const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
  const isAdmin = adminPenuh.includes(namaUserAktif);

  // ==========================================
  // BAGIAN 1: UNTUK HALAMAN MENU PENGUMUMAN
  // ==========================================
  const list = document.getElementById('list-pengumuman');
  if(list) {
    window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "pengumuman"), (snapshot) => {
      list.innerHTML = '';
      if (snapshot.empty) {
        list.innerHTML = '<p style="color:#64748b">Belum ada pengumuman.</p>';
        return;
      }
      snapshot.forEach((doc) => {
        const p = doc.data();
        
        // Logika Gambar
        let gambarHTML = '';
        let linkGambarWA = '';
        if (p.gambar) {
          gambarHTML = `<img src="${p.gambar}" alt="Gambar Pengumuman" style="max-width: 100%; max-height: 250px; border-radius: 8px; margin-top: 10px; margin-bottom: 10px; display: block;">`;
          linkGambarWA = `\n\nKlik di sini untuk melihat Poster Pengumuman:\n${p.gambar}`;
        }

        // Pesan WhatsApp
        const pesanWA = encodeURIComponent(`*PENGUMUMAN RT 09 KARANG REJO*\n\n*Judul:* ${p.judul}\n*Tanggal:* ${p.tanggal}\n\n${p.isi}${linkGambarWA}\n\n_— Sistem Informasi RT 09_`);
        const linkWA = `https://wa.me/?text=${pesanWA}`;

        // Variabel tombol (Dideklarasikan dengan benar)
        let tombolWA = '';
        let tombolAksiAdmin = '';

        if (isAdmin) {
          tombolWA = `<a href="${linkWA}" target="_blank" class="btn-secondary" style="background: #25D366; color: white; border: none; padding: 5px 10px; border-radius: 5px; text-decoration: none;" title="Bagikan ke WhatsApp"><i class="fab fa-whatsapp"></i></a>`;
          
          tombolAksiAdmin = `
            <button class="btn-secondary" onclick="bukaEditPengumuman('${doc.id}')" style="background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn-secondary" onclick="hapusPengumuman('${doc.id}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Hapus"><i class="fas fa-trash"></i></button>
          `;
        }

        list.innerHTML += `
          <div class="pengumuman-item" style="position: relative;">
            <h4>${p.judul}</h4>
            <p>${p.isi}</p>
            ${gambarHTML} 
            <small>📅 ${p.tanggal}</small>
            
            <div style="position: absolute; top: 15px; right: 15px; display: flex; gap: 5px;">
              ${tombolWA}
              ${tombolAksiAdmin}
            </div>
          </div>`;
      });
    });
  }

  // ==========================================
  // BAGIAN 2: UNTUK KOTAK DI HALAMAN HOME
  // ==========================================
  const homeList = document.getElementById('home-list-pengumuman');
  if (homeList) {
    window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "pengumuman"), (snapshot) => {
      homeList.innerHTML = ''; 
      if (snapshot.empty) {
        homeList.innerHTML = '<p style="color:#64748b; font-size:13px;">Belum ada pengumuman terbaru.</p>';
        return;
      }
      
      let count = 0;
      snapshot.forEach((doc) => {
        if (count < 3) {
          const p = doc.data();
          
          let gambarHTMLHome = '';
          let linkGambarWAHome = '';
          if (p.gambar) {
            gambarHTMLHome = `<img src="${p.gambar}" alt="Gambar" style="max-width: 100%; max-height: 150px; border-radius: 6px; margin-top: 8px; display: block;">`;
            linkGambarWAHome = `\n\n${p.gambar}`;
          }

          let tombolWAHome = '';
          if (isAdmin) {
            tombolWAHome = `<a href="https://wa.me/?text=${encodeURIComponent(`*PENGUMUMAN RT 09*\n\n*${p.judul}*\n${p.isi}${linkGambarWAHome}\n\n_— RT 09 Karang Rejo_`)}" target="_blank" style="position: absolute; top: 15px; right: 15px; color: #25D366; font-size: 20px;" title="Bagikan ke WhatsApp"><i class="fab fa-whatsapp"></i></a>`;
          }

          homeList.innerHTML += `
            <div class="list-item" style="position: relative;">
              <div class="list-icon green"><i class="fas fa-bullhorn"></i></div>
              <div class="list-content">
                <h4>${p.judul}</h4>
                <p>${p.isi}</p>
                ${gambarHTMLHome} 
                <small>📅 ${p.tanggal}</small>
              </div>
              ${tombolWAHome}
            </div>`;
          count++;
        }
      });
    });
  }
}

async function simpanPengumuman() {
  const judul = document.getElementById('p-judul').value.trim();
  const isi = document.getElementById('p-isi').value.trim();
  const fileInput = document.getElementById('p-gambar');
  const file = fileInput.files[0];

  if (!judul || !isi) return alert('Judul dan Isi Pengumuman tidak boleh kosong!');

  const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  let imageUrl = '';

  try {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      // PASTIKAN TIDAK ADA SPASI ATAU KARAKTER ANEH
      formData.append('upload_preset', 'system_dashboard_rt09'); 

      // Gunakan URL yang benar tanpa spasi
      const response = await fetch('https://api.cloudinary.com/v1_1/chmayjcr/image/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      // CEK ERROR DENGAN LEBIH DETAIL
      if (!data.secure_url) {
        console.error("Cloudinary Error Detail:", data);
        if (data.error && data.error.message) {
          return alert("Cloudinary Error: " + data.error.message);
        }
        return alert("Gagal upload gambar. Cek Console untuk detail.");
      }
      
      imageUrl = data.secure_url;
    }

    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "pengumuman"), {
      judul: judul,
      isi: isi,
      tanggal: tanggal,
      gambar: imageUrl || '' 
    });
    
    showToast('Pengumuman berhasil ditambahkan!');
    closeModal('modal-pengumuman');
    
    document.getElementById('p-judul').value = '';
    document.getElementById('p-isi').value = '';
    fileInput.value = '';
  } catch (error) {
    console.error("Error simpan pengumuman: ", error);
    alert('Gagal menyimpan pengumuman. Periksa koneksi internet.');
  }
}

// =======================================================
// 11. CHART / GRAFIK
// =======================================================
function renderCharts() {
  if (window.myChartIuran) window.myChartIuran.destroy();
  if (window.myChartWarga) window.myChartWarga.destroy();

  const chartIuranEl = document.getElementById('chartIuran');
  if(chartIuranEl) {
    window.myChartIuran = new Chart(chartIuranEl, {
      type: 'bar',
      data: { labels: ['Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan'], datasets: [{ label: 'Iuran (Rp)', data: [450000, 500000, 480000, 520000, 550000, 500000], backgroundColor: '#3b82f6', borderRadius: 6 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
  const chartWargaEl = document.getElementById('chartWarga');
  if(chartWargaEl) {
    window.myChartWarga = new Chart(chartWargaEl, {
      type: 'doughnut',
      data: { labels: ['Tetap', 'Kontrak'], datasets: [{ data: [dataWarga.filter(w => w.status === 'Tetap').length, dataWarga.filter(w => w.status === 'Kontrak').length], backgroundColor: ['#10b981', '#f59e0b'] }] }
    });
  }
}

// =======================================================
// 12. SURAT PENGANTAR
// =======================================================
function tampilkanFormSurat() {
  document.getElementById('tampilan-list-surat').style.display = 'none';
  document.getElementById('tampilan-form-surat').style.display = 'block';
  document.getElementById('s-nama').value = ''; document.getElementById('s-nik').value = ''; document.getElementById('s-alamat').value = ''; document.getElementById('s-keperluan').value = '';
  document.getElementById('preview-surat').style.display = 'none'; document.getElementById('form-input-surat').style.display = 'block';
}

function batalTambahSurat() {
  document.getElementById('tampilan-form-surat').style.display = 'none';
  document.getElementById('tampilan-list-surat').style.display = 'block';
  renderSurat(); 
}

async function simpanSuratBaru() {
  const nama = document.getElementById('s-nama').value.trim();
  const nik = document.getElementById('s-nik').value.trim();
  const kk = document.getElementById('s-kk').value.trim();
  const ttl = document.getElementById('s-ttl').value.trim();
  const jk = document.getElementById('s-jk').value;
  const perkawinan = document.getElementById('s-perkawinan').value;
  const agama = document.getElementById('s-agama').value.trim();
  const pekerjaan = document.getElementById('s-pekerjaan').value.trim();
  const alamat = document.getElementById('s-alamat').value.trim();
  const keperluan = document.getElementById('s-keperluan').value.trim();
  
  // TAMBAHKAN BARIS INI UNTUK MENGAMBIL NOMOR SURAT
  const nomorSurat = document.getElementById('s-nomor-surat').value.trim(); 

  if(!nama || !nik || !keperluan) return alert('Mohon lengkapi Nama, NIK, dan Keperluan!');
  
  const tgl = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  
  try {
    // TAMBAHKAN nomorSurat DI DALAM KURUNG KURAWAL INI
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "surat"), { 
      nomorSurat: nomorSurat, 
      nama: nama, 
      nik: nik, 
      kk: kk, 
      ttl: ttl, 
      jk: jk, 
      perkawinan: perkawinan, 
      agama: agama, 
      pekerjaan: pekerjaan, 
      alamat: alamat, 
      keperluan: keperluan, 
      tanggal: tgl, 
      status: 'Menunggu' 
    });
    
    showToast('Surat berhasil dikirim ke sistem RT!');
    batalTambahSurat();
  } catch (error) { 
    console.error("Error: ", error); 
    alert('Gagal menyimpan data.'); 
  }
}

function renderSurat() {
  const tbody = document.querySelector('#table-surat tbody');
  if(!tbody) return;
  
  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "surat"), (snapshot) => {
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b;">Belum ada data surat.</td></tr>';
      return;
    }

    const namaUserAktif = sessionStorage.getItem('namaUser') || '';
    const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
    const isAdmin = adminPenuh.includes(namaUserAktif);

    let index = 1;
    snapshot.forEach((doc) => {
      const s = doc.data();
      
      let tombolAksi = `
        <button class="btn-secondary" onclick="downloadSuratPDF('${doc.id}')" style="margin-right: 5px; background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Download PDF"><i class="fas fa-download"></i></button>
        <button class="btn-secondary" onclick="printSuratDariFirebase('${doc.id}')" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Print"><i class="fas fa-print"></i></button>
      `;

      if (isAdmin) {
        tombolAksi += `
          <button class="btn-secondary" onclick="updateStatusSurat('${doc.id}', 'Disetujui')" style="margin-left: 5px; background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Setujui"><i class="fas fa-check"></i></button>
          <button class="btn-secondary" onclick="updateStatusSurat('${doc.id}', 'Ditolak')" style="margin-left: 5px; background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Tolak"><i class="fas fa-times"></i></button>
          <button class="btn-secondary" onclick="hapusSuratDariList('${doc.id}')" style="margin-left: 5px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Hapus"><i class="fas fa-trash"></i></button>
        `;
      }

      tbody.innerHTML += `
        <tr>
          <td>${index++}</td>
          <td>${s.tanggal}</td>
          <td>${s.nama}</td>
          <td>${s.nik}</td>
          <td>${s.keperluan}</td>
          <td style="white-space: nowrap;">${tombolAksi}</td>
        </tr>`;
    });
  });
}

async function hapusSuratDariList(idDokumen) {
  if (confirm('Hapus data surat ini?')) {
    try { await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "surat", idDokumen)); } 
    catch (error) { console.error("Error menghapus: ", error); alert("Gagal menghapus data."); }
  }
}

function printSurat() {
  const printContent = document.getElementById('isi-surat').innerHTML;
  const printWindow = window.open('', '', 'height=800,width=800');
  
  printWindow.document.write('<html><head><title>Cetak Surat</title>');
  
  printWindow.document.write(`
    <style>
      @page { 
        size: A4 portrait; 
        margin: 10mm; 
      }
      body { 
        font-family: 'Times New Roman', serif !important; 
        font-size: 13px; 
        line-height: 1.2; 
        background: #fff !important; 
        color: #000 !important; 
        margin: 0;
        padding: 0;
      }
      
      /* Hanya tampilkan isi surat */
      body * {
        visibility: hidden;
      }
      #isi-surat, #isi-surat * {
        visibility: visible;
      }
      
      #isi-surat {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }

      /* Format Kop Surat */
      .kop-surat { 
        display: flex !important; 
        align-items: center; 
        gap: 15px; 
        justify-content: center; 
        text-align: center; 
        margin-bottom: 10px;
      }
      .kop-text h3 { font-size: 16px; margin: 0; }
      .kop-text h2 { font-size: 18px; margin: 2px 0; }
      .kop-text p { font-size: 11px; margin: 0; }
      
      hr { border: 1.5px solid #000 !important; margin-bottom: 10px; }
      
      p { margin-bottom: 6px !important; }
      
      /* Tabel format */
      .tabel-surat { width: 100%; font-size: 13px; margin-left: 20px; display: table !important; }
      .tabel-surat tr { display: table-row !important; }
      .tabel-surat td { padding: 1px 0; display: table-cell !important; }
      
      .ttd-area { 
        display: flex !important; 
        justify-content: space-between; 
        margin-top: 15px !important; 
        text-align: left; 
      }
      
      * { page-break-inside: avoid; }
    </style>
  `);
  
  printWindow.document.write('</head><body>');
  printWindow.document.write('<div id="isi-surat">' + printContent + '</div>');
  printWindow.document.write('</body></html>');
  
  printWindow.document.close(); 
  printWindow.focus();
  
  setTimeout(() => { 
    printWindow.print(); 
  }, 1000);
}

async function downloadSuratPDF(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "surat", idDokumen));
    if (docSnap.exists()) {
      const s = docSnap.data();
      document.getElementById('hasil-nama').innerText = s.nama || '-';
      document.getElementById('hasil-nik').innerText = s.nik || '-';
      document.getElementById('hasil-kk').innerText = s.kk || '-';
      document.getElementById('hasil-ttl').innerText = s.ttl || '-';
      document.getElementById('hasil-jk').innerText = s.jk || '-';
      document.getElementById('hasil-perkawinan').innerText = s.perkawinan || '-';
      document.getElementById('hasil-agama').innerText = s.agama || '-';
      document.getElementById('hasil-pekerjaan').innerText = s.pekerjaan || '-';
      document.getElementById('hasil-alamat').innerText = s.alamat || '-';
      document.getElementById('hasil-keperluan').innerText = s.keperluan || '-';
      document.getElementById('tgl-surat').innerText = s.tanggal;

      const element = document.getElementById('isi-surat');
      // 2. Pengaturan PDF (margin tipis & format A4)
        const opt = {
        margin:       [0.1, 0.4, 0.1, 0.4], // [Atas, Kiri, Bawah, Kanan] dibuat sangat tipis
        filename:     `Surat_Pengantar_${s.nama.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, scrollY: 0 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    } else { alert("Data surat tidak ditemukan."); }
  } catch (error) { console.error("Error download: ", error); alert("Gagal mengunduh PDF."); }
}

function renderHomeSurat() {
  const homeSuratList = document.getElementById('home-list-surat');
  if (!homeSuratList) return;
  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "surat"), (snapshot) => {
    homeSuratList.innerHTML = ''; 
    if (snapshot.empty) { homeSuratList.innerHTML = '<p style="color:#64748b; font-size:13px;">Belum ada permohonan surat terbaru.</p>'; return; }
    const suratArray = []; snapshot.forEach((doc) => { suratArray.push(doc.data()); });
    suratArray.slice(-2).reverse().forEach((s) => {
      let badgeClass = 'badge-danger'; if (s.status === 'Disetujui') badgeClass = 'badge-success'; if (!s.status || s.status === 'Menunggu') badgeClass = 'badge-warning';
      homeSuratList.innerHTML += `<div class="list-item"><div class="list-icon orange"><i class="fas fa-file-alt"></i></div><div class="list-content"><h4>Surat Pengantar - ${s.keperluan}</h4><p>Pemohon: <strong>${s.nama}</strong></p><small>Status: <span class="badge ${badgeClass}">${s.status || 'Menunggu'}</span></small></div></div>`;
    });
  }); 
}

async function printSuratDariFirebase(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "surat", idDokumen));
    if (docSnap.exists()) {
      const s = docSnap.data();
      document.getElementById('hasil-nama').innerText = s.nama; document.getElementById('hasil-nik').innerText = s.nik; document.getElementById('hasil-alamat').innerText = s.alamat; document.getElementById('hasil-keperluan').innerText = s.keperluan; document.getElementById('tgl-surat').innerText = s.tanggal;
      document.getElementById('hasil-ttl').innerText = s.tempatLahir + ', ' + s.tanggalLahir;
      document.getElementById('hasil-jk').innerText = s.jenisKelamin;
      document.getElementById('hasil-agama').innerText = s.agama;
      document.getElementById('hasil-pekerjaan').innerText = s.pekerjaan;
      document.getElementById('form-input-surat').style.display = 'none'; document.getElementById('preview-surat').style.display = 'block';
      printSurat();
      setTimeout(() => { document.getElementById('form-input-surat').style.display = 'block'; document.getElementById('preview-surat').style.display = 'none'; }, 1000);
    }
  } catch (error) { console.error("Error print: ", error); alert("Gagal mencetak surat."); }
}

async function updateStatusSurat(idDokumen, statusBaru) {
  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    await updateDoc(window.fbDoc(window.firebaseDB, "surat", idDokumen), { status: statusBaru });
    alert(`Surat berhasil di${statusBaru === 'Disetujui' ? 'setujui' : 'tolak'}!`);
  } catch (error) { console.error("Error update status: ", error); alert("Gagal memproses surat."); }
}
async function printSuratDariFirebase(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "surat", idDokumen));
    
    if (docSnap.exists()) {
      const s = docSnap.data();
      
      // Isi data ke dalam template preview surat
      document.getElementById('hasil-nama').innerText = s.nama || '-';
      document.getElementById('hasil-nik').innerText = s.nik || '-';
      document.getElementById('hasil-kk').innerText = s.kk || '-';
      document.getElementById('hasil-ttl').innerText = s.ttl || '-';
      document.getElementById('hasil-jk').innerText = s.jk || '-';
      document.getElementById('hasil-perkawinan').innerText = s.perkawinan || '-';
      document.getElementById('hasil-agama').innerText = s.agama || '-';
      document.getElementById('hasil-pekerjaan').innerText = s.pekerjaan || '-';
      document.getElementById('hasil-alamat').innerText = s.alamat || '-';
      document.getElementById('hasil-keperluan').innerText = s.keperluan || '-';
      document.getElementById('tgl-surat').innerText = s.tanggal;

      // Sembunyikan form input, tampilkan preview
      document.getElementById('form-input-surat').style.display = 'none'; 
      document.getElementById('preview-surat').style.display = 'block';
      
      // Panggil fungsi printSurat() yang sudah ada di atasnya
      printSurat();
      
      // Kembalikan tampilan setelah print
      setTimeout(() => { 
        document.getElementById('form-input-surat').style.display = 'block'; 
        document.getElementById('preview-surat').style.display = 'none'; 
      }, 1000);
    }
  } catch (error) { 
    console.error("Error print: ", error); 
    alert("Gagal mencetak surat."); 
  }
}
// =======================================================
// 13. LAPORAN, PENCARIAN, POSTER
// =======================================================
function cetakLaporan() {
  const element = document.getElementById('laporan');
  html2pdf().set({ margin: 1, filename: 'Laporan_Keuangan_RT09.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(element).save();
}

function lupaPassword() {
  alert("Untuk mereset password, silakan hubungi Admin System RT 09:\n\nNama: Muhammad Jirhan\nNo. HP/WA: 0812-5763-9264\n\nSebutkan nama dan alamat Anda untuk verifikasi.");
}

const menuNavigasi = [
  { id: 'home', nama: 'Home', icon: 'fa-home', deskripsi: 'Halaman Utama' },
  { id: 'dashboard', nama: 'Dashboard', icon: 'fa-chart-line', deskripsi: 'Statistik & Grafik' },
  { id: 'warga', nama: 'Data Warga', icon: 'fa-users', deskripsi: 'Daftar Penduduk RT' },
  { id: 'kk', nama: 'Data KK', icon: 'fa-id-card', deskripsi: 'Kartu Keluarga' },
  { id: 'iuran', nama: 'Iuran', icon: 'fa-money-bill-wave', deskripsi: 'Pembayaran Iuran' },
  { id: 'pengumuman', nama: 'Pengumuman', icon: 'fa-bullhorn', deskripsi: 'Informasi RT' },
  { id: 'surat', nama: 'Surat Pengantar', icon: 'fa-envelope', deskripsi: 'Buat & Cetak Surat' },
  { id: 'pengaduan', nama: 'Pengaduan Warga', icon: 'fa-exclamation-circle', deskripsi: 'Layanan Aduan Warga' }, // TAMBAHKAN INI
  { id: 'laporan', nama: 'Laporan', icon: 'fa-file-alt', deskripsi: 'Laporan Keuangan' }
];

function bukaPencarian() {
  document.getElementById('modal-pencarian').classList.add('active');
  const input = document.getElementById('input-pencarian');
  input.value = '';
  input.focus();
  tampilkanHasil(menuNavigasi);
}

function jalankanPencarian() {
  const keyword = document.getElementById('input-pencarian').value.toLowerCase();
  const hasilFilter = menuNavigasi.filter(menu => 
    menu.nama.toLowerCase().includes(keyword) || 
    menu.deskripsi.toLowerCase().includes(keyword)
  );
  tampilkanHasil(hasilFilter);
}

function tampilkanHasil(daftarMenu) {
  const container = document.getElementById('hasil-pencarian');
  if (!container) return;
  container.innerHTML = '';

  if (daftarMenu.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#64748b; padding: 20px;">Menu tidak ditemukan.</p>';
    return;
  }

  daftarMenu.forEach(menu => {
    container.innerHTML += `
      <div class="search-result-item" onclick="pilihMenuDariPencarian('${menu.id}')">
        <div class="search-result-icon"><i class="fas ${menu.icon}"></i></div>
        <div class="search-result-text">
          <h4>${menu.nama}</h4>
          <p>${menu.deskripsi}</p>
        </div>
      </div>
    `;
  });
}

function pilihMenuDariPencarian(idMenu) {
  closeModal('modal-pencarian');
  const sidebarItem = document.querySelector(`.sidebar .menu li[data-page="${idMenu}"]`);
  if(sidebarItem) sidebarItem.click();
}

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("togglePassword");
    if (passwordInput.type === "password") { passwordInput.type = "text"; toggleIcon.classList.remove("fa-eye"); toggleIcon.classList.add("fa-eye-slash"); } 
    else { passwordInput.type = "password"; toggleIcon.classList.remove("fa-eye-slash"); toggleIcon.classList.add("fa-eye"); }
}

function bukaPoster() {
  const posterHome = document.querySelector('.campaign-img');
  if (posterHome) { document.getElementById('poster-full').src = posterHome.src; document.getElementById('modal-poster').classList.add('active'); }
}

function tutupPoster() { 
  document.getElementById('modal-poster').classList.remove('active'); 
}

function filterWarga() {
  const keyword = document.getElementById('search-warga').value.toLowerCase();
  const rows = document.querySelectorAll('#table-warga tbody tr');
  rows.forEach(row => {
    const nama = row.querySelector('td:nth-child(3)').innerText.toLowerCase();
    row.style.display = nama.includes(keyword) ? '' : 'none';
  });
}
// =======================================================
// 14. FITUR PENGADUAN WARGA
// =======================================================
function openModalPengaduan() { document.getElementById('modal-pengaduan').classList.add('active'); }

async function simpanPengaduan() {
  const judul = document.getElementById('ad-judul').value.trim();
  const kategori = document.getElementById('ad-kategori').value;
  const deskripsi = document.getElementById('ad-deskripsi').value.trim();
  const pelapor = sessionStorage.getItem('namaUser') || 'Warga';

  if (!judul || !deskripsi) return alert('Lengkapi Judul dan Deskripsi!');

  const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  try {
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "pengaduan"), {
      judul, kategori, deskripsi, pelapor, tanggal, status: 'Menunggu', tanggapan: '-'
    });
    showToast('Pengaduan berhasil dikirim!');
    closeModal('modal-pengaduan');
    document.getElementById('ad-judul').value = '';
    document.getElementById('ad-deskripsi').value = '';
  } catch (error) { console.error("Error: ", error); alert('Gagal mengirim pengaduan.'); }
}

function renderPengaduan() {
  const tbody = document.querySelector('#table-pengaduan tbody');
  if(!tbody) return; // Pengaman jika tabel tidak ada

  const namaUserAktif = sessionStorage.getItem('namaUser') || '';
  const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
  const isAdmin = adminPenuh.includes(namaUserAktif);

  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "pengaduan"), (snapshot) => {
    tbody.innerHTML = '';
    let index = 1;

    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada pengaduan.</td></tr>';
      return;
    }

    snapshot.forEach((doc) => {
      const d = doc.data();
      
      // Filter untuk Warga
      if (!isAdmin && d.pelapor !== namaUserAktif) return;

      let badgeClass = 'badge-warning';
      if (d.status === 'Diproses') badgeClass = 'badge-primary';
      if (d.status === 'Selesai') badgeClass = 'badge-success';

      let tombolAksi = '';
      if (isAdmin) {
        tombolAksi = `
          <button class="btn-secondary" onclick="bukaTanggapi('${doc.id}')" style="margin-right: 5px; background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Tanggapi"><i class="fas fa-reply"></i></button>
          <button class="btn-secondary" onclick="hapusPengaduan('${doc.id}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Hapus"><i class="fas fa-trash"></i></button>
        `;
      } else {
        tombolAksi = `
          <button class="btn-secondary" onclick="lihatDetailPengaduan('${doc.id}')" style="background: #64748b; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Lihat Detail"><i class="fas fa-eye"></i></button>
        `;
      }

      tbody.innerHTML += `
        <tr>
          <td>${index++}</td>
          <td>${d.tanggal || '-'}</td>
          <td>${d.judul || '-'}<br><small style="color:#64748b">Kategori: ${d.kategori || '-'}</small></td>
          <td>${d.pelapor || '-'}</td>
          <td><span class="badge ${badgeClass}">${d.status || 'Menunggu'}</span></td>
          <td>${tombolAksi}</td>
        </tr>`;
    });
  });
}

function renderHomePengaduan() {
  const homeList = document.getElementById('home-list-pengaduan');
  if (!homeList) return;

  const namaUserAktif = sessionStorage.getItem('namaUser') || '';
  const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
  const isAdmin = adminPenuh.includes(namaUserAktif);

  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "pengaduan"), (snapshot) => {
    homeList.innerHTML = '';
    
    if (snapshot.empty) {
      homeList.innerHTML = '<p style="color:#64748b; font-size:13px;">Belum ada laporan terbaru.</p>';
      return;
    }

    // Ambil maksimal 3 aduan terbaru
    const listArray = [];
    snapshot.forEach((doc) => {
      listArray.push({ id: doc.id, data: doc.data() });
    });
    const recentList = listArray.slice(-3).reverse();

    recentList.forEach((item) => {
      const d = item.data;
      const id = item.id;

      let badgeClass = 'badge-warning'; // Kuning
      if (d.status === 'Diproses') badgeClass = 'badge-primary'; // Biru
      if (d.status === 'Selesai') badgeClass = 'badge-success'; // Hijau

      // Tombol Aksi HANYA untuk Admin
      let tombolAdmin = '';
      if (isAdmin) {
        tombolAdmin = `
          <button class="btn-secondary" onclick="bukaTanggapi('${id}')" style="margin-left: 5px; background: #3b82f6; color: white; border: none; padding: 3px 8px; border-radius: 4px; font-size: 11px;" title="Tanggapi"><i class="fas fa-reply"></i></button>
          <button class="btn-secondary" onclick="hapusPengaduan('${id}')" style="margin-left: 5px; background: #ef4444; color: white; border: none; padding: 3px 8px; border-radius: 4px; font-size: 11px;" title="Hapus"><i class="fas fa-trash"></i></button>
        `;
      }

      homeList.innerHTML += `
        <div class="list-item" style="align-items: flex-start;">
          <div class="list-icon red" style="background: #fee2e2; color: #ef4444;"><i class="fas fa-exclamation-circle"></i></div>
          <div class="list-content" style="width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin-bottom: 2px;">${d.judul}</h4>
              <div>${tombolAdmin}</div> <!-- Tombol Admin di sini -->
            </div>
            <p style="margin-bottom: 6px; font-size: 13px;">${d.deskripsi}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <small>Pelapor: <strong>${d.pelapor}</strong></small>
              <span class="badge ${badgeClass}">${d.status}</span>
            </div>
          </div>
        </div>`;
    });
  });
}

async function bukaTanggapi(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "pengaduan", idDokumen));
    if (docSnap.exists()) {
      const d = docSnap.data();
      document.getElementById('tanggapi-id').value = idDokumen;
      document.getElementById('tanggapi-detail').innerHTML = `<strong>${d.judul}</strong><br>${d.deskripsi}<br><br><em>Tanggapan sebelumnya: ${d.tanggapan}</em>`;
      document.getElementById('tanggapi-status').value = d.status;
      document.getElementById('tanggapi-pesan').value = d.tanggapan === '-' ? '' : d.tanggapan;
      document.getElementById('modal-tanggapi').classList.add('active');
    }
  } catch (error) { console.error("Error: ", error); }
}

async function simpanTanggapan() {
  const idDokumen = document.getElementById('tanggapi-id').value;
  const statusBaru = document.getElementById('tanggapi-status').value;
  const pesan = document.getElementById('tanggapi-pesan').value.trim();

  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    await updateDoc(window.fbDoc(window.firebaseDB, "pengaduan", idDokumen), {
      status: statusBaru,
      tanggapan: pesan || '-'
    });
    alert('Tanggapan berhasil dikirim!');
    closeModal('modal-tanggapi');
  } catch (error) { console.error("Error: ", error); alert('Gagal mengirim tanggapan.'); }
}

async function lihatDetailPengaduan(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "pengaduan", idDokumen));
    if (docSnap.exists()) {
      const d = docSnap.data();
      alert(`Judul: ${d.judul}\nStatus: ${d.status}\n\nDeskripsi:\n${d.deskripsi}\n\nTanggapan Admin:\n${d.tanggapan}`);
    }
  } catch (error) { console.error("Error: ", error); }
}
async function hapusPengaduan(idDokumen) {
  if (confirm('Apakah Anda yakin ingin menghapus pengaduan ini?')) {
    try {
      await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "pengaduan", idDokumen));
      alert('Pengaduan berhasil dihapus!');
    } catch (error) {
      console.error("Error hapus pengaduan: ", error);
      alert("Gagal menghapus pengaduan.");
    }
  }
}
// =======================================================
// FUNGSI NOTIFIKASI TOAST (PENGGANTI ALERT)
// =======================================================
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  const toastMsg = document.getElementById("toast-message");
  
  if(toast && toastMsg) {
    toastMsg.innerText = message;
    toast.classList.add("show");
    
    // Hilangkan notifikasi setelah 3 detik
    setTimeout(function(){ 
      toast.classList.remove("show"); 
    }, 3000);
  } else {
    // Jika elemen toast tidak ada, gunakan alert biasa sebagai cadangan
    alert(message);
  }
}
async function updateStatusSurat(idDokumen, statusBaru) {
  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docRef = window.fbDoc(window.firebaseDB, "surat", idDokumen);
    
    // Update status di database
    await updateDoc(docRef, {
      status: statusBaru
    });
    
    // Tampilkan notifikasi Toast
    showToast(`Surat berhasil di${statusBaru === 'Disetujui' ? 'setujui' : 'tolak'}!`);
    
  } catch (error) {
    console.error("Error update status: ", error);
    alert("Gagal memproses surat.");
  }
}
async function hapusPengumuman(idDokumen) {
  if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
    try {
      await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "pengumuman", idDokumen));
      showToast('Pengumuman berhasil dihapus!');
    } catch (error) {
      console.error("Error hapus: ", error);
      alert("Gagal menghapus pengumuman.");
    }
  }
}
async function bukaEditPengumuman(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "pengumuman", idDokumen));
    if (docSnap.exists()) {
      const p = docSnap.data();
      document.getElementById('edit-p-id').value = idDokumen;
      document.getElementById('edit-p-judul').value = p.judul;
      document.getElementById('edit-p-isi').value = p.isi;
      document.getElementById('modal-edit-pengumuman').classList.add('active');
    }
  } catch (error) {
    console.error("Error edit: ", error);
  }
}

async function simpanEditPengumuman() {
  const idDokumen = document.getElementById('edit-p-id').value;
  const judulBaru = document.getElementById('edit-p-judul').value.trim();
  const isiBaru = document.getElementById('edit-p-isi').value.trim();

  if (!judulBaru || !isiBaru) return alert('Judul dan Isi tidak boleh kosong!');

  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    await updateDoc(window.fbDoc(window.firebaseDB, "pengumuman", idDokumen), {
      judul: judulBaru,
      isi: isiBaru
    });
    showToast('Pengumuman berhasil diupdate!');
    closeModal('modal-edit-pengumuman');
  } catch (error) {
    console.error("Error update: ", error);
    alert("Gagal mengupdate pengumuman.");
  }
}