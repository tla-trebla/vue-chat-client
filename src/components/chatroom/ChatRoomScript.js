import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as ActionCable from '@rails/actioncable'

export default {
    setup() {
        const isDark = ref(true)
        const messages = ref([])
        const newMessage = ref('')
        const myId = Math.floor(Math.random() * 100000)

        const consumer = ActionCable.createConsumer('ws://localhost:3000/cable')
        let messagesChannel = null

        onMounted(() => {
            messagesChannel = consumer.subscriptions.create('MessagesChannel', {
                connected() {
                console.log('Connected to MessagesChannel')
                },
                received(data) {
                console.log('Received:', data)
                messages.value.push(data)
                },
                sendMessage(message) {
                this.perform('receive', message)
                },
            })
        })

        function sendMessage() {
            if (!newMessage.value.trim()) return

            messagesChannel.sendMessage({
                sender_id: myId,
                content: newMessage.value.trim(),
            })

            newMessage.value = ''
        }

        onBeforeUnmount(() => {
            if (messagesChannel) {
                consumer.subscriptions.remove(messagesChannel)
            }
        })

        return {
            isDark,
            messages,
            newMessage,
            sendMessage,
            myId
        }
    },
}