// =======================================================
// 1. LOGIKA LOGIN & EVENT LISTENER
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    showDashboard();
  }
  
  const passwordInput = document.getElementById('password');
  const usernameInput = document.getElementById('username');

  // Enter di kolom Password
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault(); 
        login();            
      }
    });
  }

  // Enter di kolom Username (pindah ke password)
  if (usernameInput) {
    usernameInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        passwordInput.focus(); 
      }
    });
  }
});

  // ==========================================
  // FITUR JAM DIGITAL REAL-TIME
  // ==========================================
  function updateClock() {
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('live-clock');
    if(clockEl) clockEl.innerText = `${jam}:${menit}:${detik}`;
  }
  setInterval(updateClock, 1000);
  updateClock(); // Panggil langsung saat halaman dimuat

  // ==========================================
  // FITUR SHORTCUT CTRL + H
  // ==========================================
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault(); // Mencegah browser membuka History
      bukaPencarian(); // <--- UBAH MENJADI INI
    }
    
    // Tombol ESC untuk menutup modal
    if (e.key === 'Escape') {
      closeModal('modal-pencarian');
    }
  });
function login() {
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const alertBox = document.getElementById('alert-error');
  
  if(alertBox) alertBox.style.display = 'none';

  // Login menggunakan Firebase Authentication
  window.fbSignIn(window.fbAuth, email, password)
    .then((userCredential) => {
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
    .catch((error) => {
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
    }).catch((error) => {
      console.error('Gagal logout:', error);
    });
  }
}

function showDashboard() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-content').style.display = 'flex'; 
  
  const namaUser = sessionStorage.getItem('namaUser') || 'Admin RT';
  const greetingEl = document.getElementById('greeting-user');
  if(greetingEl) {
    greetingEl.innerText = `Halo, ${namaUser}`;
  }

  // ==========================================
  // LOGIKA PEMBATASAN AKSES MENU (ROLE)
  // ==========================================
  const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
  const sidebarMenus = document.querySelectorAll('.sidebar .menu li');

  if (!adminPenuh.includes(namaUser)) {
    const menuTerlarang = ['warga', 'kk', 'iuran', 'pengumuman'];
    
    sidebarMenus.forEach(menu => {
      const pageName = menu.getAttribute('data-page');
      if (menuTerlarang.includes(pageName)) {
        menu.style.display = 'none'; 
      }
    });
  } else {
    sidebarMenus.forEach(menu => {
      menu.style.display = 'flex'; 
    });
  }

  // PANGGIL SEMUA FUNGSI RENDER
  renderWarga(); 
  renderKK(); 
  renderIuran(); 
  renderPengumuman(); 
  renderCharts();
  renderHomeSurat(); // <--- INI AKAN TERPANGGIL SEKARANG
  
  const homeMenu = document.querySelector('[data-page="home"]');
  if(homeMenu) homeMenu.click();
}
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
      dataWarga.push(w);
      
      // PENTING: Simpan ID dokumen ke dalam variabel
      const idDokumen = doc.id; 

      // PERHATIKAN TANDA KUTIP TUNGGAL ('...') DI DALAM onclick
      tbody.innerHTML += `
        <tr>
          <td>${index++}</td>
          <td style="white-space: nowrap;">
            <button class="btn-secondary" onclick="lihatWarga('${idDokumen}')" style="margin-right: 5px; background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Lihat"><i class="fas fa-eye"></i></button>
            
            <button class="btn-secondary" onclick="openEditWarga('${idDokumen}')" style="margin-right: 5px; background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Edit"><i class="fas fa-edit"></i></button>
            
            <button class="btn-secondary" onclick="hapusWarga('${idDokumen}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Hapus"><i class="fas fa-trash"></i></button>
          </td>
          <td>${w.nama || '-'}</td>
          <td>${w.nik || '-'}</td>
          <td>${w.noKtp || '-'}</td>
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
// =======================================================
// 2. DATA (Akan diisi dari Firebase secara Real-time)
// =======================================================
let dataWarga = [];
let dataKK = [];
let dataIuran = [];
let dataPengumuman = [];
let dataSurat = []; 

// =======================================================
// 3. NAVIGASI MENU SIDEBAR (SATU-SATUNYA)
// =======================================================
document.querySelectorAll('.sidebar .menu li[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar .menu li').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    item.classList.add('active');
    const page = item.dataset.page;
    document.getElementById(page).classList.add('active');
    document.getElementById('page-title').textContent = item.textContent.trim();
    
    if (page === 'dashboard') renderCharts(); 
    if (page === 'warga') renderTable(); // <--- DIUBAH MENJADI renderTable()
    if (page === 'kk') renderKK();
    if (page === 'iuran') renderIuran();
    if (page === 'pengumuman') renderPengumuman();
    if (page === 'laporan') renderIuran();
    if (page === 'surat') renderSurat();
    if (page === 'home') renderHomeSurat();
  });
});

// =======================================================
// 4. FUNGSI MODAL (BUKA & TUTUP)
// =======================================================
function openModalWarga() { document.getElementById('modal-warga').classList.add('active'); }
function openModalKK() { document.getElementById('modal-kk').classList.add('active'); }
function openModalIuran() { document.getElementById('modal-iuran').classList.add('active'); }
function openModalPengumuman() { document.getElementById('modal-pengumuman').classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// =======================================================
// 5. DATA WARGA (FUNGSI BARU: RENDER, SIMPAN, EDIT, HAPUS)
// =======================================================

// A. RENDER TABEL
function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return; 
  
  const searchInput = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '';
  const entriesLimit = document.getElementById('entriesPerPage') ? parseInt(document.getElementById('entriesPerPage').value) : 10;
  
  let filteredData = dataWarga.filter(w => w.nama.toLowerCase().includes(searchInput));
  filteredData = filteredData.slice(0, entriesLimit);
  tbody.innerHTML = '';
  
  if (filteredData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Data tidak ditemukan</td></tr>`;
    return;
  }

  filteredData.forEach((w, i) => {
    const badgeClass = w.status === 'Tetap' ? 'badge-tetap' : 'badge-kontrak';
    
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-show" title="Lihat" onclick="lihatWarga(${w.id})"><i class="fas fa-eye"></i></button>
            <button class="btn-icon btn-edit" title="Edit" onclick="openEditWarga(${w.id})"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-delete" title="Hapus" onclick="hapusWarga(${w.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
        <td>${w.nama}</td>
        <td>${w.nik || '-'}</td>
        <!-- Pastikan menggunakan w.noKtp sesuai standar tabel baru -->
        <td>${w.noKtp || '-'}</td>
        <td>${w.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
        <td>${w.pekerjaan || '-'}</td>
        <td>${w.alamat}</td>
        <td><span class="badge ${badgeClass}">${w.status}</span></td>
      </tr>`;
  });
  
  const elTotalWarga = document.getElementById('total-warga');
  if (elTotalWarga) elTotalWarga.textContent = dataWarga.length;
  
  localStorage.setItem('warga', JSON.stringify(dataWarga));
}

// B. SIMPAN WARGA BARU
async function simpanWarga() {
  const nama = document.getElementById('w-nama').value.trim(); 
  const nik = document.getElementById('w-nik').value.trim(); 
  const noKtp = document.getElementById('w-kk').value.trim(); // Sesuaikan ID form Anda
  const jk = document.getElementById('w-jk').value; // Pastikan ID form untuk jenis kelamin adalah 'w-jk'
  const pekerjaan = document.getElementById('w-pekerjaan').value.trim();
  const alamat = document.getElementById('w-alamat').value.trim();
  const status = document.getElementById('w-status').value;
  
  if (!nama || !nik || !alamat) return alert('Lengkapi data wajib (Nama, NIK, dan Alamat)!');

  try {
    // Simpan ke Firebase dengan properti yang sesuai
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "warga"), {
      nama: nama,
      nik: nik,
      noKtp: noKtp,
      jk: jk,
      pekerjaan: pekerjaan,
      alamat: alamat,
      status: status
    });
    
    alert('Data warga berhasil ditambahkan!');
    closeModal('modal-warga');
    
    // Reset Form
    document.getElementById('w-nama').value = '';
    document.getElementById('w-nik').value = '';
    document.getElementById('w-kk').value = ''; 
    document.getElementById('w-pekerjaan').value = '';
    document.getElementById('w-alamat').value = '';
  } catch (error) {
    console.error("Error: ", error);
    alert('Gagal menyimpan data. Periksa koneksi internet.');
  }
}

// C. BUKA MODAL EDIT WARGA
function openEditWarga(id) {
  // Gunakan == agar string dan number cocok
  const index = dataWarga.findIndex(w => w.id == id);
  
  if (index === -1) {
    alert("Data tidak ditemukan! Pastikan data memiliki ID yang valid.");
    return;
  }
  
  document.getElementById('edit-w-id').value = dataWarga[index].id;
  document.getElementById('edit-w-nama').value = dataWarga[index].nama;
  document.getElementById('edit-w-nik').value = dataWarga[index].nik || '';       
  // PERBAIKAN: Gunakan properti noKtp dan pasangkan ke input edit-w-kk
  document.getElementById('edit-w-kk').value = dataWarga[index].noKtp || '';      
  document.getElementById('edit-w-jk').value = dataWarga[index].jk || 'L';
  document.getElementById('edit-w-pekerjaan').value = dataWarga[index].pekerjaan || '';
  document.getElementById('edit-w-alamat').value = dataWarga[index].alamat;
  document.getElementById('edit-w-status').value = dataWarga[index].status;
  
  document.getElementById('modal-edit-warga').classList.add('active');
}

// D. SIMPAN PERUBAHAN EDIT WARGA
function simpanEditWarga() {
  const id = document.getElementById('edit-w-id').value; 
  const index = dataWarga.findIndex(w => w.id == id); 
  
  if (index === -1) return alert('Data tidak ditemukan');

  dataWarga[index].nama = document.getElementById('edit-w-nama').value;
  dataWarga[index].nik = document.getElementById('edit-w-nik').value;
  // PERBAIKAN: Simpan ke properti noKtp
  dataWarga[index].noKtp = document.getElementById('edit-w-kk').value;
  dataWarga[index].jk = document.getElementById('edit-w-jk').value;
  dataWarga[index].pekerjaan = document.getElementById('edit-w-pekerjaan').value;
  dataWarga[index].alamat = document.getElementById('edit-w-alamat').value;
  dataWarga[index].status = document.getElementById('edit-w-status').value;
  
  localStorage.setItem('warga', JSON.stringify(dataWarga));
  renderTable();
  closeModal('modal-edit-warga');
}

// E. HAPUS WARGA
function hapusWarga(id) {
  if (confirm('Apakah Anda yakin ingin menghapus data warga ini?')) {
    dataWarga = dataWarga.filter(w => w.id != id);
    localStorage.setItem('warga', JSON.stringify(dataWarga));
    renderTable();
  }
}

// F. FUNGSI LIHAT
function lihatWarga(id) {
  const w = dataWarga.find(item => item.id == id);
  if(w) {
    alert(`Detail Warga:\nNama: ${w.nama}\nNIK: ${w.nik}\nNo KTP: ${w.noKtp}\nPekerjaan: ${w.pekerjaan}\nAlamat: ${w.alamat}`);
  }
}

// =======================================================
// FITUR EXPORT & IMPORT (TARUH DI PALING BAWAH)
// =======================================================
function exportData() {
    if (dataWarga.length === 0) {
        alert("Tidak ada data untuk diexport!");
        return;
    }
    
    const headers = ["ID", "Nama", "NIK", "No KTP", "Jenis Kelamin", "Pekerjaan", "Alamat", "Status"];
    const csvRows = [];
    csvRows.push(headers.join(',')); 
    
    for (const w of dataWarga) {
        const values = [
            w.id, 
            `"${w.nama}"`, 
            `"${w.nik}"`, 
            `"${w.noKtp}"`, // Sesuaikan ke noKtp
            w.jk, 
            `"${w.pekerjaan}"`, 
            `"${w.alamat}"`, 
            w.status
        ];
        csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Data_Warga_RT09.csv');
    a.click();
}

// =======================================================
// 6. DATA KK (DENGAN JUMLAH KELUARGA)
// =======================================================
function renderKK() {
  const tbody = document.querySelector('#table-kk tbody'); 
  if(!tbody) return;
  tbody.innerHTML = '';
  
  dataKK.forEach((k, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${k.nomor}</td>
        <td>${k.kepala}</td>
        <td>${k.jumlah || '-'} Orang</td>
        <td>${k.alamat}</td>
        <td style="white-space: nowrap;">
          <button class="btn-secondary" onclick="openEditKK(${i})" style="margin-right: 5px; background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-edit"></i></button>
          <button class="btn-secondary" onclick="hapusKK(${i})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
  });
  localStorage.setItem('dataKK', JSON.stringify(dataKK));
  
  const totalKkEl = document.getElementById('total-kk');
  if(totalKkEl) totalKkEl.innerText = dataKK.length;
}

function simpanKK() {
  const nomor = document.getElementById('kk-nomor').value.trim();
  const kepala = document.getElementById('kk-kepala').value.trim();
  const jumlah = document.getElementById('kk-jumlah').value.trim();
  const alamat = document.getElementById('kk-alamat').value.trim();
  
  if (!nomor || !kepala || !alamat) return alert('Lengkapi data KK!');
  
  dataKK.push({ nomor, kepala, jumlah, alamat });
  renderKK();
  closeModal('modal-kk');
  
  document.getElementById('kk-nomor').value = '';
  document.getElementById('kk-kepala').value = '';
  document.getElementById('kk-jumlah').value = '';
  document.getElementById('kk-alamat').value = '';
}

function openEditKK(index) {
  document.getElementById('edit-kk-index').value = index;
  document.getElementById('edit-kk-nomor').value = dataKK[index].nomor;
  document.getElementById('edit-kk-kepala').value = dataKK[index].kepala;
  document.getElementById('edit-kk-jumlah').value = dataKK[index].jumlah || '';
  document.getElementById('edit-kk-alamat').value = dataKK[index].alamat;
  document.getElementById('modal-edit-kk').classList.add('active');
}

function simpanEditKK() {
  const index = document.getElementById('edit-kk-index').value;
  dataKK[index].nomor = document.getElementById('edit-kk-nomor').value.trim();
  dataKK[index].kepala = document.getElementById('edit-kk-kepala').value.trim();
  dataKK[index].jumlah = document.getElementById('edit-kk-jumlah').value.trim();
  dataKK[index].alamat = document.getElementById('edit-kk-alamat').value.trim();
  
  localStorage.setItem('dataKK', JSON.stringify(dataKK));
  renderKK();
  closeModal('modal-edit-kk');
  alert('Data KK berhasil diupdate!');
}

function hapusKK(i) {
  if (confirm('Hapus data KK ini?')) {
    dataKK.splice(i, 1);
    renderKK();
  }
}

// =======================================================
// 7. DATA IURAN
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
        <td>${i + 1}</td>
        <td>${d.nama}</td>
        <td>${d.bulan}</td>
        <td>Rp ${Number(d.jumlah).toLocaleString('id-ID')}</td>
        <td><span class="badge ${d.status === 'Lunas' ? 'badge-success' : 'badge-danger'}">${d.status}</span></td>
        <td>
          <button class="btn-secondary" onclick="hapusIuran(${i})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
  });
  document.getElementById('total-iuran').textContent = total.toLocaleString('id-ID');
  document.getElementById('belum-bayar').textContent = belum;
  document.getElementById('lap-pemasukan').textContent = total.toLocaleString('id-ID');
  document.getElementById('lap-pengeluaran').textContent = '0';
  document.getElementById('lap-saldo').textContent = total.toLocaleString('id-ID');
  localStorage.setItem('iuran', JSON.stringify(dataIuran));
}

function simpanIuran() {
  const nama = document.getElementById('i-nama').value.trim();
  const bulan = document.getElementById('i-bulan').value.trim();
  const jumlah = document.getElementById('i-jumlah').value;
  if (!nama || !bulan || !jumlah) return alert('Lengkapi data!');
  dataIuran.push({ nama, bulan, jumlah, status: 'Lunas' });
  renderIuran();
  closeModal('modal-iuran');
  document.getElementById('i-nama').value = '';
  document.getElementById('i-bulan').value = '';
  document.getElementById('i-jumlah').value = '';
}

function hapusIuran(index) {
  if (confirm('Hapus data iuran ini?')) {
    dataIuran.splice(index, 1);
    renderIuran();
  }
}

// =======================================================
// 8. PENGUMUMAN
// =======================================================
function renderPengumuman() {
  const list = document.getElementById('list-pengumuman');
  if(list) {
    list.innerHTML = '';
    if (dataPengumuman.length === 0) {
      list.innerHTML = '<p style="color:#64748b">Belum ada pengumuman.</p>';
    } else {
      dataPengumuman.forEach((p, index) => {
        list.innerHTML += `
          <div class="pengumuman-item" style="position: relative;">
            <h4>${p.judul}</h4>
            <p>${p.isi}</p>
            <small>📅 ${p.tanggal}</small>
            <button class="btn-secondary" onclick="hapusPengumuman(${index})" style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px;"><i class="fas fa-trash"></i></button>
          </div>`;
      });
    }
  }

  const homeList = document.getElementById('home-list-pengumuman');
  if (homeList) {
    homeList.innerHTML = ''; 
    if (dataPengumuman.length === 0) {
      homeList.innerHTML = '<p style="color:#64748b; font-size:13px;">Belum ada pengumuman terbaru.</p>';
    } else {
      const recentPengumuman = dataPengumuman.slice(0, 3);
      recentPengumuman.forEach(p => {
        homeList.innerHTML += `
          <div class="list-item">
            <div class="list-icon green"><i class="fas fa-bullhorn"></i></div>
            <div class="list-content">
              <h4>${p.judul}</h4>
              <p>${p.isi}</p>
              <small>📅 ${p.tanggal}</small>
            </div>
          </div>`;
      });
    }
  }
  localStorage.setItem('pengumuman', JSON.stringify(dataPengumuman));
}

function simpanPengumuman() {
  const judul = document.getElementById('p-judul').value.trim();
  const isi = document.getElementById('p-isi').value.trim();
  
  if (!judul || !isi) return alert('Judul dan Isi Pengumuman tidak boleh kosong!');
  
  const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  dataPengumuman.unshift({ judul, isi, tanggal });
  
  localStorage.setItem('pengumuman', JSON.stringify(dataPengumuman));
  renderPengumuman();
  closeModal('modal-pengumuman');
  
  document.getElementById('p-judul').value = '';
  document.getElementById('p-isi').value = '';
}

function hapusPengumuman(index) {
  if (confirm('Hapus pengumuman ini?')) {
    dataPengumuman.splice(index, 1);
    localStorage.setItem('pengumuman', JSON.stringify(dataPengumuman));
    renderPengumuman(); 
  }
}

// =======================================================
// 9. CHART / GRAFIK
// =======================================================
function renderCharts() {
  const chartIuranEl = document.getElementById('chartIuran');
  if(chartIuranEl) {
    new Chart(chartIuranEl, {
      type: 'bar',
      data: {
        labels: ['Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan'],
        datasets: [{
          label: 'Iuran (Rp)',
          data: [450000, 500000, 480000, 520000, 550000, 500000],
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  const chartWargaEl = document.getElementById('chartWarga');
  if(chartWargaEl) {
    new Chart(chartWargaEl, {
      type: 'doughnut',
      data: {
        labels: ['Tetap', 'Kontrak'],
        datasets: [{
          data: [
            dataWarga.filter(w => w.status === 'Tetap').length,
            dataWarga.filter(w => w.status === 'Kontrak').length
          ],
          backgroundColor: ['#10b981', '#f59e0b']
        }]
      }
    });
  }
}

// =======================================================
// 10. SURAT PENGANTAR (HIDE/SHOW, LIST, PRINT, PDF)
// =======================================================
function tampilkanFormSurat() {
  document.getElementById('tampilan-list-surat').style.display = 'none';
  document.getElementById('tampilan-form-surat').style.display = 'block';
  
  document.getElementById('s-nama').value = '';
  document.getElementById('s-nik').value = '';
  document.getElementById('s-alamat').value = '';
  document.getElementById('s-keperluan').value = '';
  document.getElementById('preview-surat').style.display = 'none';
  document.getElementById('form-input-surat').style.display = 'block';
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

  if(!nama || !nik || !keperluan) {
    return alert('Mohon lengkapi Nama, NIK, dan Keperluan!');
  }

  const tgl = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  
  try {
    // Simpan ke Firestore Cloud
    await window.fbAddDoc(window.fbCollection(window.firebaseDB, "surat"), {
      nama: nama,
      nik: nik,
      alamat: alamat,
      keperluan: keperluan,
      tanggal: tgl,
      status: 'Menunggu'
    });

    alert('Surat berhasil dikirim ke sistem RT!');
    batalTambahSurat();
  } catch (error) {
    console.error("Error: ", error);
    alert('Gagal menyimpan data. Periksa koneksi internet Anda.');
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

    // Ambil nama user yang sedang login dari session storage
    const namaUserAktif = sessionStorage.getItem('namaUser') || '';
    const adminPenuh = ['Muhammad Jirhan', 'Wagimin', 'Saikem', 'Sri Ubayati', 'Widodo'];
    const isAdmin = adminPenuh.includes(namaUserAktif);

    let index = 1;
    snapshot.forEach((doc) => {
      const s = doc.data();
      
      // === LOGIKA TOMBOL AKSI ===
      let tombolAksi = `
        <button class="btn-secondary" onclick="downloadSuratPDF('${doc.id}')" style="margin-right: 5px; background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Download PDF"><i class="fas fa-download"></i></button>
        <button class="btn-secondary" onclick="printSuratDariFirebase('${doc.id}')" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Print"><i class="fas fa-print"></i></button>
      `;

      // Jika yang login adalah Admin, tambahkan tombol Edit (meskipun saat ini belum ada fungsi edit surat) dan Hapus
           if (isAdmin) {
        tombolAksi += `
          <!-- Tombol Approve -->
          <button class="btn-secondary" onclick="updateStatusSurat('${doc.id}', 'Disetujui')" style="margin-left: 5px; background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Setujui"><i class="fas fa-check"></i></button>
          
          <!-- Tombol Reject -->
          <button class="btn-secondary" onclick="updateStatusSurat('${doc.id}', 'Ditolak')" style="margin-left: 5px; background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 5px;" title="Tolak"><i class="fas fa-times"></i></button>
          
          <!-- Tombol Hapus -->
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
          <td style="white-space: nowrap;">
            ${tombolAksi}
          </td>
        </tr>`;
    });
  });
}

function printDariList(index) {
  const s = dataSurat[index];
  document.getElementById('hasil-nama').innerText = s.nama;
  document.getElementById('hasil-nik').innerText = s.nik;
  document.getElementById('hasil-alamat').innerText = s.alamat;
  document.getElementById('hasil-keperluan').innerText = s.keperluan;
  document.getElementById('tgl-surat').innerText = s.tanggal;

  document.getElementById('form-input-surat').style.display = 'none';
  document.getElementById('preview-surat').style.display = 'block';
  
  printSurat();
  
  setTimeout(() => {
    document.getElementById('form-input-surat').style.display = 'block';
    document.getElementById('preview-surat').style.display = 'none';
  }, 1000);
}

function editSuratDariList(index) {
  const s = dataSurat[index];
  tampilkanFormSurat(); 
  
  document.getElementById('s-nama').value = s.nama;
  document.getElementById('s-nik').value = s.nik;
  document.getElementById('s-alamat').value = s.alamat;
  document.getElementById('s-keperluan').value = s.keperluan;

  dataSurat.splice(index, 1);
  localStorage.setItem('dataSurat', JSON.stringify(dataSurat));
}

async function hapusSuratDariList(idDokumen) {
  if (confirm('Hapus data surat ini?')) {
    try {
      await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "surat", idDokumen));
      // renderSurat() tidak perlu dipanggil manual karena onSnapshot di renderSurat() 
      // akan otomatis mendeteksi data yang terhapus dan memperbarui tabel.
    } catch (error) {
      console.error("Error menghapus: ", error);
      alert("Gagal menghapus data. Periksa koneksi internet.");
    }
  }
}

function printSurat() {
  const printContent = document.getElementById('isi-surat').innerHTML;
  const printWindow = window.open('', '', 'height=800,width=800');
  
  printWindow.document.write('<html><head><title>Cetak Surat</title>');
  printWindow.document.write(`
    <style>
      body { font-family: 'Times New Roman', Times, serif !important; padding: 40px; background: #fff !important; color: #000 !important; }
      #isi-surat { display: block !important; visibility: visible !important; }
      .kop-surat { display: flex !important; align-items: center; gap: 20px; justify-content: center; text-align: center; }
      .kop-text h3 { font-size: 18px; margin: 0; color: #000; }
      .kop-text h2 { font-size: 22px; margin: 5px 0; color: #000; }
      .kop-text p { font-size: 14px; margin: 0; color: #000; }
      .tabel-surat { width: 100%; font-size: 16px; margin-left: 20px; color: #000; }
      .tabel-surat td { padding: 5px 0; }
      .ttd-area { display: flex !important; justify-content: flex-end; margin-top: 50px; text-align: center; color: #000; }
      hr { border: 2px solid #000 !important; margin-bottom: 20px; }
      p { color: #000 !important; }
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
    // Ambil data dari Firebase
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docRef = window.fbDoc(window.firebaseDB, "surat", idDokumen);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const s = docSnap.data();
      
      // Isi template surat
      document.getElementById('hasil-nama').innerText = s.nama;
      document.getElementById('hasil-nik').innerText = s.nik;
      document.getElementById('hasil-alamat').innerText = s.alamat;
      document.getElementById('hasil-keperluan').innerText = s.keperluan;
      document.getElementById('tgl-surat').innerText = s.tanggal;

      const element = document.getElementById('isi-surat');
      const opt = {
        margin:       1,
        filename:     `Surat_Pengantar_${s.nama.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    } else {
      alert("Data surat tidak ditemukan di database.");
    }
  } catch (error) {
    console.error("Error download: ", error);
    alert("Gagal mengunduh PDF.");
  }
}

function renderHomeSurat() {
  const homeSuratList = document.getElementById('home-list-surat');
  if (!homeSuratList) return;

  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "surat"), (snapshot) => {
    homeSuratList.innerHTML = ''; 

    if (snapshot.empty) {
      homeSuratList.innerHTML = '<p style="color:#64748b; font-size:13px;">Belum ada permohonan surat terbaru.</p>';
      return;
    }

    const suratArray = [];
    snapshot.forEach((doc) => {
      suratArray.push(doc.data());
    });
    
    const recentSurat = suratArray.slice(-2).reverse(); 
    
    recentSurat.forEach((s) => {
      // Tentukan warna badge berdasarkan status
      let badgeClass = 'badge-danger'; // Merah (untuk Ditolak)
      if (s.status === 'Disetujui') badgeClass = 'badge-success'; // Hijau
      if (!s.status || s.status === 'Menunggu') badgeClass = 'badge-warning'; // Kuning

      homeSuratList.innerHTML += `
        <div class="list-item">
          <div class="list-icon orange"><i class="fas fa-file-alt"></i></div>
          <div class="list-content">
            <h4>Surat Pengantar - ${s.keperluan}</h4>
            <p>Pemohon: <strong>${s.nama}</strong></p>
            <small>Status: <span class="badge ${badgeClass}">${s.status || 'Menunggu'}</span></small>
          </div>
        </div>`;
    });
  }); // <--- Tanda penutup onSnapshot ada di sini
}

// =======================================================
// 11. CETAK LAPORAN PDF & LUPA PASSWORD
// =======================================================
function cetakLaporan() {
  const element = document.getElementById('laporan');
  const opt = {
    margin:       1,
    filename:     'Laporan_Keuangan_RT09.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

function lupaPassword() {
  alert("Untuk mereset password, silakan hubungi Admin System RT 09:\n\nNama: Muhammad Jirhan\nNo. HP/WA: 0812-5763-9264\n\nSebutkan nama dan alamat Anda untuk verifikasi.");
}
// =======================================================
// 10. LOGIKA PENCARIAN GLOBAL (POP-UP)
// =======================================================

// Daftar Menu (Sesuaikan dengan menu di sidebar Anda)
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

// Fungsi Buka Modal Pencarian
function bukaPencarian() {
  document.getElementById('modal-pencarian').classList.add('active');
  const input = document.getElementById('input-pencarian');
  input.value = '';
  input.focus();
  tampilkanHasil(menuNavigasi); // Tampilkan semua menu di awal
}

// Fungsi saat user mengetik di kolom pencarian
function jalankanPencarian() {
  const keyword = document.getElementById('input-pencarian').value.toLowerCase();
  
  // Filter menu berdasarkan keyword
  const hasilFilter = menuNavigasi.filter(menu => 
    menu.nama.toLowerCase().includes(keyword) || 
    menu.deskripsi.toLowerCase().includes(keyword)
  );
  
  tampilkanHasil(hasilFilter);
}

// Fungsi untuk merender hasil ke dalam pop-up
function tampilkanHasil(daftarMenu) {
  const container = document.getElementById('hasil-pencarian');
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

// Fungsi klik menu dari hasil pencarian
function pilihMenuDariPencarian(idMenu) {
  // Tutup pop-up
  closeModal('modal-pencarian');
  
  // Klik menu di sidebar secara otomatis
  const sidebarItem = document.querySelector(`.sidebar .menu li[data-page="${idMenu}"]`);
  if(sidebarItem) sidebarItem.click();
}
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("togglePassword");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
    }
}
function exportData() {
    if (dataWarga.length === 0) {
        alert("Tidak ada data untuk diexport!");
        return;
    }
    
    // Header CSV
    const headers = ["ID", "Nama", "NIK", "No KK", "Jenis Kelamin", "Pekerjaan", "Alamat", "Status"];
    const csvRows = [];
    csvRows.push(headers.join(',')); 
    
    // Isi CSV
    for (const w of dataWarga) {
        // Bersihkan koma di dalam teks agar CSV tidak rusak
        const values = [
            w.id, 
            `"${w.nama}"`, 
            `"${w.nik}"`, 
            `"${w.noKK}"`, 
            w.jk, 
            `"${w.pekerjaan}"`, 
            `"${w.alamat}"`, 
            w.status
        ];
        csvRows.push(values.join(','));
    }
    
    // Proses Download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Data_Warga_RT09.csv');
    a.click();
}
// =======================================================
// FUNGSI FITUR IMPORT & EXPORT EXCEL (CSV)
// =======================================================

// 1. Fungsi Download Template
function downloadTemplate() {
    const headers = ["Nama Lengkap", "NIK", "No KTP", "Jenis Kelamin (L/P)", "Pekerjaan", "Alamat Lengkap", "Status (Tetap/Kontrak)"];
    const csvRows = [];
    csvRows.push(headers.join(',')); 
    
    // Tambahkan 1 baris contoh
    csvRows.push("Budi Santoso,3201234567890001,6471012345670001,L,Karyawan Swasta,Jl. Melati No.1,Tetap");
    
 const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Template_Import_Warga.csv');
    a.click();
}

// 2. Fungsi Buka Modal Import
function openModalImport() {
    document.getElementById('modal-import').classList.add('active');
    // Set tanggal hari ini secara otomatis
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('import-tanggal').value = today;
    // Reset file input
    document.getElementById('fileImport').value = '';
}

// 3. Fungsi Proses Import saat tombol hijau diklik
function prosesImport() {
    const fileInput = document.getElementById('fileImport');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Pilih file terlebih dahulu!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.split('\n');
        const newData = [];
        
        // Looping mulai dari index 1 (melewati baris judul/header)
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip baris kosong
            
            // Memisahkan kolom berdasarkan koma
            const cols = rows[i].split(',');
            
            // Pastikan kolom lengkap (minimal 7 kolom)
            if (cols.length >= 7) {
                newData.push({
                    id: Date.now() + i, // ID Unik
                    nama: cols[0].replace(/"/g, '').trim(),                 // Kolom 1: Nama
                    nik: cols[1].replace(/"/g, '').trim(),                  // Kolom 2: NIK
                    noKtp: cols[2].replace(/"/g, '').trim(),                // Kolom 3: No KTP
                    jk: cols[3].trim().toUpperCase() === 'P' ? 'P' : 'L',   // Kolom 4: Jenis Kelamin
                    pekerjaan: cols[4].replace(/"/g, '').trim(),            // Kolom 5: Pekerjaan
                    alamat: cols[5].replace(/"/g, '').trim(),               // Kolom 6: Alamat
                    status: cols[6].trim()                                  // Kolom 7: Status
                });
            }
        }
        
        if (newData.length > 0) {
            // Gabungkan dengan data lama
            dataWarga = dataWarga.concat(newData);
            localStorage.setItem('warga', JSON.stringify(dataWarga));
            
            // Render ulang tabel dan tutup modal
            renderTable();
            closeModal('modal-import');
            alert(`Berhasil mengimport ${newData.length} data warga!`);
        } else {
            alert("Format file tidak sesuai. Pastikan menggunakan template yang disediakan.");
        }
    };
    reader.readAsText(file);
}
// =======================================================
// 12. LOGIKA ZOOM POSTER CAMPAIGN
// =======================================================
function bukaPoster() {
  // Ambil sumber gambar dari poster yang ada di Home
  const posterHome = document.querySelector('.campaign-img');
  
  if (posterHome) {
    // Masukkan gambar ke dalam modal
    document.getElementById('poster-full').src = posterHome.src;
    // Tampilkan modal
    document.getElementById('modal-poster').classList.add('active');
  }
}

function tutupPoster() {
  // Sembunyikan modal
  document.getElementById('modal-poster').classList.remove('active');
}
async function printSuratDariFirebase(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docRef = window.fbDoc(window.firebaseDB, "surat", idDokumen);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const s = docSnap.data();
      
      // Isi template surat
      document.getElementById('hasil-nama').innerText = s.nama;
      document.getElementById('hasil-nik').innerText = s.nik;
      document.getElementById('hasil-alamat').innerText = s.alamat;
      document.getElementById('hasil-keperluan').innerText = s.keperluan;
      document.getElementById('tgl-surat').innerText = s.tanggal;

      // Sembunyikan form, munculkan preview
      document.getElementById('form-input-surat').style.display = 'none';
      document.getElementById('preview-surat').style.display = 'block';
      
      // Panggil fungsi print yang sudah ada
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
async function updateStatusSurat(idDokumen, statusBaru) {
  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docRef = window.fbDoc(window.firebaseDB, "surat", idDokumen);
    
    // Update status di database
    await updateDoc(docRef, {
      status: statusBaru
    });
    
    alert(`Surat berhasil di${statusBaru === 'Disetujui' ? 'setujui' : 'tolak'}!`);
  } catch (error) {
    console.error("Error update status: ", error);
    alert("Gagal memproses surat.");
  }
}
// ============ FUNGSI LIHAT WARGA ============
async function lihatWarga(idDokumen) {
  // Pastikan idDokumen tidak kosong
  if (!idDokumen || idDokumen === 'undefined') {
    return alert('ID Dokumen tidak valid.');
  }

  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docRef = window.fbDoc(window.firebaseDB, "warga", idDokumen);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const w = docSnap.data();
      document.getElementById('lihat-nama').innerText = w.nama || '-';
      document.getElementById('lihat-nik').innerText = w.nik || '-';
      document.getElementById('lihat-kk').innerText = w.noKtp || '-';
      document.getElementById('lihat-jk').innerText = w.jk === 'L' ? 'Laki-laki' : 'Perempuan';
      document.getElementById('lihat-pekerjaan').innerText = w.pekerjaan || '-';
      document.getElementById('lihat-alamat').innerText = w.alamat || '-';
      document.getElementById('lihat-status').innerText = w.status || '-';
      document.getElementById('modal-lihat-warga').classList.add('active');
    }
  } catch (error) {
    console.error("Error lihat: ", error);
    alert("Gagal mengambil data: " + error.message);
  }
}

// ============ FUNGSI EDIT WARGA ============
async function openEditWarga(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docRef = window.fbDoc(window.firebaseDB, "warga", idDokumen);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const w = docSnap.data();
      document.getElementById('edit-w-id').value = idDokumen;
      document.getElementById('edit-w-nama').value = w.nama || '';
      document.getElementById('edit-w-nik').value = w.nik || '';
      document.getElementById('edit-w-kk').value = w.noKtp || '';
      document.getElementById('edit-w-jk').value = w.jk || 'L';
      document.getElementById('edit-w-pekerjaan').value = w.pekerjaan || '';
      document.getElementById('edit-w-alamat').value = w.alamat || '';
      document.getElementById('edit-w-status').value = w.status || 'Tetap';
      document.getElementById('modal-edit-warga').classList.add('active');
    }
  } catch (error) {
    console.error("Error edit: ", error);
  }
}

// ============ FUNGSI SIMPAN EDIT WARGA ============
async function simpanEditWarga() {
  const idDokumen = document.getElementById('edit-w-id').value;
  const dataBaru = {
    nama: document.getElementById('edit-w-nama').value.trim(),
    nik: document.getElementById('edit-w-nik').value.trim(),
    noKtp: document.getElementById('edit-w-kk').value.trim(),
    jk: document.getElementById('edit-w-jk').value,
    pekerjaan: document.getElementById('edit-w-pekerjaan').value.trim(),
    alamat: document.getElementById('edit-w-alamat').value.trim(),
    status: document.getElementById('edit-w-status').value
  };

  try {
    const { updateDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docRef = window.fbDoc(window.firebaseDB, "warga", idDokumen);
    await updateDoc(docRef, dataBaru);
    
    alert('Data warga berhasil diupdate!');
    closeModal('modal-edit-warga');
  } catch (error) {
    console.error("Error update: ", error);
    alert('Gagal mengupdate data.');
  }
}