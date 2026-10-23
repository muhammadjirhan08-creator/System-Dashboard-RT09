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
    const menuTerlarang = ['warga', 'kk', 'iuran', 'pengumuman'];
    sidebarMenus.forEach(menu => {
      const pageName = menu.getAttribute('data-page');
      if (menuTerlarang.includes(pageName)) menu.style.display = 'none'; 
    });
  } else {
    sidebarMenus.forEach(menu => menu.style.display = 'flex');
  }

  renderWarga(); renderKK(); renderIuran(); renderPengumuman(); renderCharts(); renderHomeSurat();
  
  const homeMenu = document.querySelector('[data-page="home"]');
  if(homeMenu) homeMenu.click();
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
    
    alert('Data warga berhasil ditambahkan!');
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
    alert('Data KK berhasil ditambahkan!');
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
// 9. DATA IURAN
// =======================================================
function renderIuran() {
  const tbody = document.querySelector('#table-iuran tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  let total = 0, belum = 0;
  
  dataIuran.forEach((d, i) => {
    if (d.status === 'Lunas') total += Number(d.jumlah);
    else belum++;
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td><td>${d.nama}</td><td>${d.bulan}</td><td>Rp ${Number(d.jumlah).toLocaleString('id-ID')}</td>
        <td><span class="badge ${d.status === 'Lunas' ? 'badge-success' : 'badge-danger'}">${d.status}</span></td>
        <td><button class="btn-secondary" onclick="hapusIuran(${i})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-trash"></i></button></td>
      </tr>`;
  });
  document.getElementById('total-iuran').textContent = total.toLocaleString('id-ID');
  document.getElementById('belum-bayar').textContent = belum;
  document.getElementById('lap-pemasukan').textContent = total.toLocaleString('id-ID');
  document.getElementById('lap-pengeluaran').textContent = '0';
  document.getElementById('lap-saldo').textContent = total.toLocaleString('id-ID');
}

function simpanIuran() {
  const nama = document.getElementById('i-nama').value.trim();
  const bulan = document.getElementById('i-bulan').value.trim();
  const jumlah = document.getElementById('i-jumlah').value;
  if (!nama || !bulan || !jumlah) return alert('Lengkapi data!');
  dataIuran.push({ nama, bulan, jumlah, status: 'Lunas' });
  renderIuran(); closeModal('modal-iuran');
  document.getElementById('i-nama').value = ''; document.getElementById('i-bulan').value = ''; document.getElementById('i-jumlah').value = '';
}

function hapusIuran(index) {
  if (confirm('Hapus data iuran ini?')) { dataIuran.splice(index, 1); renderIuran(); }
}

// =======================================================
// 10. PENGUMUMAN
// =======================================================
function renderPengumuman() {
  // 1. TAMPILKAN DI HALAMAN MENU PENGUMUMAN
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
        list.innerHTML += `
          <div class="pengumuman-item" style="position: relative;">
            <h4>${p.judul}</h4>
            <p>${p.isi}</p>
            <small>📅 ${p.tanggal}</small>
            <button class="btn-secondary" onclick="hapusPengumuman('${doc.id}')" style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-trash"></i></button>
          </div>`;
      });
    });
  }

  // 2. TAMPILKAN DI KOTAK HOME
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
          homeList.innerHTML += `
            <div class="list-item">
              <div class="list-icon green"><i class="fas fa-bullhorn"></i></div>
              <div class="list-content">
                <h4>${p.judul}</h4>
                <p>${p.isi}</p>
                <small>📅 ${p.tanggal}</small>
              </div>
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
  
  if (!judul || !isi) return alert('Judul dan Isi Pengumuman tidak boleh kosong!');
  
  const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  
  try {
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "pengumuman"), { judul, isi, tanggal });
    alert('Pengumuman berhasil ditambahkan!');
    closeModal('modal-pengumuman');
    document.getElementById('p-judul').value = '';
    document.getElementById('p-isi').value = '';
  } catch (error) { console.error("Error simpan pengumuman: ", error); alert('Gagal menyimpan pengumuman. Periksa koneksi internet.'); }
}

async function hapusPengumuman(idDokumen) {
  if (confirm('Hapus pengumuman ini?')) {
    try {
      await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "pengumuman", idDokumen));
      alert('Pengumuman berhasil dihapus!');
    } catch (error) { console.error("Error hapus: ", error); alert("Gagal menghapus pengumuman."); }
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
  const alamat = document.getElementById('s-alamat').value.trim();
  const keperluan = document.getElementById('s-keperluan').value.trim();
  if(!nama || !nik || !keperluan) return alert('Mohon lengkapi Nama, NIK, dan Keperluan!');
  const tgl = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  try {
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "surat"), { nama, nik, alamat, keperluan, tanggal: tgl, status: 'Menunggu' });
    alert('Surat berhasil dikirim ke sistem RT!'); batalTambahSurat();
  } catch (error) { console.error("Error: ", error); alert('Gagal menyimpan data.'); }
}

