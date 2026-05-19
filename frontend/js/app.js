const studentForm = document.getElementById('studentForm');
const studentList = document.getElementById('studentList');
const searchInput = document.getElementById('searchInput'); // Référence à la barre de recherche
let allStudents = [];
let editMode = false;
let currentEditId = null;
let currentView = 'table';

// --- 1. CHARGEMENT DES ÉTUDIANTS ---
const fetchStudents = async () => {
    try {
        const response = await fetch('http://localhost:3000/students');
        allStudents = await response.json();
        displayStudents(allStudents); // Affiche tout au début
        updateStats(allStudents);     // Met à jour les compteurs
    } catch (error) {
        console.error("Erreur:", error);
    }
};

// --- 2. LOGIQUE DE FILTRAGE (AJOUTÉE ICI) ---
const filterNiveau = document.getElementById('filterNiveau');

// --- FONCTION DE FILTRAGE COMBINÉE ---
const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedNiveau = filterNiveau.value;

    const filtered = allStudents.filter(student => {
        // Condition Recherche texte (Nom ou Filière)
        const matchesSearch = 
            student.nom.toLowerCase().includes(searchTerm) || 
            student.filiere.toLowerCase().includes(searchTerm);

        // Condition Niveau (si "Toutes les années", on laisse tout passer)
        const matchesNiveau = 
            selectedNiveau === "" || 
            student.niveau.toString() === selectedNiveau;

        return matchesSearch && matchesNiveau;
    });

    displayStudents(filtered);
    updateStats(filtered); // Optionnel : met à jour les stats en fonction du filtre
};

// Écouteurs d'événements pour les deux filtres
if (searchInput) searchInput.addEventListener('input', applyFilters);
if (filterNiveau) filterNiveau.addEventListener('change', applyFilters);


// Écouteurs pour changer de vue
document.getElementById('viewTableBtn').addEventListener('click', (e) => {
    currentView = 'table';
    document.getElementById('tableView').classList.remove('d-none');
    document.getElementById('cardView').classList.add('d-none');
    
    // Gestion du style visuel des boutons
    e.target.classList.add('active');
    document.getElementById('viewCardsBtn').classList.remove('active');
    applyFilters(); 
});

document.getElementById('viewCardsBtn').addEventListener('click', (e) => {
    currentView = 'cards';
    document.getElementById('tableView').classList.add('d-none');
    document.getElementById('cardView').classList.remove('d-none');
    
    // Gestion du style visuel des boutons
    e.target.classList.add('active');
    document.getElementById('viewTableBtn').classList.remove('active');
    applyFilters();
});

// --- 3. AFFICHAGE DANS LE TABLEAU ---
const displayStudents = (students) => {
    const studentList = document.getElementById('studentList');
    const cardView = document.getElementById('cardView');
    
    // On vide les deux conteneurs à chaque fois
    studentList.innerHTML = '';
    cardView.innerHTML = '';

    students.forEach(s => {
        // 1. GÉNÉRATION LIGNE TABLEAU
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="mail-checkbox" value="${s.email}"></td>
            <td>${s.nom}</td>
            <td>${s.email}</td>
            <td>${s.telephone || '-'}</td>
            <td>${s.filiere} (A${s.niveau})</td>
            <td class="text-center">
                <button onclick="prepareEdit('${s.id}')" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                <button onclick="deleteStudent('${s.id}')" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
            </td>`;
        studentList.appendChild(row);

        // 2. GÉNÉRATION CARTE
        // --- MODE CARTES ---
const card = document.createElement('div');
card.className = 'col-md-4 mb-3';
card.innerHTML = `
    <div class="card shadow-sm h-100 border-0 position-relative card-hover">
        <div class="position-absolute" style="top: 10px; right: 10px; z-index: 10;">
            <input type="checkbox" class="mail-checkbox form-check-input shadow-none" 
                   value="${s.email}" 
                   style="width: 20px; height: 20px; cursor: pointer;">
        </div>

        <div class="card-body text-center" onclick="showDetails('${s.id}')" style="cursor: pointer;">
            <div class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3" style="width: 50px; height: 50px; font-size: 20px;">
                ${s.nom.charAt(0).toUpperCase()}
            </div>
            <h6 class="card-title fw-bold mb-1">${s.nom}</h6>
            <p class="text-muted small mb-2 text-truncate">${s.email}</p>
            <span class="badge bg-info text-white">${s.filiere}</span>
        </div>
    </div>`;
cardView.appendChild(card);
    });
};

// --- 4. AJOUT OU MODIFICATION ---
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Récupération des valeurs
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const adresse = document.getElementById('adresse').value.trim();
    const filiere = document.getElementById('filiere').value.trim();
    const niveau = parseInt(document.getElementById('niveau').value);

    // 2. FILTRES DE SÉCURITÉ (REGEX)
    
    // Format Email standard
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Format Téléphone Marocain (05, 06 ou 07 suivi de 8 chiffres)
    const telRegex = /^(05|06|07)\d{8}$/;

    // 3. VÉRIFICATIONS
    if (nom.length < 3) {
        return Swal.fire('Erreur', 'Le nom doit contenir au moins 3 caractères', 'error');
    }

    if (!emailRegex.test(email)) {
        return Swal.fire('Erreur', 'Format d\'email invalide (ex: nom@ecole.ma)', 'error');
    }

    if (telephone !== "" && !telRegex.test(telephone)) {
        return Swal.fire('Erreur', 'Le téléphone doit être un numéro marocain valide (10 chiffres commençant par 05, 06 ou 07)', 'error');
    }

    if (isNaN(niveau) || niveau < 1 || niveau > 5) {
        return Swal.fire('Erreur', 'Le niveau doit être compris entre 1 et 5', 'error');
    }

    // 4. SI TOUT EST OK -> ENVOI DES DONNÉES
    const data = { nom, email, telephone, adresse, filiere, niveau };
    const url = editMode ? `http://localhost:3000/students/${currentEditId}` : 'http://localhost:3000/students';
    const method = editMode ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            Swal.fire('Succès', editMode ? 'Modifié avec succès' : 'Ajouté avec succès', 'success');
            resetForm();
            fetchStudents();
        }
    } catch (err) {
        Swal.fire('Erreur', 'Impossible de contacter le serveur', 'error');
    }
});
// --- 5. PRÉPARER LA MODIFICATION ---
window.prepareEdit = (id) => {
    const s = allStudents.find(student => student.id === id);
    if (!s) return;

    document.getElementById('nom').value = s.nom;
    document.getElementById('email').value = s.email;
    document.getElementById('telephone').value = s.telephone || '';
    document.getElementById('adresse').value = s.adresse || '';
    document.getElementById('filiere').value = s.filiere;
    document.getElementById('niveau').value = s.niveau;

    editMode = true;
    currentEditId = id;
    document.getElementById('submitBtn').innerText = "Enregistrer les modifications";
    document.getElementById('submitBtn').className = "btn btn-warning w-100";
};

