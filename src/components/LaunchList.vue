<template>
  <div class="launch-list">
    <div class="header">
      <select v-model="filter" class="filter-dropdown">
        <option value="all">Tous les lancements</option>
        <option value="upcoming">Lancements à venir</option>
        <option value="success">Lancements réussis</option>
        <option value="failed">Lancements échoués</option>
      </select>
    </div>
    
    <div class="launches-grid">
      <div v-for="launch in filteredLaunches" :key="launch.id" class="launch-card">
        <div class="launch-image">
          <img 
            v-if="launch.links?.patch?.small || launch.links?.patch?.large" 
            :src="launch.links.patch.small || launch.links.patch.large" 
            :alt="launch.name"
            class="mission-patch"
          />
          <div v-else class="no-image-placeholder">
            <span>No img</span>
          </div>
        </div>
        
        <div class="launch-content">
          <h3 class="launch-name">{{ launch.name }}</h3>
          <p class="launch-date">{{ formatDate(launch.date_utc) }}</p>
          
          <div class="launch-status">
            <span 
              class="status-badge"
              :class="{
                'success': launch.success === true,
                'failure': launch.success === false,
                'upcoming': launch.upcoming === true
              }"
            >
              {{ getLaunchStatusText(launch) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'LaunchList',
  setup() {
    const launches = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const filter = ref('all');

    const fetchLaunches = async () => {
      try {
        loading.value = true;
        const response = await axios.get('https://api.spacexdata.com/v4/launches');
        launches.value = response.data;
        
      
        console.log('Données de l\'API:', launches.value);
        console.log('Structure d\'un lancement:', launches.value[0]);
        console.log('Example success value:', launches.value[0]?.success);
        console.log('Example upcoming value:', launches.value[0]?.upcoming);
        
      } catch (err) {
        console.error('Erreur lors de la récupération des lancements:', err);
        error.value = err.message || 'Erreur lors du chargement des données';
      } finally {
        loading.value = false;
      }
    };

    const filteredLaunches = computed(() => {
      if (filter.value === 'all') {
        return launches.value;
      } else if (filter.value === 'upcoming') {
        return launches.value.filter(launch => launch.upcoming === true);
      } else if (filter.value === 'success') {
        return launches.value.filter(launch => launch.success === true);
      } else if (filter.value === 'failed') {
        return launches.value.filter(launch => launch.success === false);
      }
      return launches.value;
    });

    const formatDate = (dateStr) => {
      if (!dateStr) return 'Date inconnue';
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR');
    };

    const getLaunchStatusText = (launch) => {
      if (launch.upcoming === true) {
        return 'À venir';
      } else if (launch.success === true) {
        return 'Réussi';
      } else if (launch.success === false) {
        return 'Échec';
      } else {
        return 'Inconnu';
      }
    };

    onMounted(() => {
      fetchLaunches();
    });

    return {
      launches,
      filteredLaunches,
      loading,
      error,
      filter,
      formatDate,
      getLaunchStatusText
    };
  }
});
</script>

<style scoped>
.launch-list {
  padding: 20px;
  background-color: red;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.filter-dropdown {
  background-color: #1a1f2e;
  color: white;
  border: 1px solid #3d4451;
  border-radius: 4px;
  padding: 8px 12px;
}

.launches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.launch-card {
  background-color: #1a1f2e;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.launch-image {
  height: 120px;
  background-color: #232936;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mission-patch {
  max-height: 100px;
  max-width: 80%;
}

.no-image-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #3d4451;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8d97a7;
}

.launch-content {
  padding: 15px;
}

.launch-name {
  margin: 0 0 8px 0;
  color: white;
}

.launch-date {
  color: #8d97a7;
  margin-bottom: 12px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.success {
  background-color: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.status-badge.failure {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.status-badge.upcoming {
  background-color: rgba(52, 152, 219, 0.2);
  color: red;
}
</style>