function renderSurat() {
  const tbody = document.querySelector('#table-surat tbody');
  if(!tbody) return;
  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "surat"), (snapshot) => {
    tbody.innerHTML = '';
    if (snapshot.empty) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b;">Belum ada data surat.</td></tr>'; return; }
    const namaUserAktif = sessionStorage.getItem('namaUser') || '';
    const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
    const isAdmin = adminPenuh.includes(namaUserAktif);
    let index = 1;
    snapshot.forEach((doc) => {
      const s = doc.data();
      let tombolAksi = `<button class="btn-secondary" onclick="downloadSuratPDF('${doc.id}')" style="margin-right: 5px; background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Download PDF"><i class="fas fa-download"></i></button><button class="btn-secondary" onclick="printSuratDariFirebase('${doc.id}')" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Print"><i class="fas fa-print"></i></button>`;
      if (isAdmin) {
        tombolAksi += `<button class="btn-secondary" onclick="updateStatusSurat('${doc.id}', 'Disetujui')" style="margin-left: 5px; background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Setujui"><i class="fas fa-check"></i></button><button class="btn-secondary" onclick="updateStatusSurat('${doc.id}', 'Ditolak')" style="margin-left: 5px; background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Tolak"><i class="fas fa-times"></i></button><button class="btn-secondary" onclick="hapusSuratDariList('${doc.id}')" style="margin-left: 5px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Hapus"><i class="fas fa-trash"></i></button>`;
      }
      tbody.innerHTML += `<tr><td>${index++}</td><td>${s.tanggal}</td><td>${s.nama}</td><td>${s.nik}</td><td>${s.keperluan}</td><td style="white-space: nowrap;">${tombolAksi}</td></tr>`;
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
  printWindow.document.write(`<style>body{font-family:'Times New Roman',serif!important;padding:40px;background:#fff!important;color:#000!important}#isi-surat{display:block!important;visibility:visible!important}.kop-surat{display:flex!important;align-items:center;gap:20px;justify-content:center;text-align:center}.kop-text h3{font-size:18px;margin:0;color:#000}.kop-text h2{font-size:22px;margin:5px 0;color:#000}.kop-text p{font-size:14px;margin:0;color:#000}.tabel-surat{width:100%;font-size:16px;margin-left:20px;color:#000}.tabel-surat td{padding:5px 0}.ttd-area{display:flex!important;justify-content:flex-end;margin-top:50px;text-align:center;color:#000}hr{border:2px solid #000!important;margin-bottom:20px}p{color:#000!important}</style>`);
  printWindow.document.write('</head><body>');
  printWindow.document.write('<div id="isi-surat">' + printContent + '</div>');
  printWindow.document.write('</body></html>');
  printWindow.document.close(); printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 1000);
}

async function downloadSuratPDF(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docSnap = await getDoc(window.fbDoc(window.firebaseDB, "surat", idDokumen));
    if (docSnap.exists()) {
      const s = docSnap.data();
      document.getElementById('hasil-nama').innerText = s.nama; document.getElementById('hasil-nik').innerText = s.nik; document.getElementById('hasil-alamat').innerText = s.alamat; document.getElementById('hasil-keperluan').innerText = s.keperluan; document.getElementById('tgl-surat').innerText = s.tanggal;
      const element = document.getElementById('isi-surat');
      html2pdf().set({ margin: 1, filename: `Surat_Pengantar_${s.nama.replace(/\s+/g, '_')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(element).save();
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