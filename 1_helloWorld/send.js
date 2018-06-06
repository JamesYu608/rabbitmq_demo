const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const queue = 'myQueue'

    ch.assertQueue(queue, {durable: false})
    for (let i = 0; i < 10; i++) {
      const message = `This is message_${i}`
      ch.sendToQueue(queue, Buffer.from(message))
      console.log(` [x] Sent '${message}'`)
    }
    // 若同時有兩個consumer在等待，測試結果 (round-robin):
    // Consumer 1: 0, 2, 4, 6, 8
    // Consumer 2: 1, 3, 5, 7, 9
  })

  setTimeout(() => {
    conn.close()
    process.exit(0)
  }, 500)
})
