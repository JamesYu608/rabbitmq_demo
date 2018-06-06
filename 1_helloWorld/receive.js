const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const queue = 'myQueue'

    ch.assertQueue(queue, {durable: false})
    console.log(` [*] Waiting for messages in ${queue}.`)
    ch.consume(queue, message => {
      console.log(` [x] Received ${message.content.toString()}`)
    }, {noAck: true})
  })
})
