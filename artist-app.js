// Función principal para obtener información del artista
async function fetchArtistInfo(artistId, token) {
    const url = `https://api.spotify.com/v1/artists/${artistId}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

// Función para formatear números grandes
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Función para crear la tarjeta del artista con diseño personalizado
function createArtistCard(artist) {
    const card = document.createElement('div');
    card.className = 'col-md-8';
    
    // Obtener la imagen del artista o usar placeholder
    const imageUrl = artist.images && artist.images[0] 
        ? artist.images[0].url 
        : 'https://via.placeholder.com/640x640/1DB954/ffffff?text=No+Image';
    
    // Crear los géneros como badges
    const genresHtml = artist.genres && artist.genres.length > 0
        ? artist.genres.map(genre => `<span class="genre-badge">${genre}</span>`).join('')
        : '<span class="genre-badge">Sin géneros especificados</span>';
    
    // Calcular el nivel de popularidad
    const popularityLevel = getPopularityLevel(artist.popularity);
    const popularityColor = getPopularityColor(artist.popularity);
    
    card.innerHTML = `
        <div class="artist-card">
            <!-- Imagen del Artista -->
            <img src="${imageUrl}" alt="${artist.name}" class="artist-image">
            
            <!-- Header con nombre -->
            <div class="artist-header">
                <h2 class="display-6 fw-bold mb-0">
                    <i class="bi bi-person-circle"></i> ${artist.name}
                </h2>
            </div>
            
            <!-- Cuerpo de la tarjeta -->
            <div class="card-body p-4">
                <!-- Géneros -->
                <div class="mb-4">
                    <h5 class="text-muted mb-3">
                        <i class="bi bi-music-note-list"></i> Géneros Musicales
                    </h5>
                    <div>${genresHtml}</div>
                </div>
                
                <!-- Estadísticas -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="stat-box">
                            <div class="stat-number">${formatNumber(artist.followers.total)}</div>
                            <div class="stat-label">Seguidores</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="stat-box">
                            <div class="stat-number">${artist.popularity}%</div>
                            <div class="stat-label">Popularidad</div>
                        </div>
                    </div>
                </div>
                
                <!-- Barra de popularidad visual -->
                <div class="mb-4">
                    <h6 class="text-muted mb-2">Nivel de Popularidad</h6>
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar ${popularityColor}" 
                             role="progressbar" 
                             style="width: ${artist.popularity}%"
                             aria-valuenow="${artist.popularity}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${popularityLevel}
                        </div>
                    </div>
                </div>
                
                <!-- Información adicional -->
                <div class="alert alert-light" role="alert">
                    <h6 class="alert-heading">
                        <i class="bi bi-info-circle"></i> Información Adicional
                    </h6>
                    <hr>
                    <p class="mb-2"><strong>ID del Artista:</strong> ${artist.id}</p>
                    <p class="mb-0"><strong>Tipo:</strong> ${artist.type.charAt(0).toUpperCase() + artist.type.slice(1)}</p>
                </div>
                
                <!-- Links externos -->
                <div class="d-flex gap-2 justify-content-center mt-4">
                    <a href="${artist.external_urls.spotify}" 
                       target="_blank" 
                       class="spotify-button">
                        <i class="bi bi-spotify"></i> Ver en Spotify
                    </a>
                    <button class="btn btn-outline-danger" onclick="clearArtist()">
                        <i class="bi bi-trash"></i> Limpiar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Función para determinar el nivel de popularidad
function getPopularityLevel(popularity) {
    if (popularity >= 80) return 'Superestrella';
    if (popularity >= 60) return 'Muy Popular';
    if (popularity >= 40) return 'Popular';
    if (popularity >= 20) return 'Emergente';
    return 'Underground';
}

// Función para determinar el color de la barra de popularidad
function getPopularityColor(popularity) {
    if (popularity >= 80) return 'bg-success';
    if (popularity >= 60) return 'bg-info';
    if (popularity >= 40) return 'bg-warning';
    if (popularity >= 20) return 'bg-secondary';
    return 'bg-danger';
}

// Función para limpiar el contenedor
function clearArtist() {
    document.getElementById('artist-container').innerHTML = '';
    document.getElementById('error-message').style.display = 'none';
}

// Función para mostrar error
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Función para mostrar/ocultar loading
function toggleLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Botón principal de búsqueda
    document.getElementById('fetch-artist-btn').addEventListener('click', async () => {
        const token = document.getElementById('access-token').value.trim();
        const selectedArtist = document.getElementById('artist-select').value;
        const customArtistId = document.getElementById('custom-artist-id').value.trim();
        
        // Usar el ID personalizado si existe, sino usar el seleccionado
        const artistId = customArtistId || selectedArtist;
        
        // Validaciones
        if (!token) {
            showError('Por favor, ingresa tu Bearer Token de Spotify');
            return;
        }
        
        if (!artistId) {
            showError('Por favor, selecciona un artista o ingresa un ID personalizado');
            return;
        }
        
        // Limpiar mensajes de error previos
        document.getElementById('error-message').style.display = 'none';
        clearArtist();
        
        // Mostrar loading
        toggleLoading(true);
        
        try {
            // Obtener información del artista
            const artistData = await fetchArtistInfo(artistId, token);
            
            // Ocultar loading
            toggleLoading(false);
            
            // Crear y mostrar la tarjeta del artista
            const container = document.getElementById('artist-container');
            const artistCard = createArtistCard(artistData);
            container.appendChild(artistCard);
            
            // Hacer scroll suave hacia la tarjeta
            artistCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } catch (error) {
            // Ocultar loading
            toggleLoading(false);
            
            // Mostrar error
            if (error.message.includes('401')) {
                showError('Token inválido o expirado. Por favor, genera un nuevo token.');
            } else if (error.message.includes('404')) {
                showError('Artista no encontrado. Verifica el ID del artista.');
            } else {
                showError(`Error al obtener información del artista: ${error.message}`);
            }
            
            console.error('Error:', error);
        }
    });
    
    // Botón de búsqueda personalizada
    document.getElementById('search-custom-btn').addEventListener('click', () => {
        document.getElementById('fetch-artist-btn').click();
    });
    
    // Limpiar ID personalizado cuando se selecciona un artista del dropdown
    document.getElementById('artist-select').addEventListener('change', () => {
        if (document.getElementById('artist-select').value) {
            document.getElementById('custom-artist-id').value = '';
        }
    });
    
    // Limpiar selección del dropdown cuando se escribe un ID personalizado
    document.getElementById('custom-artist-id').addEventListener('input', () => {
        if (document.getElementById('custom-artist-id').value) {
            document.getElementById('artist-select').value = '';
        }
    });
    
    // Permitir búsqueda con Enter en el campo de token
    document.getElementById('access-token').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('fetch-artist-btn').click();
        }
    });
    
    // Permitir búsqueda con Enter en el campo de ID personalizado
    document.getElementById('custom-artist-id').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('fetch-artist-btn').click();
        }
    });
});

// Función para obtener el token (helper para testing)
// Puedes usar esta función en la consola para obtener un token de prueba
async function getTestToken(clientId, clientSecret) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    
    const data = await response.json();
    return data.access_token;
}

// Log para confirmar que el script se cargó correctamente
console.log('🎵 Spotify Artist Explorer cargado correctamente');
console.log('💡 Tip: Para obtener un token, usa tu Client ID y Client Secret en auth.html primero');