// --- 6. RÉINITIALISATION ---
const resetForm = () => {
    studentForm.reset();
    editMode = false;
    currentEditId = null;
    document.getElementById('submitBtn').innerText = "Enregistrer l'étudiant";
    document.getElementById('submitBtn').className = "btn btn-primary w-100";
};

// --- 7. SUPPRESSION ---
window.deleteStudent = async (id) => {
    const result = await Swal.fire({
        title: 'Supprimer ?',
        text: "Cette action est irréversible",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer'
    });

    if (result.isConfirmed) {
        try {
            await fetch(`http://localhost:3000/students/${id}`, { method: 'DELETE' });
            fetchStudents();
            Swal.fire('Supprimé', '', 'success');
        } catch (err) { console.error(err); }
    }
};

// --- 8. STATISTIQUES ---
const updateStats = (students) => {
    const total = students.length;
    const filieres = [...new Set(students.map(s => s.filiere))].length;
    if(document.getElementById('totalCount')) document.getElementById('totalCount').innerText = total;
    if(document.getElementById('filiereCount')) document.getElementById('filiereCount').innerText = filieres;
};

// --- 9. EMAILS ---
window.sendEmails = async () => {
    const selected = Array.from(document.querySelectorAll('.mail-checkbox:checked')).map(cb => cb.value);
    if (selected.length === 0) return Swal.fire('Oups', 'Cochez au moins un étudiant', 'info');

    const { value: message } = await Swal.fire({
        title: `Envoyer un email à ${selected.length} étudiant(s)`,
        input: 'textarea',
        inputLabel: 'Votre message',
        showCancelButton: true
    });

    if (message) {
        for (const email of selected) {
            await fetch('http://localhost:3000/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: email, subject: "Information École", message })
            });
        }
        Swal.fire('Envoyé', 'Simulation terminée ', 'success');
    }
};



window.showDetails = (id) => {
    const s = allStudents.find(student => student.id === id);
    if (!s) return;

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="py-3">
            <div class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px; font-size: 32px;">
                ${s.nom.charAt(0).toUpperCase()}
            </div>
            <h4 class="fw-bold">${s.nom}</h4>
            <p class="badge bg-success mb-4">Étudiant(e) - Année ${s.niveau}</p>
            
            <div class="text-start border-top pt-3">
                <p><strong><i class="fas fa-envelope text-primary me-2"></i> Email :</strong> ${s.email}</p>
                <p><strong><i class="fas fa-phone text-primary me-2"></i> Téléphone :</strong> ${s.telephone || 'Non renseigné'}</p>
                <p><strong><i class="fas fa-map-marker-alt text-primary me-2"></i> Adresse :</strong> ${s.adresse || 'Non renseignée'}</p>
                <p><strong><i class="fas fa-university text-primary me-2"></i> Filière :</strong> ${s.filiere}</p>
            </div>
        </div>
    `;

    // Affiche la modale
    const myModal = new bootstrap.Modal(document.getElementById('studentModal'));
    myModal.show();
};

fetchStudents();