const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel(function (err, ch) {
    const queue = 'taskQueue'
    const messages = [
      'First message.',
      'Second message..',
      'Third message...',
      'Fourth message....',
      'Fifth message.....',
    ]

    ch.assertQueue(queue, {durable: true}) // [Durable]: 確保queue是durable

    for (const message of messages) {
      ch.sendToQueue(queue, new Buffer(message), {persistent: true}) // [Durable] 確保message是durable
      console.log(` [x] Sent '${message}'`)
    }
  })

  setTimeout(function () {
    conn.close()
    process.exit(0)
  }, 500)
})
