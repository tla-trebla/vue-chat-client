import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as ActionCable from '@rails/actioncable'

export default {
  setup() {
    const isDark = ref(true)
    const messages = ref([])
    const newMessage = ref('')
    const myId = Math.floor(Math.random() * 100000)
    
    const cableUrl = 'wss://rails-chat-api-production.up.railway.app/cable'
        
    const consumer = ActionCable.createConsumer(cableUrl)
    let messagesChannel = null
    
    onMounted(() => {
      messagesChannel = consumer.subscriptions.create('MessagesChannel', {
        connected() {
          console.log('Connected to MessagesChannel')
        },
        disconnected() {
          console.warn('Disconnected from MessagesChannel — retrying...')
        },
        rejected() {
          console.error('Subscription rejected by the server')
        },
        received(data) {
          console.log('Received:', data)
          messages.value.push(data)
        },
      })
    })
    
    function sendMessage() {
      const content = newMessage.value.trim()
      if (!content) return

      if (messagesChannel) {
        messagesChannel.perform('receive', {
          sender_id: myId,
          content: content,
        })
      } else {
        console.error('Cannot send — not connected to channel yet')
      }

      newMessage.value = ''
    }
    
    onBeforeUnmount(() => {
      if (messagesChannel) {
        consumer.subscriptions.remove(messagesChannel)
        console.log('🧹 Disconnected from MessagesChannel')
      }
    })

    return {
      isDark,
      messages,
      newMessage,
      sendMessage,
      myId,
    }
  },
}