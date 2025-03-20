<template>
  <div class="next-launch-container">
    <h2>Prochain lancement</h2>
    
    <div v-if="launch" class="launch-info">
      <h3 class="launch-name">{{ launch.name }}</h3>
      <p class="launch-date">{{ formatDate(launch.date_utc) }}</p>
      
      <div v-if="isPastLaunch" class="past-launch-message">
        Ce lancement a déjà eu lieu
      </div>
      
      <div v-else class="countdown-grid">
        <div class="countdown-item">
          <div class="countdown-value">{{ countdown.days }}</div>
          <div class="countdown-label">Jours</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-value">{{ countdown.hours }}</div>
          <div class="countdown-label">Heures</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-value">{{ countdown.minutes }}</div>
          <div class="countdown-label">Minutes</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-value">{{ countdown.seconds }}</div>
          <div class="countdown-label">Secondes</div>
        </div>
      </div>
    </div>
    
    <div v-else class="loading">
      Chargement du prochain lancement...
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'NextLaunch',
  setup() {
    const launch = ref(null);
    const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const countdownInterval = ref(null);
    const loading = ref(true);
    const error = ref(null);
    
    const isPastLaunch = computed(() => {
      if (!launch.value) return false;
      const launchDate = new Date(launch.value.date_utc);
      return launchDate < new Date();
    });

    const fetchLaunches = async () => {
      try {
        const response = await axios.get('https://api.spacexdata.com/v4/launches');
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des lancements:', error);
        throw error;
      }
    };

    const fetchNextLaunch = async () => {
      try {
        loading.value = true;
        const launches = await fetchLaunches();
        console.log('Tous les lancements:', launches);
        
        const upcomingLaunches = launches.filter(l => l.upcoming);
        console.log('Lancements à venir:', upcomingLaunches);
        
        if (upcomingLaunches.length > 0) {

          upcomingLaunches.sort((a, b) => {
            return new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime();
          });
          
          launch.value = upcomingLaunches[0];
        } else {
          const pastLaunches = launches.filter(l => !l.upcoming);
          pastLaunches.sort((a, b) => {
            return new Date(b.date_utc).getTime() - new Date(a.date_utc).getTime();
          });
          
          if (pastLaunches.length > 0) {
            launch.value = pastLaunches[0];
          }
        }
        
        if (launch.value && !isPastLaunch.value) {
          startCountdown();
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du prochain lancement:', err);
        error.value = 'Impossible de charger les données du prochain lancement';
      } finally {
        loading.value = false;
      }
    };

    const calculateCountdown = () => {
      if (!launch.value) return;
      
      const now = new Date().getTime();
      const launchDate = new Date(launch.value.date_utc).getTime();
      
      if (launchDate <= now) {
        countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (countdownInterval.value) {
          clearInterval(countdownInterval.value);
          countdownInterval.value = null;
        }
        return;
      }
      
      const difference = launchDate - now;
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      countdown.value = { days, hours, minutes, seconds };
    };

    const startCountdown = () => {
      calculateCountdown();
      
      countdownInterval.value = setInterval(calculateCountdown, 1000);
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(fetchNextLaunch);

    onUnmounted(() => {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
      }
    });

    return {
      launch,
      countdown,
      loading,
      error,
      isPastLaunch,
      formatDate
    };
  }
});
</script>

<style scoped>
.next-launch-container {
  background-color:#1e3a8a ;
  border-radius: 8px;
  padding: 20px;
  color: white;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
  color: #fff;
}

.launch-name {
   color: #fff;
  margin-bottom: 8px;
  font-size: 20px;
}

.launch-date {
   color: #fff;
  margin-bottom: 20px;
}

.countdown-grid {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.countdown-item {
  background-color: #232936;
  border-radius: 8px;
  padding: 15px 20px;
  text-align: center;
  width: 22%;
}

.countdown-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.countdown-label {
  font-size: 14px;
  color: #fff;
}

.past-launch-message {
  background-color: #172554;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  color: #fff;
  font-weight: bold;
  margin-top: 15px;
}

</style>
