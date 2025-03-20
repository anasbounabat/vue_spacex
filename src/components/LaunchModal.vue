<template>
  <div class="fixed inset-0 bg-blue-950 bg-opacity-90 flex items-center justify-center p-4 z-50">
    <div class="bg-blue-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="p-6 relative">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-bold text-blue-200">{{ launch.name }}</h2>
          <button 
            @click="$emit('close')" 
            class="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p class="text-white mb-6">
          <span class="font-semibold">Date:</span> {{ formatDate(launch.date_utc) }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="text-gray-300 space-y-4">
            <div>
              <p class="text-white"><span class="font-semibold">Vol numéro:</span> {{ launch.flight_number }}</p>
              <p class="text-white">
                <span class="font-semibold">Statut:</span> 
                <span :class="launch.success === true ? 'text-green-500' : launch.success === false ? 'text-red-500' : 'text-yellow-500'">
                  {{ getLaunchStatus(launch) }}
                </span>
              </p>
            </div>

            <div v-if="launch.details" class="mt-4">
              <h3 class="text-lg font-semibold mb-2">Détails de la mission</h3>
              <p class="text-gray-300 text-sm">{{ launch.details }}</p>
            </div>
            
            <div v-if="launchpad" class="mt-4">
              <h3 class="text-lg font-semibold mb-2">Site de lancement</h3>
              <p class="text-white">{{ launchpad.full_name }}</p>
              <p class="text-gray-400">{{ launchpad.locality }}, {{ launchpad.region }}</p>
            </div>


            <div v-if="launch.cores && launch.cores.length" class="mt-4">
              <h3 class="text-lg font-semibold mb-2">Booster</h3>
              <div v-for="(core, index) in launch.cores" :key="index" class="mb-2">
                <p class="text-white">
                  <span class="font-semibold">Réutilisé:</span> {{ core.reused ? 'Oui' : 'Non' }}
                </p>
                <p v-if="core.flight" class="text-white">
                  <span class="font-semibold">Vol numéro:</span> {{ core.flight }}
                </p>
                <p v-if="core.landing_success !== null" class="text-white">
                  <span class="font-semibold">Atterrissage:</span> 
                  <span :class="core.landing_success ? 'text-green-500' : 'text-red-500'">
                    {{ core.landing_success ? 'Réussi' : 'Échoué' }}
                  </span>
                </p>
              </div>
            </div>


            <div v-if="launch.links && launch.links.article" class="mt-4">
              <a 
                :href="launch.links.article" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-blue-400 hover:text-blue-300 underline inline-flex items-center"
              >
                <span>Voir l'article</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          
          <div class="flex flex-col items-center">
            <img 
              v-if="launch.links?.patch?.large" 
              :src="launch.links.patch.large" 
              alt="Mission patch" 
              class="w-64 h-64 object-contain mb-8"
            >
            <div v-else class="w-64 h-64 bg-gray-800 flex items-center justify-center rounded-lg mb-8">
              <span class="text-gray-500">Patch non disponible</span>
            </div>
            
            <div v-if="payloads.length > 0" class="w-full mb-8 bg-blue-950 p-4 rounded">
              <h3 class="text-lg font-semibold mb-2 text-center">Charges utiles</h3>
              <ul class="space-y-2">
                <li v-for="payload in payloads" :key="payload.id" class="text-sm text-gray-300">
                  <div class="flex justify-between">
                    <span class="font-medium">{{ payload.name || 'Starlink' }}</span>
                    <span>{{ payload.mass_kg ? payload.mass_kg + ' kg' : 'Masse N/A' }}</span>
                  </div>
                  <div class="text-gray-200 text-2xs">
                    {{ payload.type || 'Satellite' }} · {{ payload.orbit || 'N/A' }}
                  </div>
                </li>
              </ul>
            </div>
            
            <div v-if="launch.links?.webcast" class="w-full flex items-center justify-center">
              <div class="relative inline-block">
                <input 
                  type="checkbox" 
                  v-model="showVideo" 
                  class="sr-only"
                  id="video-toggle"
                >
                <label 
                  for="video-toggle"
                  class="block w-12 h-6 bg-blue-950 rounded-full cursor-pointer relative"
                >
                  <span 
                    class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform"
                    :class="showVideo ? 'translate-x-6' : ''"
                  ></span>
                </label>
              </div>
              <span class="ml-3 text-gray-300">Afficher la vidéo YouTube</span>
            </div>
          </div>
        </div>
        
        <div v-if="showVideo && launch.links?.webcast" class="mt-6 w-full">
          <iframe 
            :src="`https://www.youtube.com/embed/${getYoutubeId(launch.links.webcast)}`" 
            class="w-full aspect-video rounded"
            allowfullscreen
            frameborder="0"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  props: {
    launch: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const showVideo = ref(false)
    const launchpad = ref(null)
    const payloads = ref([])
    const loading = ref(true)
    
    onMounted(async () => {
      try {
        if (props.launch.launchpad) {
          const launchpadResponse = await axios.get(`https://api.spacexdata.com/v4/launchpads/${props.launch.launchpad}`)
          launchpad.value = launchpadResponse.data
        }
        
        if (props.launch.payloads && props.launch.payloads.length) {
          const payloadPromises = props.launch.payloads.map(id => {
            return axios.get(`https://api.spacexdata.com/v4/payloads/${id}`)
          })
          const payloadResponses = await Promise.all(payloadPromises)
          payloads.value = payloadResponses.map(response => response.data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données supplémentaires:', error)
      } finally {
        loading.value = false
      }
    })
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    const getLaunchStatus = (launch) => {
      if (launch.upcoming) return 'À venir'
      if (launch.success === true) return 'Réussi'
      if (launch.success === false) return 'Échoué'
      return 'Statut inconnu'
    }
    
    const getYoutubeId = (url) => {
      if (!url) return ''
      
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)
      
      return (match && match[2].length === 11) ? match[2] : ''
    }
    
    return {
      showVideo,
      launchpad,
      payloads,
      loading,
      formatDate,
      getLaunchStatus,
      getYoutubeId
    }
  }
}
</script>

<style scoped>
.transform {
  transition: transform 0.2s ease-in-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.fixed > div {
  animation: modalFadeIn 0.3s ease-out forwards;
}
</style>
