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
// 2. DATA GLOBAL (Dikosongkan karena pakai Firebase)
// =======================================================
let dataWarga = [];
let dataKK = [];
let dataIuran = [];
let dataPengumuman = [];
let dataSurat = []; 

// =======================================================
// 3. JAM & SHORTCUT & NAVIGASI
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

document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
    e.preventDefault(); bukaPencarian(); 
  }
  if (e.key === 'Escape') {
    closeModal('modal-pencarian');
  }
});

document.querySelectorAll('.sidebar .menu li[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar .menu li').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    item.classList.add('active');
    const page = item.dataset.page;
    document.getElementById(page).classList.add('active');
    document.getElementById('page-title').textContent = item.textContent.trim();
    
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
// 4. FUNGSI LOGIN & DASHBOARD
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
// 6. DATA WARGA (RENDER, SIMPAN, LIHAT, EDIT, HAPUS)
// =======================================================
function renderWarga() {
  const tbody = document.querySelector('#table-warga tbody');
  if (!tbody) return; 

  window.fbOnSnapshot(window.fbCollection(window.firebaseDB, "warga"), (snapshot) => {
    tbody.innerHTML = '';
    dataWarga = []; 
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#64748b;">Belum ada data warga.</td></tr>';
      document.getElementById('total-warga').textContent = '0';
      return;
    }

    let index = 1;
    snapshot.forEach((doc) => {
      const w = doc.data();
      w.id = doc.id; // Simpan ID Firebase ke dalam objek
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
  } catch (error) {
    console.error("Error: ", error);
    alert('Gagal menyimpan data.');
  }
}

async function lihatWarga(idDokumen) {
  try {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    const docRef = window.fbDoc(window.firebaseDB, "warga", idDokumen);
    const docSnap = await getDoc(docRef);

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
    const docRef = window.fbDoc(window.firebaseDB, "warga", idDokumen);
    const docSnap = await getDoc(docRef);

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
    const docRef = window.fbDoc(window.firebaseDB, "warga", idDokumen);
    await updateDoc(docRef, dataBaru);
    
    alert('Data warga berhasil diupdate!');
    closeModal('modal-edit-warga');
  } catch (error) { console.error("Error update: ", error); alert('Gagal mengupdate data.'); }
}

async function hapusWarga(idDokumen) {
  if (confirm('Hapus data warga ini?')) {
    try {
      await window.fbDeleteDoc(window.fbDoc(window.firebaseDB, "warga", idDokumen));
    } catch (error) { console.error("Error hapus: ", error); }
  }
}

// =======================================================
// 7. EXPORT EXCEL (Format .xls yang rapi & Terbaca)
// =======================================================
function exportExcel() {
  if (dataWarga.length === 0) return alert('Tidak ada data untuk diexport.');

  let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"></head><body>
    <table border="1">
      <thead>
        <tr>
          <th>ID</th><th>Nama</th><th>NIK</th><th>No. KK</th><th>Jenis Kelamin</th><th>Pekerjaan</th><th>Alamat</th><th>Status</th>
        </tr>
      </thead><tbody>
  `;

  dataWarga.forEach((w, index) => {
    tableHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${w.nama || '-'}</td>
        <td>${w.nik || '-'}</td>
        <td>${w.noKK || '-'}</td>
        <td>${w.jk || '-'}</td>
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