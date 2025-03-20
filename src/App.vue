<template>
  <div class="container mx-auto px-4 py-8 ">
    <h1 class="text-4xl font-bold text-center mb-16 mt-10 ">SpaceX Launches</h1>
    
    <div class="mb-10">
      <NextLaunch />
    </div>
    
    <div class="mb-6 flex justify-end">
      <select 
        v-model="filter" 
        @change="loadLaunches"
        class="bg-blue-900 border border-blue-950 text-white rounded-md px-4 py-2"
      >
        <option value="all">Tous les lancements</option>
        <option value="success">Lancements réussis</option>
        <option value="failure">Lancements échoués</option>
      </select>
    </div>
    
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
    
    <div v-else class="grid md:grid-cols-2 gap-4">
      <div 
        v-for="launch in launches" 
        :key="launch.id" 
        class="bg-blue-900 rounded-lg p-4 cursor-pointer hover:bg-blue-950 transition duration-200"
        @click="selectLaunch(launch)"
      >
        <div class="flex items-center">
          <img 
            v-if="launch.links?.patch?.small" 
            :src="launch.links.patch.small" 
            alt="Mission patch" 
            class="w-16 h-16 mr-4 rounded-full object-contain bg-gray-900"
          >
          <div v-else class="w-16 h-16 mr-4 flex items-center justify-center rounded-full bg-gray-900">
            <span>Error</span>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold">{{ launch.name }}</h3>
            <p class="text-white">{{ new Date(launch.date_utc).toLocaleDateString() }}</p>
            <span 
              class="inline-block px-2 py-1 text-xs rounded-full mt-1"
              :class="launch.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'"
            >
              {{ launch.success ? 'Succès' : 'Échec' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <LaunchModal 
      v-if="selectedLaunch" 
      :launch="selectedLaunch" 
      :launchpad="launchpad"
      :payloads="payloads"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import NextLaunch from './components/NextLaunch.vue'
import LaunchModal from './components/LaunchModal.vue'

export default {
  components: {
    NextLaunch,
    LaunchModal
  },
  setup() {
    const launches = ref([])
    const loading = ref(true)
    const filter = ref('all')
    const selectedLaunch = ref(null)
    const launchpad = ref(null)
    const payloads = ref([])
    
    const loadLaunches = async () => {
      loading.value = true
      
      try {
        const query = {
          options: {
            limit: 10,
            sort: {
              date_utc: 'desc'
            }
          }
        }
        
        if (filter.value === 'success') {
          query.query = { success: true }
        } else if (filter.value === 'failure') {
          query.query = { success: false }
        }
        
        const response = await axios.post('https://api.spacexdata.com/v5/launches/query', query)
        launches.value = response.data.docs
      } catch (error) {
        console.error('Error loading launches:', error)
      } finally {
        loading.value = false
      }
    }
    
    const selectLaunch = async (launch) => {
      selectedLaunch.value = launch
      
      try {
  
        if (launch.launchpad) {
          const launchpadResponse = await axios.get(`https://api.spacexdata.com/v5/launchpads/${launch.launchpad}`)
          launchpad.value = launchpadResponse.data
        }
        
        if (launch.payloads && launch.payloads.length > 0) {
          const payloadPromises = launch.payloads.map(id => 
            axios.get(`https://api.spacexdata.com/v5/payloads/${id}`)
          )
          const responses = await Promise.all(payloadPromises)
          payloads.value = responses.map(res => res.data)
        } else {
          payloads.value = []
        }
      } catch (error) {
        console.error('Error loading details:', error)
      }
    }
    
    const closeModal = () => {
      selectedLaunch.value = null
      launchpad.value = null
      payloads.value = []
    }
    
    onMounted(loadLaunches)
    
    return {
      launches,
      loading,
      filter,
      loadLaunches,
      selectedLaunch,
      launchpad,
      payloads,
      selectLaunch,
      closeModal
    }
  }
}
</script>
